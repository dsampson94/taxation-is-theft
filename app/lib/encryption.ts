import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const PREFIX = 'ENC$';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) return Buffer.alloc(0);
  return Buffer.from(key, 'hex');
}

export function encrypt(text: string): string {
  const key = getKey();
  if (key.length === 0) return text;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  const payload = Buffer.concat([iv, tag, encrypted]);
  return PREFIX + payload.toString('base64');
}

export function decrypt(text: string): string {
  if (!isEncrypted(text)) return text;

  const key = getKey();
  if (key.length === 0) return text;

  try {
    const payload = Buffer.from(text.slice(PREFIX.length), 'base64');
    const iv = payload.subarray(0, IV_LENGTH);
    const tag = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = payload.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return text;
  }
}

export function isEncrypted(text: string): boolean {
  return typeof text === 'string' && text.startsWith(PREFIX);
}
