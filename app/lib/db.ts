import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt, isEncrypted } from './encryption';

// Fields encrypted at rest with AES-256-GCM.
// Protects against database breaches — data is unreadable without ENCRYPTION_KEY.
const ENCRYPTED_FIELDS: Record<string, string[]> = {
  User: ['idNumber', 'taxNumber'],
  Transaction: ['description', 'notes', 'accountNumber'],
  Deduction: ['description', 'proofNotes'],
};

function encryptObj(model: string, data: any): any {
  const fields = ENCRYPTED_FIELDS[model];
  if (!fields || !data) return data;
  const copy = { ...data };
  for (const f of fields) {
    if (copy[f] && typeof copy[f] === 'string' && !isEncrypted(copy[f])) {
      copy[f] = encrypt(copy[f]);
    }
  }
  return copy;
}

function decryptObj(model: string, data: any): any {
  const fields = ENCRYPTED_FIELDS[model];
  if (!fields || !data) return data;
  for (const f of fields) {
    if (data[f] && typeof data[f] === 'string') {
      try { data[f] = decrypt(data[f]); } catch { /* leave as-is */ }
    }
  }
  return data;
}

function buildPrismaClient() {
  const client = new PrismaClient();

  client.$use(async (params, next) => {
    const model = params.model || '';

    // Encrypt on writes
    if (['create', 'update', 'upsert'].includes(params.action)) {
      if (params.args.data) params.args.data = encryptObj(model, params.args.data);
      if (params.action === 'upsert' && params.args.create) {
        params.args.create = encryptObj(model, params.args.create);
      }
    }
    if (params.action === 'createMany' && params.args.data) {
      if (Array.isArray(params.args.data)) {
        params.args.data = params.args.data.map((d: any) => encryptObj(model, d));
      }
    }

    const result = await next(params);

    // Decrypt on reads
    if (result) {
      if (Array.isArray(result)) {
        result.forEach((item: any) => decryptObj(model, item));
      } else if (typeof result === 'object') {
        decryptObj(model, result);
      }
    }

    return result;
  });

  return client;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || buildPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
