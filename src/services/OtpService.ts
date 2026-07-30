/**
 * OTP Service
 * Handles OTP generation, storage, verification, and SMS delivery via SMS-Gate
 *
 * All OTP logic is implemented server-side. Never exposes OTP values in API responses.
 */

import crypto from 'crypto';
import logger from '../utils/logger.util';
import { smsGateService } from './SmsGateService';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;
const MAX_RESENDS = 3;
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute cooldown

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  resendCount: number;
}

// In-memory OTP store. For production with multiple server instances,
// replace with Redis or similar distributed store.
const otpStore = new Map<string, OtpRecord>();

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Generate a cryptographically secure random numeric OTP code
 */
function generateOtp(length: number): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const range = max - min + 1;

  // Use crypto.randomBytes for cryptographic randomness
  const bytes = crypto.randomBytes(4);
  const randomInt = bytes.readUInt32BE(0);
  const otp = (min + (randomInt % range)).toString();

  return otp.padStart(length, '0');
}

/**
 * Validate phone number is in E.164 format
 */
function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone);
}

/**
 * Normalize phone number (strip spaces, dashes, parens)
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '');
}

// ─────────────────────────────────────────────
// OTP Service
// ─────────────────────────────────────────────

export const otpService = {
  /**
   * Send OTP to a phone number via SMS-Gate
   */
  async sendOtp(
    phone: string,
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const normalizedPhone = normalizePhone(phone);

    if (!isValidE164(normalizedPhone)) {
      return { success: false, error: 'Invalid phone number format. Use E.164 format (e.g. +963XXXXXXXX).' };
    }

    const now = Date.now();
    const existing = otpStore.get(normalizedPhone);

    // Check cooldown
    if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil(
        (RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000,
      );
      return {
        success: false,
        error: `Please wait ${remainingSeconds} seconds before requesting a new code.`,
      };
    }

    // Check max resends
    if (existing && existing.resendCount >= MAX_RESENDS) {
      return {
        success: false,
        error: 'Maximum OTP requests reached. Please try again later.',
      };
    }

    // Generate secure OTP and replace any previous OTP for this phone
    const code = generateOtp(OTP_LENGTH);
    const expiresAt = now + OTP_EXPIRY_MS;

    // Store OTP (replaces previous)
    otpStore.set(normalizedPhone, {
      code,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
      resendCount: (existing?.resendCount ?? -1) + 1, // First send = 0 resends
    });

    logger.info('[OTP] Code generated', {
      phone: normalizedPhone.slice(0, 7) + '****',
      expiresAt: new Date(expiresAt).toISOString(),
      resendCount: (existing?.resendCount ?? -1) + 1,
    });

    // Send via SMS-Gate
    const smsResult = await smsGateService.sendSms(
      normalizedPhone,
      `The code is: ${code}. It expires in 5 mins`,
    );

    if (!smsResult.success) {
      // Remove the OTP if SMS sending failed
      otpStore.delete(normalizedPhone);
      logger.error('[OTP] Failed to send SMS', {
        phone: normalizedPhone.slice(0, 7) + '****',
        error: smsResult.error,
      });
      return { success: false, error: smsResult.error || 'Unable to send OTP' };
    }

    logger.info('[OTP] Sent successfully', {
      phone: normalizedPhone.slice(0, 7) + '****',
      messageId: smsResult.messageId,
    });

    return { success: true, message: 'Verification code sent successfully.' };
  },

  /**
   * Verify an OTP code
   */
  async verifyOtp(
    phone: string,
    code: string,
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const normalizedPhone = normalizePhone(phone);

    if (!isValidE164(normalizedPhone)) {
      return { success: false, error: 'Invalid phone number format.' };
    }

    if (!code || code.length !== OTP_LENGTH || !/^\d+$/.test(code)) {
      return { success: false, error: 'Invalid verification code format.' };
    }

    const record = otpStore.get(normalizedPhone);

    if (!record) {
      return { success: false, error: 'No verification code found. Please request a new one.' };
    }

    const now = Date.now();

    // Check expiry
    if (now > record.expiresAt) {
      otpStore.delete(normalizedPhone);
      return { success: false, error: 'Verification code has expired. Please request a new one.' };
    }

    // Check max attempts (brute force protection)
    if (record.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(normalizedPhone);
      return { success: false, error: 'Too many failed attempts. Please request a new code.' };
    }

    // Increment attempts BEFORE checking code (prevents timing side-channel)
    record.attempts++;

    if (record.code !== code) {
      logger.info('[OTP] Invalid code', {
        phone: normalizedPhone.slice(0, 7) + '****',
        attemptsRemaining: MAX_ATTEMPTS - record.attempts,
      });
      return { success: false, error: 'Invalid verification code. Please try again.' };
    }

    // Success - delete OTP for one-time use
    otpStore.delete(normalizedPhone);

    logger.info('[OTP] Verified successfully', {
      phone: normalizedPhone.slice(0, 7) + '****',
    });

    return { success: true, message: 'Phone number verified successfully.' };
  },

  /**
   * Clear OTP for a phone number
   */
  clearOtp(phone: string): void {
    const normalizedPhone = normalizePhone(phone);
    otpStore.delete(normalizedPhone);
  },

  /**
   * Check if a phone has a pending OTP
   */
  hasPendingOtp(phone: string): boolean {
    const normalizedPhone = normalizePhone(phone);
    const record = otpStore.get(normalizedPhone);
    if (!record) return false;
    return Date.now() < record.expiresAt;
  },

  /**
   * Get remaining time for a pending OTP (in seconds)
   */
  getRemainingTime(phone: string): number {
    const normalizedPhone = normalizePhone(phone);
    const record = otpStore.get(normalizedPhone);
    if (!record) return 0;
    return Math.max(0, Math.ceil((record.expiresAt - Date.now()) / 1000));
  },

  /**
   * Clean up expired OTPs (periodic maintenance)
   */
  cleanupExpired(): void {
    const now = Date.now();
    let count = 0;
    for (const [phone, record] of otpStore.entries()) {
      if (record.expiresAt < now) {
        otpStore.delete(phone);
        count++;
      }
    }
    if (count > 0) {
      logger.debug('[OTP] Cleaned up expired records', { count });
    }
  },
};

// Periodic cleanup every 5 minutes
setInterval(() => {
  otpService.cleanupExpired();
}, 5 * 60 * 1000);
