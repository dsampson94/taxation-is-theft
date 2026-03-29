// Context accumulation system for TIT Tax
// Builds a growing vendor dictionary per tax year that the AI uses on each request

export interface VendorMapping {
  category: string;
  deductible: boolean;
  pct: number;
  count: number; // number of times seen
  userOverride?: boolean; // if user manually set this
  note?: string;
}

export interface TaxYearContext {
  vendorMap: Record<string, VendorMapping>;
  incomeSources: string[];
  userCorrections: Array<{
    vendor: string;
    from: { category: string; deductible: boolean; pct: number };
    to: { category: string; deductible: boolean; pct: number };
    note?: string;
  }>;
  analysisNotes: string;
  lastUpdated: string;
}

/** Normalize a vendor/description to a stable key for matching */
function normalizeVendor(description: string): string {
  return description
    .toUpperCase()
    .replace(/\d{2,}/g, '') // remove long numbers (dates, refs)
    .replace(/[^A-Z\s]/g, '') // keep only letters and spaces
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 3) // first 3 words (e.g. "WOOLWORTHS SANDTON CITY" → "WOOLWORTHS SANDTON CITY")
    .join(' ');
}

/** Build context from a set of transactions (typically one month's worth) */
export function buildContextFromTransactions(transactions: any[]): TaxYearContext {
  const vendorMap: Record<string, VendorMapping> = {};
  const incomeSources: string[] = [];

  for (const tx of transactions) {
    const key = normalizeVendor(tx.description || '');
    if (!key || key.length < 3) continue;

    if (tx.type === 'INCOME') {
      if (!incomeSources.includes(key)) {
        incomeSources.push(key);
      }
    }

    const existing = vendorMap[key];
    if (existing) {
      existing.count++;
      // If user override, that takes priority
      if (tx.userOverride) {
        existing.category = tx.userCategory || tx.category;
        existing.deductible = tx.isDeductible;
        existing.pct = tx.deductiblePct || 0;
        existing.userOverride = true;
      }
    } else {
      vendorMap[key] = {
        category: tx.userCategory || tx.category || 'OTHER',
        deductible: Boolean(tx.isDeductible),
        pct: tx.deductiblePct || 0,
        count: 1,
        userOverride: Boolean(tx.userOverride),
      };
    }
  }

  return {
    vendorMap,
    incomeSources,
    userCorrections: [],
    analysisNotes: '',
    lastUpdated: new Date().toISOString(),
  };
}

/** Merge new context into existing context, preserving user corrections */
export function mergeContext(
  existing: TaxYearContext | null,
  incoming: TaxYearContext
): TaxYearContext {
  if (!existing) return incoming;

  const merged: TaxYearContext = {
    vendorMap: { ...existing.vendorMap },
    incomeSources: [...existing.incomeSources],
    userCorrections: [...existing.userCorrections],
    analysisNotes: existing.analysisNotes,
    lastUpdated: new Date().toISOString(),
  };

  // Merge incoming vendors
  for (const [key, value] of Object.entries(incoming.vendorMap)) {
    const ex = merged.vendorMap[key];
    if (ex) {
      ex.count += value.count;
      // User overrides always win
      if (value.userOverride && !ex.userOverride) {
        ex.category = value.category;
        ex.deductible = value.deductible;
        ex.pct = value.pct;
        ex.userOverride = true;
      }
    } else {
      merged.vendorMap[key] = { ...value };
    }
  }

  // Merge income sources (deduplicate)
  for (const src of incoming.incomeSources) {
    if (!merged.incomeSources.includes(src)) {
      merged.incomeSources.push(src);
    }
  }

  // Cap vendor map size to prevent context bloat (keep top 200 by count)
  const entries = Object.entries(merged.vendorMap);
  if (entries.length > 200) {
    const sorted = entries.sort((a, b) => {
      // User overrides first, then by count
      if (a[1].userOverride && !b[1].userOverride) return -1;
      if (!a[1].userOverride && b[1].userOverride) return 1;
      return b[1].count - a[1].count;
    });
    merged.vendorMap = Object.fromEntries(sorted.slice(0, 200));
  }

  return merged;
}

/** Convert context to readable text for the AI system prompt */
export function contextToPromptText(context: TaxYearContext): string {
  if (!context || !context.vendorMap) return '';

  const entries = Object.entries(context.vendorMap);
  if (entries.length === 0) return '';

  const lines: string[] = [];
  lines.push('KNOWN VENDOR CLASSIFICATIONS FROM PREVIOUS ANALYSES:');
  lines.push('(Use these as strong priors — only override if the transaction clearly differs)');
  lines.push('');

  // Sort: user overrides first, then deductible items, then by count
  const sorted = entries.sort((a, b) => {
    if (a[1].userOverride && !b[1].userOverride) return -1;
    if (!a[1].userOverride && b[1].userOverride) return 1;
    if (a[1].deductible && !b[1].deductible) return -1;
    if (!a[1].deductible && b[1].deductible) return 1;
    return b[1].count - a[1].count;
  });

  for (const [vendor, info] of sorted.slice(0, 100)) {
    const override = info.userOverride ? ' [USER CONFIRMED]' : '';
    const deductible = info.deductible
      ? `${info.pct}% deductible`
      : 'NOT deductible';
    lines.push(`- ${vendor} → ${info.category} (${deductible})${override}`);
  }

  if (context.incomeSources.length > 0) {
    lines.push('');
    lines.push('KNOWN INCOME SOURCES:');
    for (const src of context.incomeSources) {
      lines.push(`- ${src}`);
    }
  }

  if (context.userCorrections.length > 0) {
    lines.push('');
    lines.push('USER CORRECTIONS (highest priority — always follow these):');
    for (const c of context.userCorrections.slice(-20)) {
      lines.push(`- ${c.vendor}: changed from ${c.from.category} to ${c.to.category} (${c.to.deductible ? `${c.to.pct}% deductible` : 'not deductible'})${c.note ? ` — "${c.note}"` : ''}`);
    }
  }

  // Cap total context to ~4000 tokens (~16K chars)
  const text = lines.join('\n');
  if (text.length > 16000) {
    return text.substring(0, 16000) + '\n[Context truncated — showing most important vendors]';
  }
  return text;
}

/** Record a user correction in the context (called when user edits a transaction) */
export function addUserCorrection(
  context: TaxYearContext,
  vendor: string,
  from: { category: string; deductible: boolean; pct: number },
  to: { category: string; deductible: boolean; pct: number },
  note?: string
): TaxYearContext {
  const key = normalizeVendor(vendor);
  const updated = { ...context };
  updated.userCorrections = [...(updated.userCorrections || [])];
  updated.userCorrections.push({ vendor: key, from, to, note });

  // Also update the vendor map
  updated.vendorMap = { ...updated.vendorMap };
  updated.vendorMap[key] = {
    category: to.category,
    deductible: to.deductible,
    pct: to.pct,
    count: updated.vendorMap[key]?.count || 1,
    userOverride: true,
    note,
  };

  updated.lastUpdated = new Date().toISOString();
  return updated;
}
