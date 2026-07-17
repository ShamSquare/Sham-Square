import envConfig from '../config/env.config';

export interface SmsProvider {
  sendSms(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export interface OtpConfig {
  length: number;
  expiresInMinutes: number;
  maxAttempts: number;
  resendCooldownMinutes: number;
}

export const DEFAULT_OTP_CONFIG: OtpConfig = {
  length: 6,
  expiresInMinutes: 10,
  maxAttempts: 3,
  resendCooldownMinutes: 1,
};

interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

const otpStore: Record<string, OtpRecord> = {};

function generateOtp(length: number): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

export class AndroidSmsGateway implements SmsProvider {
  private gatewayUrl: string;
  private username: string;
  private password: string;
  private timeout: number;

  constructor() {
    this.gatewayUrl = envConfig.sms.gatewayUrl.replace(/\/$/, '');
    this.username = envConfig.sms.username;
    this.password = envConfig.sms.password;
    this.timeout = envConfig.sms.timeout;
  }

  async sendSms(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const params = new URLSearchParams({
        phone,
        message,
      });

      if (this.username && this.password) {
        params.append('username', this.username);
        params.append('password', this.password);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.gatewayUrl}/send?${params.toString()}`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success !== false) {
        return {
          success: true,
          messageId: data.messageId || data.id || undefined,
        };
      }

      return {
        success: false,
        error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'SMS Gateway request timeout' };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown SMS Gateway error',
      };
    }
  }
}

export class MockSmsProvider implements SmsProvider {
  async sendSms(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log(`[MOCK SMS] To: ${phone}, Message: ${message}`);
    return { success: true, messageId: `mock-${Date.now()}` };
  }
}

export function getSmsProvider(): SmsProvider {
  if (!envConfig.sms.enabled) {
    return new MockSmsProvider();
  }

  switch (envConfig.sms.gatewayMode) {
    case 'android':
      return new AndroidSmsGateway();
    case 'mock':
    default:
      return new MockSmsProvider();
  }
}

export class OtpService {
  private provider: SmsProvider;
  private config: OtpConfig;

  constructor(provider?: SmsProvider, config?: Partial<OtpConfig>) {
    this.provider = provider || getSmsProvider();
    this.config = { ...DEFAULT_OTP_CONFIG, ...config };
  }

  async sendOtp(phone: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const normalizedPhone = this.normalizePhone(phone);
    const now = Date.now();
    const existing = otpStore[normalizedPhone];

    if (existing && now - existing.lastSentAt < this.config.resendCooldownMinutes * 60 * 1000) {
      const remainingSeconds = Math.ceil(
        (existing.lastSentAt + this.config.resendCooldownMinutes * 60 * 1000 - now) / 1000
      );
      return {
        success: false,
        error: `Please wait ${remainingSeconds} seconds before requesting a new code`,
      };
    }

    const code = generateOtp(this.config.length);
    const expiresAt = now + this.config.expiresInMinutes * 60 * 1000;

    otpStore[normalizedPhone] = {
      code,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
    };

    const message = `Your verification code is: ${code}. Valid for ${this.config.expiresInMinutes} minutes.`;
    const result = await this.provider.sendSms(normalizedPhone, message);

    if (!result.success) {
      delete otpStore[normalizedPhone];
      return { success: false, error: result.error || 'Failed to send SMS' };
    }

    return { success: true, message: 'OTP sent successfully' };
  }

  async verifyOtp(phone: string, code: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const normalizedPhone = this.normalizePhone(phone);
    const record = otpStore[normalizedPhone];

    if (!record) {
      return { success: false, error: 'No verification code found. Please request a new one.' };
    }

    const now = Date.now();

    if (now > record.expiresAt) {
      delete otpStore[normalizedPhone];
      return { success: false, error: 'Verification code has expired. Please request a new one.' };
    }

    if (record.attempts >= this.config.maxAttempts) {
      delete otpStore[normalizedPhone];
      return { success: false, error: 'Too many failed attempts. Please request a new code.' };
    }

    record.attempts++;

    if (record.code !== code) {
      return { success: false, error: 'Invalid verification code' };
    }

    delete otpStore[normalizedPhone];
    return { success: true, message: 'Phone number verified successfully' };
  }

  async resendOtp(phone: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const normalizedPhone = this.normalizePhone(phone);
    delete otpStore[normalizedPhone];
    return this.sendOtp(phone);
  }

  hasPendingOtp(phone: string): boolean {
    const normalizedPhone = this.normalizePhone(phone);
    const record = otpStore[normalizedPhone];
    if (!record) return false;
    return Date.now() < record.expiresAt;
  }

  getRemainingTime(phone: string): number {
    const normalizedPhone = this.normalizePhone(phone);
    const record = otpStore[normalizedPhone];
    if (!record) return 0;
    const remaining = Math.max(0, record.expiresAt - Date.now());
    return Math.ceil(remaining / 1000);
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
  }

  clearOtp(phone: string): void {
    const normalizedPhone = this.normalizePhone(phone);
    delete otpStore[normalizedPhone];
  }
}

export const otpService = new OtpService();