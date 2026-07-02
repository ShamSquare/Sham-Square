import crypto from 'crypto';

const SALT_BYTES = 16;
const KEY_BYTES = 64;
const ITERATIONS = 100000;
const DIGEST = 'sha512';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
  const derived = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_BYTES, DIGEST).toString('hex');
  return `${salt}$${derived}`;
}

export function verifyPassword(password: string, hashed: string): boolean {
  try {
    const [salt, derived] = hashed.split('$');
    if (!salt || !derived) return false;
    const check = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_BYTES, DIGEST).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(check, 'hex'), Buffer.from(derived, 'hex'));
  } catch (err) {
    return false;
  }
}

export default { hashPassword, verifyPassword };
