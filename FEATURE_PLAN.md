# TIT Tax — Feature Implementation Plan
**Date:** 2026-03-26  
**Status:** PLANNING → IMPLEMENTATION

---

## Overview

Six interconnected features to improve the credit system, analysis quality, and introduce a "tax memory" system that accumulates context across analyses — the key differentiator.

---

## Feature 1: Admin Unlimited Mode

**Problem:** Dave (davesampson15@gmail.com) burns credits while testing.  
**Solution:** Admin users skip credit checks entirely. Add toggle to admin panel.

### Implementation
- `app/api/analyze/route.ts`: Check `ADMIN_EMAILS.includes(user.email)` → skip credit decrement
- `app/lib/admin.ts`: Export `ADMIN_EMAILS` array for reuse
- `app/admin/page.tsx`: Add "Set Credits" for any user + "Unlimited Mode" toggle

### Credit Rules for Admins
| Scenario | Credits Used |
|----------|-------------|
| Admin analyzing a statement | 0 (always free) |
| Admin using admin panel to set user credits | N/A |

**Effort:** Small  
**Risk:** Low — just an if-check  

---

## Feature 2: Credit Protection on Failures

**Problem:** Credits consumed even when AI returns garbage (3 transactions from a 20-page statement).  
**Solution:** Quality gate — only deduct credit if results meet minimum thresholds.

### Quality Gate Rules
```
IF pageCount >= 2 AND transactions.length < 5       → DON'T CHARGE (likely failed parse)
IF text.length > 5000 AND transactions.length < 3   → DON'T CHARGE (AI missed everything)
IF API call throws/times out                         → DON'T CHARGE (already handled — error returns before credit deduction)
IF AI returns invalid JSON                           → DON'T CHARGE (already handled)
```

### Implementation
- `app/api/analyze/route.ts`: Add quality check between AI response merge and credit deduction
- Return `{ success: true, creditCharged: false, reason: "..." }` when quality gate triggers
- UI shows: "This analysis didn't meet our quality threshold — no credit was charged. Try re-uploading."

### What counts as "successful enough to charge"
- ≥ 5 transactions extracted, OR
- ≥ 1 transaction per 2 pages of the PDF, OR  
- Statement is genuinely short (< 2 pages)

**Effort:** Small  
**Risk:** Low — worst case, we're too generous and don't charge when we should  

---

## Feature 3: Better "Buy More" UX

**Problem:** User hits credit wall → sees a 403 error in console. Must manually navigate to /pricing.  
**Solution:** Inline modals and banners at every touchpoint.

### Touchpoints
1. **Dashboard header** — when credits = 0: red banner "You're out of credits" with Buy button
2. **Dashboard header** — when credits ≤ 2: amber warning "Running low" with Buy link
3. **Upload page** — if analyze returns 403: inline modal overlay with plan cards + buy CTA
4. **Upload page** — after each successful analysis: show "X credits remaining" chip
5. **After purchase success** — return to dashboard with toast "Credits added!"

### Implementation
- `app/upload/page.tsx`: Catch 403 → show `<CreditModal>` component
- `app/dashboard/page.tsx`: Conditional banner based on `user.credits`
- `app/components/CreditBanner.tsx`: Reusable low-credit/no-credit banner
- All CTAs link to `/pricing` or show inline plan cards

**Effort:** Medium  
**Risk:** Low  

---

## Feature 4: Free Re-analysis for Same Month

**Problem:** Re-uploading a month to improve results costs another credit.  
**Solution:** If a month already has transactions in the DB, re-analyzing is free.

### Implementation
- `app/api/analyze/route.ts`: Before credit check, look up existing `StatementUpload` for same `taxYearId + monthLabel`
  - If exists → set `isReanalysis = true` → skip credit deduction
  - Still replace old data (already does this)
- Return `{ creditCharged: false, reason: "Re-analysis of existing month — no charge" }`

### UX Impact
- Upload page shows: "Re-analyzing November 2024 — free" instead of the credit count
- Encourages users to improve results without fear of wasting credits
- First upload of a month = 1 credit. All re-uploads of same month = free.

**Effort:** Small  
**Risk:** Medium — could be exploited if someone re-uploads with completely different content. But the taxYearId+monthLabel constraint is reasonable.

---

## Feature 5: Context Accumulation (Tax Year Context Document)

**Problem:** Each analysis is isolated. AI has no memory of previous months. Your real tax prep took hundreds of requests over hours because the AI needed to learn your transaction patterns.  
**Solution:** Build a growing "context document" per tax year that the AI gets on every request.

### How It Works

