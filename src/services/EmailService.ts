/**
 * Email Service
 * Handles email verification and notifications
 */

import envConfig from '../config/env.config';

interface EmailProvider {
  sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }>;
}

interface VerificationEmailData {
  email: string;
  code: string;
}

const verificationCodeStore: Record<string, { code: string; expiresAt: number; attempts: number,lastSentAt: number,resendCount: number }> = {};

const VERIFICATION_CODE_LENGTH = 6;
const VERIFICATION_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute
const MAX_RESENDS = 3;

function generateVerificationCode(): string {
  return Math.floor(10 ** (VERIFICATION_CODE_LENGTH - 1) + Math.random() * 9 * 10 ** (VERIFICATION_CODE_LENGTH - 1)).toString();
}

class ConsoleEmailProvider implements EmailProvider {
  async sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
    console.info(`[EMAIL] To: ${to}, Subject: ${subject}`);
    console.info(`[EMAIL] HTML: ${html}`);
    return { success: true };
  }
}

class SmtpEmailProvider implements EmailProvider {
  private host: string;
  private port: number;
  private email: string;
  private password: string;

  constructor() {
    this.host = envConfig.email.smtpHost;
    this.port = envConfig.email.smtpPort;
    this.email = envConfig.email.smtpEmail;
    this.password = envConfig.email.smtpPassword;
  }

  async sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
    // In a real implementation, you would use nodemailer or similar
    // For now, we'll just log and return success
    console.info(`[SMTP EMAIL] To: ${to}, Subject: ${subject}`);
    return { success: true };
  }
}

function getEmailProvider(): EmailProvider {
  // In production, you would use the SMTP provider
  // For development, use console provider
  return new ConsoleEmailProvider();
}

export const emailService = {
  /**
   * Send email verification code
   */
  async sendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const now = Date.now();
    const existing = verificationCodeStore[normalizedEmail];

    if (existing && now - existing.lastSentAt < 60000) {
      return {
        success: false,
        error: 'Please wait 1 minute before requesting a new code',
      };
    }

    if (existing && existing.resendCount >= 3) {
      return {
        success: false,
        error: 'Maximum resend attempts reached. Please try again later.',
      };
    }

    const code = generateVerificationCode();
    const expiresAt = now + VERIFICATION_EXPIRY_MS;

    verificationCodeStore[normalizedEmail] = {
      code,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
      resendCount: (existing?.resendCount || 0) + 1,
    };

    const subject = 'Verify your email address';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4f46e5;">Email Verification</h2>
            <p>Your verification code is:</p>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 8px;">${code}</span>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 12px; color: #64748b;">Sham Presto - Your trusted shopping companion</p>
          </div>
        </body>
      </html>
    `;

    const provider = getEmailProvider();
    const result = await provider.sendEmail(email, subject, html);

    if (!result.success) {
      delete verificationCodeStore[normalizedEmail];
    }

    return result;
  },

  /**
   * Verify email code
   */
  async verifyEmail(code: string): Promise<{ success: boolean; error?: string }> {
    // Find the email by code
    let foundEmail: string | null = null;
    let record: typeof verificationCodeStore[string] | null = null;

    for (const [email, rec] of Object.entries(verificationCodeStore)) {
      if (rec.code === code) {
        foundEmail = email;
        record = rec;
        break;
      }
    }

    if (!foundEmail || !record) {
      return { success: false, error: 'Invalid or expired verification code' };
    }

    const now = Date.now();

    if (now > record.expiresAt) {
      delete verificationCodeStore[foundEmail];
      return { success: false, error: 'Verification code has expired. Please request a new one.' };
    }

    if (record.attempts >= 3) {
      delete verificationCodeStore[foundEmail];
      return { success: false, error: 'Too many failed attempts. Please request a new code.' };
    }

    record.attempts++;

    if (record.code !== code) {
      return { success: false, error: 'Invalid verification code' };
    }

    // Success - clean up
    delete verificationCodeStore[foundEmail];
    return { success: true };
  },

  /**
   * Resend verification code
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const now = Date.now();
    const existing = verificationCodeStore[normalizedEmail];

    if (!existing) {
      return { success: false, error: 'No pending verification found. Please request a new code.' };
    }

    if (now - existing.lastSentAt < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - existing.lastSentAt)) / 1000);
      return { success: false, error: `Please wait ${waitSeconds} seconds before requesting a new code` };
    }

    if (existing.resendCount >= 3) {
      return { success: false, error: 'Maximum resend attempts reached. Please try again later.' };
    }

    const code = generateVerificationCode();
    const expiresAt = now + VERIFICATION_EXPIRY_MS;

    verificationCodeStore[normalizedEmail] = {
      code,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
      resendCount: existing.resendCount + 1,
    };

    const subject = 'Verify your email address';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4f46e5;">Email Verification (Resent)</h2>
            <p>Your new verification code is:</p>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 8px;">${code}</span>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </body>
      </html>
    `;

    const provider = getEmailProvider();
    const result = await provider.sendEmail(email, subject, html);

    if (!result.success) {
      // Don't delete the store on failure, just return error
      return { success: false, error: result.error || 'Failed to send email' };
    }

    return { success: true };
  },

  /**
   * Clean up expired codes (can be called periodically)
   */
  cleanupExpired(): void {
    const now = Date.now();
    for (const email of Object.keys(verificationCodeStore)) {
      if (verificationCodeStore[email].expiresAt < now) {
        delete verificationCodeStore[email];
      }
    }
  },
};

// Periodic cleanup
setInterval(() => {
  emailService.cleanupExpired();
}, 5 * 60 * 1000); // Every 5 minutes