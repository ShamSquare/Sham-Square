import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

export function verifyPassword(password: string, hashed: string): boolean {
  try {
    return bcrypt.compareSync(password, hashed);
  } catch (err) {
    return false;
  }
}

export default { hashPassword, verifyPassword };