```
Upload Month 1 (March):
  → AI analyzes from scratch
  → After analysis: extract vendor→category mapping from results
  → Save to TaxYear.contextJson:
    {
      "vendorMap": {
        "WOOLWORTHS": { "category": "PERSONAL", "deductible": false },
        "AMAZON AWS": { "category": "HOSTING", "deductible": true, "pct": 100 },
        "UBER TRIPS": { "category": "TRAVEL", "deductible": true, "pct": 60, "note": "60% business" }
      },
      "incomeSources": ["FNB SALARY - ACME INC", "PAYPAL FREELANCE"],
      "userCorrections": [],  // populated when user edits transactions
      "analysisNotes": "User is software developer who also DJs"
    }

Upload Month 2 (April):
  → AI gets the context document IN the system prompt
  → "Here are known classifications from previous months: ..."
  → AI classifies Woolworths/Amazon/Uber correctly from the start
  → New vendors discovered → merged into context document

Upload Month 12 (February):
  → Context document is rich — AI nails 90%+ of classifications
```

### When User Edits Transactions
- PATCH `/api/transactions` already handles user overrides
- After save: update `contextJson.userCorrections` with the override
- Next analysis incorporates: "User corrected UBER to 60% business travel"

### Schema Changes
```prisma
model TaxYear {
  // ... existing fields
  contextJson    Json?    // Accumulated analysis context
}
```

### Context Injection into AI Prompt
- `app/lib/openai.ts`: `buildAnalysisPrompt()` accepts optional `context` parameter
- Injects a section: "KNOWN VENDOR CLASSIFICATIONS FROM PREVIOUS ANALYSES:"
- Caps context at ~4000 tokens (~16K chars) to leave room for the statement

### Context Building Logic (new file: `app/lib/context-builder.ts`)
```typescript
export function buildContextFromTransactions(transactions: Transaction[]): VendorContext {
  // Group transactions by normalized vendor name
  // Extract most common category per vendor
  // Include user overrides as highest priority
  // Return structured context document
}

export function mergeContext(existing: VendorContext, newTransactions: Transaction[]): VendorContext {
  // Merge new vendor mappings into existing
  // User corrections always override AI classifications
}

export function contextToPromptText(context: VendorContext): string {
  // Convert to readable text for the AI prompt
  // "WOOLWORTHS → Personal (not deductible)"
  // "AMAZON AWS → Hosting/Cloud expense (100% deductible)"
}
```

**Effort:** Large  
**Risk:** Medium — context injection could confuse AI if too long. Cap at ~4000 tokens.

---

## Feature 6: Supporting Documents / Checkpoints ("Tax Memory")

**Problem:** Users (especially premium) need to build up supporting documentation over time — like the SARS supporting document we created manually. Currently there's no way to save analysis checkpoints or create financial schedules.  
**Solution:** "Tax Checkpoints" — user-requested snapshots that capture the state of their tax year analysis at a point in time, stored as structured markdown.

### Concept

Think of it like **save points in a game**:
- After uploading 6 months → "Save Checkpoint" → captures current state
- After uploading all 12 months → "Save Checkpoint" → captures final state
- Each checkpoint is a structured financial document (markdown)
- Premium feature: unlimited checkpoints. Free: 0. Pro: 3.

### What a Checkpoint Contains

```markdown
# Tax Checkpoint — 2024/2025
## Created: 2026-03-26 at 14:30
## Status: 8/12 months analyzed

### Income Summary
| Source | Total |
|--------|-------|
| FNB Salary - ACME INC | R 284,700.72 |
| PayPal Freelance | R 12,340.00 |

### Deduction Summary by Category
| Category | Amount | Section | Proof Required |
|----------|--------|---------|----------------|
| Home Office | R 24,000.00 | S11(a) | Yes |
| Travel | R 8,500.00 | S11(a) | Logbook |
| Professional Subscriptions | R 3,200.00 | S11(a) | Invoices |
| Internet (60%) | R 7,200.00 | S11(a) | Yes |

### Transaction Flags Requiring Review
- 2024-05-15: UBER R340.00 — flagged REVIEW (60% business?)
- 2024-07-22: GAME R2,100.00 — flagged REVIEW (equipment?)

### AI Confidence Report
- High confidence (>80%): 342 transactions
- Medium confidence (50-80%): 28 transactions  
- Low confidence (<50%): 5 transactions — REVIEW THESE

### Notes
[User-entered notes / AI observations]
```

### How It Works

1. **User clicks "Save Checkpoint"** on dashboard or report page
2. Backend aggregates all transaction data for that tax year
3. Generates structured markdown document
4. AI optionally enriches with observations/recommendations (costs 0 credits — uses checkpoint-specific prompt)
5. Stored as `TaxCheckpoint` record with markdown content
6. User can view list of all checkpoints, view any checkpoint, download as PDF

