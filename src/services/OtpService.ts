/**
 * OTP Service
 * Handles OTP generation, storage, verification, and SMS delivery via Android SMS Gateway
 */

import envConfig from '../config/env.config.ts';

interface IOtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  resendCount: number;
}

const otpStore: Record<string, IOtpRecord> = {};

// Configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute
const MAX_RESENDS = 3;

/**
 * Generate a random numeric OTP code
 */
function generateOtp(): string {
  return Math.floor(10 ** (OTP_LENGTH - 1) + Math.random() * 9 * 10 ** (OTP_LENGTH - 1)).toString();
}

/**
 * Send OTP via Android SMS Gateway
 */
async function sendSmsViaGateway(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  if (!envConfig.sms.enabled) {
    console.info(`[SMS Disabled] OTP for ${phone}: ${code}`);
    return { success: true };
  }

  try {
    const url = `${envConfig.sms.gatewayUrl}/api/send`;
    const auth = Buffer.from(`${envConfig.sms.username}:${envConfig.sms.password}`).toString('base64');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), envConfig.sms.timeout);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        phoneNumber: phone,
        message: `Your verification code is: ${code}. Valid for 10 minutes.`,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`SMS Gateway error: ${response.status} - ${errorText}`);
    }

    const result = await response.json().catch(() => ({}));
    return { success: true, error: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown SMS error';
    console.error('Failed to send SMS:', message);
    return { success: false, error: message };
  }
}

/**
 * OTP Service
 */
export const otpService = {
  /**
   * Send OTP to a phone number
   */
  async sendOtp(phone: string): Promise<{ success: boolean; message: string; error?: string }> {
    const normalizedPhone = phone.replace(/\s+/g, '').trim();
    const now = Date.now();

    // Check resend cooldown
    const existing = otpStore[normalizedPhone];
    if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
      return {
        success: false,
        message: '',
        error: `Please wait ${waitSeconds} seconds before requesting a new code`,
      };
    }

    // Check max resends
    if (existing && existing.resendCount >= MAX_RESENDS) {
      return {
        success: false,
        message: '',
        error: 'Maximum resend attempts reached. Please try again later.',
      };
    }

    const code = generateOtp();
    const expiresAt = now + OTP_EXPIRY_MS;

    // Store OTP
    otpStore[normalizedPhone] = {
      code,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
      resendCount: (existing?.resendCount || 0) + 1,
    };

    // Send via SMS Gateway
    const smsResult = await sendSmsViaGateway(normalizedPhone, code);
    if (!smsResult.success) {
      delete otpStore[normalizedPhone];
      return {
        success: false,
        message: '',
        error: `Failed to send SMS: ${smsResult.error}`,
      };
    }

    return {
      success: true,
      message: 'Verification code sent successfully',
    };
  },

  /**
   * Verify OTP code
   */
  async verifyOtp(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
    const normalizedPhone = phone.replace(/\s+/g, '').trim();
    const record = otpStore[normalizedPhone];
    const now = Date.now();

    if (!record) {
      return { success: false, error: 'No verification code found. Please request a new one.' };
    }

    if (record.expiresAt < now) {
      delete otpStore[normalizedPhone];
      return { success: false, error: 'Verification code has expired. Please request a new one.' };
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      delete otpStore[normalizedPhone];
      return { success: false, error: 'Too many failed attempts. Please request a new code.' };
    }

    if (record.code !== code) {
      record.attempts++;
      return { success: false, error: 'Invalid verification code. Please try again.' };
    }

    // Success - clean up
    delete otpStore[normalizedPhone];
    return { success: true };
  },

  /**
   * Resend OTP (with cooldown and rate limiting)
   */
  async resendOtp(phone: string): Promise<{ success: boolean; message: string; error?: string }> {
    const normalizedPhone = phone.replace(/\s+/g, '').trim();
    const record = otpStore[normalizedPhone];
    const now = Date.now();

    if (!record) {
      return { success: false, message: '', error: 'No pending verification. Please request a new code.' };
    }

    // Check cooldown
    if (now - record.lastSentAt < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - record.lastSentAt)) / 1000);
      return {
        success: false,
        message: '',
        error: `Please wait ${waitSeconds} seconds before requesting a new code`,
      };
    }

    // Check max resends
    if (record.resendCount >= MAX_RESENDS) {
      return {
        success: false,
        message: '',
        error: 'Maximum resend attempts reached. Please try again later.',
      };
    }

    const code = generateOtp();
    const expiresAt = now + OTP_EXPIRY_MS;

    // Update record
    otpStore[normalizedPhone] = {
      code,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
      resendCount: record.resendCount + 1,
    };

    // Send via SMS Gateway
    const smsResult = await sendSmsViaGateway(normalizedPhone, code);
    if (!smsResult.success) {
      return {
        success: false,
        message: '',
        error: `Failed to send SMS: ${smsResult.error}`,
      };
    }

    return {
      success: true,
      message: 'New verification code sent',
    };
  },

  /**
   * Clean up expired OTPs (can be called periodically)
   */
  cleanupExpired(): void {
    const now = Date.now();
    for (const phone of Object.keys(otpStore)) {
      if (otpStore[phone].expiresAt < now) {
        delete otpStore[phone];
      }
    }
  },

  /**
   * Get OTP info for debugging (without revealing the code)
   */
  getOtpInfo(phone: string): { exists: boolean; expiresAt?: number; attempts?: number; resendCount?: number } | null {
    const normalizedPhone = phone.replace(/\s+/g, '').trim();
    const record = otpStore[normalizedPhone];
    if (!record) return null;
    return {
      exists: true,
      expiresAt: record.expiresAt,
      attempts: record.attempts,
      resendCount: record.resendCount,
    };
  },
};

// Periodic cleanup every 5 minutes
setInterval(() => {
  otpService.cleanupExpired();
}, 5 * 60 * 1000);