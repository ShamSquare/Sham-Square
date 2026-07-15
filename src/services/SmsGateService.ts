/**
 * SMS-Gate Service
 * Official SMS-Gate API integration using JWT authentication
 *
 * API Endpoints (official docs):
 *   POST /3rdparty/v1/auth/token   - Authentication
 *   POST /3rdparty/v1/messages     - Send SMS
 */

import envConfig from '../config/env.config.ts';
import logger from '../utils/logger.util.ts';

const SMS_GATE_BASE_URL = 'https://api.sms-gate.app';

interface TokenResponse {
  id: string;
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

interface SendMessageResponse {
  id: string;
  status: string;
  [key: string]: unknown;
}

class SmsGateService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: Date | null = null;
  private tokenPromise: Promise<void> | null = null;

  /**
   * Authenticate with SMS-Gate using Basic Auth
   * POST /3rdparty/v1/auth/token
   */
  private async authenticate(): Promise<void> {
    const { username, password } = envConfig.sms;

    if (!username || !password) {
      throw new Error('SMS-Gate credentials not configured in environment');
    }

    logger.info('[SMS-Gate] Authenticating...');

    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

    const response = await fetch(`${SMS_GATE_BASE_URL}/3rdparty/v1/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        ttl: 3600,
        scopes: ['messages:send'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      logger.error('[SMS-Gate] Authentication failed', {
        status: response.status,
        error: errorText,
      });
      throw new Error(`SMS-Gate authentication failed (${response.status})`);
    }

    const data: TokenResponse = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.tokenExpiresAt = new Date(data.expires_at);

    logger.info('[SMS-Gate] Authenticated successfully', {
      expiresAt: data.expires_at,
    });
  }

  /**
   * Refresh the access token using the refresh token
   * POST /3rdparty/v1/auth/token/refresh
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      this.accessToken = null;
      return this.authenticate();
    }

    logger.info('[SMS-Gate] Refreshing token...');

    const response = await fetch(
      `${SMS_GATE_BASE_URL}/3rdparty/v1/auth/token/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.refreshToken}`,
        },
      },
    );

    if (!response.ok) {
      logger.warn('[SMS-Gate] Token refresh failed, re-authenticating');
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiresAt = null;
      return this.authenticate();
    }

    const data: TokenResponse = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.tokenExpiresAt = new Date(data.expires_at);

    logger.info('[SMS-Gate] Token refreshed', { expiresAt: data.expires_at });
  }

  /**
   * Ensure a valid token is available, refreshing if expired or near expiry
   */
  private async ensureValidToken(): Promise<string> {
    // If another auth call is in progress, wait for it
    if (this.tokenPromise) {
      await this.tokenPromise;
    }

    const now = new Date();
    const isExpired = !this.tokenExpiresAt || now >= this.tokenExpiresAt;
    const isNearExpiry =
      this.tokenExpiresAt &&
      new Date(now.getTime() + 5 * 60 * 1000) >= this.tokenExpiresAt;

    if (!this.accessToken || isExpired) {
      this.tokenPromise = this.authenticate();
      await this.tokenPromise;
      this.tokenPromise = null;
    } else if (isNearExpiry && this.refreshToken) {
      this.tokenPromise = this.refreshAccessToken();
      await this.tokenPromise;
      this.tokenPromise = null;
    }

    return this.accessToken!;
  }

  /**
   * Send an SMS message via SMS-Gate
   * POST /3rdparty/v1/messages
   */
  async sendSms(
    phoneNumber: string,
    message: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const token = await this.ensureValidToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), envConfig.sms.timeout);

      const response = await fetch(
        `${SMS_GATE_BASE_URL}/3rdparty/v1/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            phoneNumbers: [phoneNumber],
            textMessage: { text: message },
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      // Handle 401 - token expired, retry once with fresh token
      if (response.status === 401) {
        logger.info('[SMS-Gate] Token expired, refreshing and retrying');
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiresAt = null;

        const newToken = await this.ensureValidToken();
        const retryResponse = await fetch(
          `${SMS_GATE_BASE_URL}/3rdparty/v1/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newToken}`,
            },
            body: JSON.stringify({
              phoneNumbers: [phoneNumber],
              textMessage: { text: message },
            }),
          },
        );

        if (!retryResponse.ok) {
          const errorText = await retryResponse.text().catch(() => 'Unknown error');
          logger.error('[SMS-Gate] Send failed after token refresh', {
            status: retryResponse.status,
            error: errorText,
          });
          return { success: false, error: 'Unable to send SMS' };
        }

        const retryData: SendMessageResponse = await retryResponse.json();
        logger.info('[SMS-Gate] SMS sent after token refresh', {
          messageId: retryData.id,
        });
        return { success: true, messageId: retryData.id };
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        logger.error('[SMS-Gate] Send failed', {
          status: response.status,
          error: errorText,
        });
        return { success: false, error: 'Unable to send SMS' };
      }

      const data: SendMessageResponse = await response.json();
      logger.info('[SMS-Gate] SMS sent successfully', {
        messageId: data.id,
      });
      return { success: true, messageId: data.id };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          logger.error('[SMS-Gate] Request timed out');
          return {
            success: false,
            error: 'SMS gateway request timed out. Please try again.',
          };
        }

        const msg = error.message;
        if (
          msg.includes('fetch') ||
          msg.includes('ENOTFOUND') ||
          msg.includes('ECONNREFUSED') ||
          msg.includes('network')
        ) {
          logger.error('[SMS-Gate] Network error', { error: msg });
          return {
            success: false,
            error: 'Unable to connect to SMS gateway. Please try again later.',
          };
        }

        logger.error('[SMS-Gate] Unknown error', { error: msg });
      }

      return { success: false, error: 'Unable to send SMS' };
    }
  }
}

export const smsGateService = new SmsGateService();
