const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf8');
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const PREFIX = 'ENC$';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) return null;
  return Buffer.from(key, 'hex');
}

function decrypt(text) {
  if (!text || !text.startsWith(PREFIX)) return text;
  const key = getKey();
  if (!key) return text;
  try {
    const payload = Buffer.from(text.slice(PREFIX.length), 'base64');
    const iv = payload.subarray(0, IV_LENGTH);
    const tag = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = payload.subarray(IV_LENGTH + TAG_LENGTH);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  } catch { return text; }
}

async function main() {
  const p = new PrismaClient();
  const query = process.argv[2] || 'meyer';
  
  const txs = await p.transaction.findMany({
    select: { description: true, date: true, amount: true, type: true },
    orderBy: { date: 'desc' },
  });

  const re = new RegExp(query, 'i');
  const matches = txs
    .map(t => ({ ...t, description: decrypt(t.description) }))
    .filter(t => re.test(t.description));

  if (matches.length === 0) {
    console.log('No matches for: ' + query);
  } else {
    for (const m of matches) {
      const d = new Date(m.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
      const amt = Math.abs(Number(m.amount)).toFixed(2);
      console.log(`${d} | R ${amt} | ${m.type} | ${m.description}`);
    }
  }
  await p.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