### AI Integration
- Each checkpoint's markdown is passed to subsequent analyses as additional context
- "Here is the user's latest tax checkpoint summary: ..."
- This gives AI comprehensive understanding of the user's full tax picture

### Schema Changes
```prisma
model TaxCheckpoint {
  id          String   @id @default(cuid())
  userId      String
  taxYearId   String
  
  title       String   // "Checkpoint — March to August 2024"
  content     String   // Full markdown content
  
  // Snapshot metadata
  monthsAnalyzed  Int      // How many months were done at this point
  totalIncome     Decimal? @db.Decimal(12, 2)
  totalDeductions Decimal? @db.Decimal(12, 2)
  transactionCount Int     @default(0)
  
  createdAt   DateTime @default(now())
  
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  taxYear     TaxYear @relation(fields: [taxYearId], references: [id])
  
  @@map("tax_checkpoints")
}
```

### Plan Limits

All plans include unlimited checkpoints and context accumulation — no feature gates.
The product sells itself when users experience the full workflow.

### PDF Export
- Endpoint: `GET /api/checkpoints/[id]/pdf`
- Uses the same puppeteer-core approach from the SARS supporting doc
- Or: client-side markdown→HTML→print-to-PDF (simpler, no server dependency)
- Initially: just provide a "Print/Save as PDF" button that uses `window.print()` with a print-friendly stylesheet

### Checkpoint List Page
- New page: `/checkpoints?taxYearId=xxx`
- Or: section on the report page
- Shows: title, date, months covered, income/deductions at that point
- Actions: View | Download PDF | Delete

**Effort:** Large  
**Risk:** Medium — markdown generation is straightforward. PDF export has dependencies.

---

## Data Flow: How It All Connects

```
User uploads PDF
    │
    ▼
Parse PDF → text
    │
    ▼
Check: Is this a re-analysis? ──Yes──→ Skip credit check
    │No                                      │
    ▼                                        │
Check: Is user admin? ──Yes──→ Skip credit   │
    │No                                      │
    ▼                                        │
Check: credits > 0? ──No──→ Show buy modal   │
    │Yes                                     │
    ▼                                        │
Load TaxYear.contextJson (if any)            │
    │                                        │
    ▼                                        │
Build AI prompt + inject context  ◄──────────┘
    │
    ▼
AI analyzes statement (chunked, parallel)
    │
    ▼
Quality gate: enough transactions?
    │No → Return results, DON'T charge credit
    │Yes
    ▼
Deduct 1 credit (unless admin or re-analysis)
    │
    ▼
Save transactions to DB
    │
    ▼
Update TaxYear.contextJson with new vendor mappings
    │
    ▼
Return results with { creditCharged, creditsRemaining }
    │
    ▼
User reviews / edits transactions
    │
    ▼
User corrections → update contextJson.userCorrections
    │
    ▼
User clicks "Save Checkpoint" (premium)
    │
    ▼
Generate structured markdown → store TaxCheckpoint
    │
    ▼
Next analysis uses: contextJson + latest checkpoint
```

---

## Implementation Order

| # | Feature | Effort | Dependencies |
|---|---------|--------|-------------|
| 1 | Admin bypass | 30 min | None |
| 2 | Credit protection | 30 min | None |
| 3 | Free re-analysis | 20 min | None |
| 4 | Better buy-more UX | 1-2 hrs | None |
| 5 | Context accumulation | 2-3 hrs | Schema migration |
| 6 | Tax checkpoints | 3-4 hrs | Schema migration, context system |

Features 1-3 are independent quick wins. Feature 4 is UI work. Features 5-6 build on each other.

**Proposed batch:**
- **Batch A (now):** Features 1-4 — all small, no schema changes needed except contextJson
- **Batch B (next):** Feature 5 — schema migration + context builder + prompt injection
- **Batch C (after):** Feature 6 — checkpoint model + generation + UI + PDF export

---

## Open Questions

1. **Context document size limit?** Proposed: 4000 tokens (~16K chars). If vendor map grows huge, prune least-frequent vendors.
2. **Should checkpoints cost a credit?** Proposed: No — they're a premium perk, not an API cost. The AI enrichment is small (summary prompt, not full analysis).
3. **Client-side or server-side PDF?** Proposed: Start with `window.print()` + print CSS. Upgrade to server-side puppeteer later if needed.
4. **Should context accumulation be available on Free plan?** Proposed: No — it's the main reason to upgrade. Free gets isolated analyses, paid gets smart context.

---

## Let's Debate

**Ready to start with Batch A (features 1-4)?** These are all safe, reversible, no-migration changes that immediately improve the experience.
