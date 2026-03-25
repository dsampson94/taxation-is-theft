#!/usr/bin/env npx tsx
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TIT Tax — Stress Test & Accuracy Validation
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Simulates realistic users (devs, freelancers, DJs, contractors) with
 * real SA bank transaction patterns. Tests the full pipeline:
 *   Register → Profile → Tax Year → Statement Upload → AI Analysis → Report
 * 
 * Validates that the AI actually FINDS deductions it should (JetBrains,
 * AWS, fuel, HPCSA, CDJ purchases, etc.) and correctly ignores personal
 * expenses (Woolworths, Netflix, gym).
 * 
 * Usage:
 *   npx tsx scripts/stress-test.ts                    # Run full test
 *   npx tsx scripts/stress-test.ts --users 3          # Test with 3 users
 *   npx tsx scripts/stress-test.ts --months 3         # Test 3 months each
 *   npx tsx scripts/stress-test.ts --cleanup-only     # Just delete test data
 *   npx tsx scripts/stress-test.ts --no-cleanup       # Keep data after test
 *   npx tsx scripts/stress-test.ts --report-only      # Just show DB stats
 * 
 * Requires: Server running at BASE_URL (default http://localhost:3000)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_PASSWORD = 'StressTest2026!';
const TEST_EMAIL_PREFIX = 'stresstest_';
const TEST_EMAIL_DOMAIN = '@test.taxationistheft.co.za';

// ─── CLI Args ───────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (name: string, fallback: string) => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
};
const hasFlag = (name: string) => args.includes(`--${name}`);

const NUM_USERS = parseInt(getArg('users', '5'));
const MONTHS_PER_USER = parseInt(getArg('months', '6'));
const CLEANUP_ONLY = hasFlag('cleanup-only');
const NO_CLEANUP = hasFlag('no-cleanup');
const REPORT_ONLY = hasFlag('report-only');

// ─── Types ──────────────────────────────────────────────────────────────
interface TestPersona {
  name: string;
  email: string;
  occupation: string;
  employmentType: string;
  hasMedicalAid: boolean;
  medicalAidMembers: number;
  monthlyMedicalAidFee: number;
  hasRetirementAnnuity: boolean;
  annualRAContribution: number;
  worksFromHome: boolean;
  homeOfficePct: number;
  usesVehicleForWork: boolean;
  annualBusinessKm: number;
  makesDonations: boolean;
  hasOutOfPocketMedical: boolean;
  taxNotes: string;
  // Test validation
  expectedDeductions: string[];   // Keywords we EXPECT the AI to flag as deductible
  expectedPersonal: string[];     // Keywords that should NOT be deductible
  monthlyIncome: number;
  transactionGenerator: (month: number, year: number) => string;
}

interface TestResult {
  persona: string;
  month: string;
  totalTransactions: number;
  deductibleFound: number;
  totalDeductible: number;
  totalIncome: number;
  totalExpenses: number;
  // Accuracy metrics
  expectedHits: { keyword: string; found: boolean; amount?: number; flag?: string }[];
  expectedMisses: { keyword: string; correctlyIgnored: boolean }[];
  falsePositives: string[];  // Flagged deductible but shouldn't be
  parseTimeMs: number;
  analyzeTimeMs: number;
  chunks: number;
}

// ─── Logging ────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const log = (msg: string) => console.log(msg);
const ok = (msg: string) => log(`  ${c.green}✓${c.reset} ${msg}`);
const warn = (msg: string) => log(`  ${c.yellow}⚠${c.reset} ${msg}`);
const fail = (msg: string) => log(`  ${c.red}✗${c.reset} ${msg}`);
const info = (msg: string) => log(`  ${c.cyan}ℹ${c.reset} ${msg}`);
const header = (msg: string) => log(`\n${c.bright}${c.blue}═══ ${msg} ═══${c.reset}`);
const subheader = (msg: string) => log(`\n${c.bright}  ${msg}${c.reset}`);

// ─── SA Bank Statement Generators ───────────────────────────────────────
// These produce text that looks like what pdf2json would extract from
// FNB, Standard Bank, Nedbank etc. Realistic dates, amounts, descriptions.

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function randomDay(month: number, year: number): string {
  const maxDay = new Date(year, month + 1, 0).getDate();
  const day = Math.floor(Math.random() * maxDay) + 1;
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function fmtAmt(amount: number): string {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Software Developer / Tech Worker ──
function generateDevStatement(month: number, year: number): string {
  const dt = (day?: number) => {
    const d = day || (Math.floor(Math.random() * 28) + 1);
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const transactions: string[] = [
    // INCOME
    `${dt(25)}\tSALARY DEP FROM ACME TECH PTY LTD\t${fmtAmt(65000)}\tCR`,
    // Recurring deductible expenses (the AI MUST catch these)
    `${dt(1)}\tJETBRAINS S.R.O. SUBSCRIPTION\t-${fmtAmt(459)}\tDR`,
    `${dt(1)}\tGITHUB INC\t-${fmtAmt(210)}\tDR`,
    `${dt(2)}\tAMAZON WEB SERVICES AWS\t-${fmtAmt(1850)}\tDR`,
    `${dt(2)}\tVERCEL INC\t-${fmtAmt(380)}\tDR`,
    `${dt(3)}\tAFRIHOST FIBRE 100MBPS\t-${fmtAmt(1199)}\tDR`,
    `${dt(3)}\tDIGITALOCEAN CLOUD\t-${fmtAmt(420)}\tDR`,
    `${dt(4)}\tUDEMY ONLINE COURSE REACT ADVANCED\t-${fmtAmt(299)}\tDR`,
    `${dt(5)}\tDISCOVERY HEALTH MEDICAL AID\t-${fmtAmt(3200)}\tDR`,
    `${dt(5)}\tALLAN GRAY RETIREMENT ANNUITY\t-${fmtAmt(5000)}\tDR`,
    `${dt(6)}\tIITPSA MEMBERSHIP ANNUAL\t-${fmtAmt(1150)}\tDR`,
    // Office / home office
    `${dt(7)}\tERGO HOME DESK SETUP TAKEALOT\t-${fmtAmt(8500)}\tDR`,
    `${dt(8)}\tCITY OF JHB ELECTRICITY\t-${fmtAmt(2100)}\tDR`,
    `${dt(8)}\tCITY OF JHB RATES & WATER\t-${fmtAmt(1800)}\tDR`,
    // Personal expenses (AI should NOT flag these)
    `${dt(10)}\tWOOLWORTHS SANDTON CITY\t-${fmtAmt(1250)}\tDR`,
    `${dt(11)}\tNETFLIX.COM\t-${fmtAmt(199)}\tDR`,
    `${dt(12)}\tSPOTIFY PREMIUM\t-${fmtAmt(79.99)}\tDR`,
    `${dt(13)}\tVIRGIN ACTIVE GYM SANDTON\t-${fmtAmt(899)}\tDR`,
    `${dt(14)}\tUBER EATS SA\t-${fmtAmt(285)}\tDR`,
    `${dt(15)}\tCHECKERS HYPER\t-${fmtAmt(3200)}\tDR`,
    `${dt(16)}\tENGEN FUEL WILLIAM NICOL\t-${fmtAmt(1100)}\tDR`,
    `${dt(17)}\tMR PRICE FOURWAYS\t-${fmtAmt(650)}\tDR`,
    `${dt(18)}\tDISCHEM PHARMACY SANDTON\t-${fmtAmt(450)}\tDR`,
    // Bank fees (deductible for business)
    `${dt(28)}\tMONTHLY SERVICE FEE\t-${fmtAmt(175)}\tDR`,
    `${dt(28)}\tCARD TRANSACTION FEES\t-${fmtAmt(85)}\tDR`,
    // Transfer (should be ignored)
    `${dt(20)}\tTRF TO SAVINGS ACC 6234\t-${fmtAmt(5000)}\tDR`,
  ];

  // Occasionally add big purchases
  if (month % 3 === 0) {
    transactions.push(`${dt(15)}\tAPPLE STORE SA MACBOOK PRO M3\t-${fmtAmt(52999)}\tDR`);
  }
  if (month % 6 === 0) {
    transactions.push(`${dt(10)}\tDELL SA MONITOR 4K 27IN\t-${fmtAmt(12500)}\tDR`);
  }

  return formatStatement('FNB', '62****1234', month, year, shuffleArray(transactions));
}

// ── Freelancer / Contractor ──
function generateFreelancerStatement(month: number, year: number): string {
  const dt = (day?: number) => {
    const d = day || (Math.floor(Math.random() * 28) + 1);
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const clientPayments = [
    { name: 'SAPIENT CONSULTING PTY LTD', amount: 35000 + Math.random() * 10000 },
    { name: 'CAPE INNOVATION LABS', amount: 22000 + Math.random() * 8000 },
  ];
  if (month % 2 === 0) {
    clientPayments.push({ name: 'PIXEL PERFECT DESIGNS CC', amount: 15000 + Math.random() * 5000 });
  }

  const transactions: string[] = [
    // Income from multiple clients
    ...clientPayments.map(cp => `${dt(Math.floor(Math.random() * 5) + 1)}\t${cp.name} PAYMENT\t${fmtAmt(cp.amount)}\tCR`),
    // Business expenses (should ALL be caught)
    `${dt(1)}\tADOBE CREATIVE CLOUD\t-${fmtAmt(950)}\tDR`,
    `${dt(1)}\tFIGMA PROFESSIONAL\t-${fmtAmt(270)}\tDR`,
    `${dt(2)}\tGOOGLE WORKSPACE BUSINESS\t-${fmtAmt(180)}\tDR`,
    `${dt(2)}\tSLACK TECHNOLOGIES\t-${fmtAmt(165)}\tDR`,
    `${dt(3)}\tNOTION LABS INC\t-${fmtAmt(160)}\tDR`,
    `${dt(3)}\tOPENSERVE FIBRE 200MBPS\t-${fmtAmt(1099)}\tDR`,
    `${dt(4)}\tVODACOM CONTRACT\t-${fmtAmt(699)}\tDR`,
    `${dt(5)}\tDISCOVERY HEALTH MEDICAL AID\t-${fmtAmt(2800)}\tDR`,
    `${dt(5)}\tOLD MUTUAL RA CONTRIBUTION\t-${fmtAmt(3500)}\tDR`,
    `${dt(6)}\tCITY OF CPT ELECTRICITY\t-${fmtAmt(1500)}\tDR`,
    `${dt(6)}\tCITY OF CPT RATES\t-${fmtAmt(1200)}\tDR`,
    `${dt(7)}\tREGUS CO-WORKING SPACE CPT\t-${fmtAmt(3500)}\tDR`,
    `${dt(8)}\tTAXATIONISTHEFT.CO.ZA ANALYSIS\t-${fmtAmt(43)}\tDR`,
    `${dt(9)}\tPROFESSIONAL INDEMNITY INSURANCE\t-${fmtAmt(850)}\tDR`,
    `${dt(10)}\tGIFT OF THE GIVERS DONATION\t-${fmtAmt(500)}\tDR`,
    // Personal
    `${dt(11)}\tPICK N PAY CLAREMONT\t-${fmtAmt(2800)}\tDR`,
    `${dt(12)}\tNETFLIX.COM\t-${fmtAmt(199)}\tDR`,
    `${dt(13)}\tWINELANDS RESTAURANT\t-${fmtAmt(950)}\tDR`,
    `${dt(14)}\tPLANET FITNESS GYM\t-${fmtAmt(299)}\tDR`,
    `${dt(15)}\tZARA CANAL WALK\t-${fmtAmt(1500)}\tDR`,
    `${dt(16)}\tSPAR SUPERMARKET\t-${fmtAmt(450)}\tDR`,
    // Bank
    `${dt(28)}\tMONTHLY ACCOUNT FEE\t-${fmtAmt(145)}\tDR`,
    `${dt(28)}\tEFT TRANSACTION FEES\t-${fmtAmt(65)}\tDR`,
    // Provisional tax
    ...(month === 7 || month === 1 ? [`${dt(20)}\tSARS PROVISIONAL TAX PAYMENT\t-${fmtAmt(18000)}\tDR`] : []),
  ];

  return formatStatement('STANDARD BANK', '07****5678', month, year, shuffleArray(transactions));
}

// ── DJ / Music Producer ──
function generateDJStatement(month: number, year: number): string {
  const dt = (day?: number) => {
    const d = day || (Math.floor(Math.random() * 28) + 1);
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const gigs = [
    { venue: 'SHIMMY BEACH CLUB', fee: 8000 + Math.random() * 4000 },
    { venue: 'ZONE 6 VENUE JHB', fee: 5000 + Math.random() * 3000 },
  ];
  // Busy season = more gigs
  if ([10, 11, 0, 1].includes(month)) {
    gigs.push({ venue: 'TABOO NIGHTCLUB', fee: 6000 + Math.random() * 2000 });
    gigs.push({ venue: 'ORIGIN FESTIVAL', fee: 15000 + Math.random() * 5000 });
  }

  const transactions: string[] = [
    // Gig income
    ...gigs.map(g => `${dt()}\t${g.venue} DJ GIG FEE\t${fmtAmt(g.fee)}\tCR`),
    // Streaming royalties
    `${dt(15)}\tDISTROKID ROYALTIES\t${fmtAmt(1200 + Math.random() * 800)}\tCR`,
    // DEDUCTIBLE — equipment & software (THE BIG ONES)
    `${dt(1)}\tSPOTIFY FOR ARTISTS PLAN\t-${fmtAmt(169)}\tDR`,
    `${dt(2)}\tABLETON LIVE SUITE SUBSCRIPTION\t-${fmtAmt(750)}\tDR`,
    `${dt(2)}\tSPLICE SOUNDS SUBSCRIPTION\t-${fmtAmt(205)}\tDR`,
    `${dt(3)}\tBEATPORT DJ MUSIC DOWNLOADS\t-${fmtAmt(650)}\tDR`,
    `${dt(4)}\tRAIN 5G DATA SIM\t-${fmtAmt(499)}\tDR`,
    `${dt(5)}\tVODACOM CONTRACT\t-${fmtAmt(599)}\tDR`,
    // Travel to gigs
    `${dt(8)}\tENGEN FUEL N1 HIGHW\t-${fmtAmt(950)}\tDR`,
    `${dt(12)}\tSHELL FUEL BUITENGRACHT\t-${fmtAmt(800)}\tDR`,
    `${dt(18)}\tUBER SA TRIP TO GIG\t-${fmtAmt(350)}\tDR`,
    `${dt(22)}\tFLYSAFAIR JHB-CPT\t-${fmtAmt(1800)}\tDR`,
    `${dt(23)}\tCITYLODGE HOTEL JHB\t-${fmtAmt(1200)}\tDR`,
    `${dt(24)}\tPARKING SANDTON CITY\t-${fmtAmt(120)}\tDR`,
    // Personal
    `${dt(10)}\tMCDONALDS LONG STREET\t-${fmtAmt(150)}\tDR`,
    `${dt(11)}\tH&M V&A WATERFRONT\t-${fmtAmt(1200)}\tDR`,
    `${dt(13)}\tWOOLWORTHS FOOD CAVENDISH\t-${fmtAmt(1800)}\tDR`,
    `${dt(14)}\tNETFLIX.COM\t-${fmtAmt(199)}\tDR`,
    `${dt(15)}\tPLAYSTATION NETWORK\t-${fmtAmt(239)}\tDR`,
    // Bank
    `${dt(28)}\tMONTHLY SERVICE FEE\t-${fmtAmt(125)}\tDR`,
  ];

  // Big equipment purchases (quarterly)
  if (month % 4 === 0) {
    transactions.push(`${dt(10)}\tPIONEER DJ CDJ-3000 NEXUS\t-${fmtAmt(42000)}\tDR`);
  }
  if (month === 6) {
    transactions.push(`${dt(5)}\tMACKIE THUMP 15A SPEAKERS x2\t-${fmtAmt(18500)}\tDR`);
  }

  return formatStatement('CAPITEC', '13****9012', month, year, shuffleArray(transactions));
}

// ── Sales / Estate Agent (commission earner) ──
function generateSalesStatement(month: number, year: number): string {
  const dt = (day?: number) => {
    const d = day || (Math.floor(Math.random() * 28) + 1);
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const commissions = [
    `${dt(5)}\tREMAX COMMISSION PAYMENT\t${fmtAmt(28000 + Math.random() * 15000)}\tCR`,
    `${dt(15)}\tREMAX COMMISSION PAYMENT\t${fmtAmt(18000 + Math.random() * 10000)}\tCR`,
  ];

  const transactions: string[] = [
    ...commissions,
    // Vehicle expenses (CRITICAL for estate agents)
    `${dt(3)}\tENGEN FUEL WILLIAM NICOL\t-${fmtAmt(1800)}\tDR`,
    `${dt(8)}\tSASO FUEL N1\t-${fmtAmt(1600)}\tDR`,
    `${dt(15)}\tSHELL FUEL SANDTON\t-${fmtAmt(1400)}\tDR`,
    `${dt(20)}\tBP FUEL RIVONIA\t-${fmtAmt(1500)}\tDR`,
    `${dt(10)}\tTIGER WHEEL & TYRE SERVICE\t-${fmtAmt(4500)}\tDR`,
    `${dt(7)}\tN3 TOLL GATE FEES\t-${fmtAmt(250)}\tDR`,
    // Phone (essential tool)
    `${dt(4)}\tVODACOM CONTRACT 20GB\t-${fmtAmt(899)}\tDR`,
    // Professional fees
    `${dt(1)}\tEAAB REGISTRATION FEE\t-${fmtAmt(3200)}\tDR`,
    `${dt(2)}\tFIDELITY FUND CONTRIB\t-${fmtAmt(500)}\tDR`,
    // Client entertainment (limited deductibility)
    `${dt(12)}\tTHE GRILLHOUSE ROSEBANK\t-${fmtAmt(1800)}\tDR`,
    `${dt(18)}\tMOYO ZOO LAKE CLIENT LUNCH\t-${fmtAmt(950)}\tDR`,
    // Medical & RA
    `${dt(5)}\tDISCOVERY HEALTH MED AID\t-${fmtAmt(2600)}\tDR`,
    `${dt(5)}\tSANLAM RA CONTRIBUTION\t-${fmtAmt(4000)}\tDR`,
    // Personal
    `${dt(11)}\tCHECKERS LIQ FOURWAYS\t-${fmtAmt(650)}\tDR`,
    `${dt(13)}\tTAKEALOT.COM PERSONAL PURCHASE\t-${fmtAmt(799)}\tDR`,
    `${dt(14)}\tDSTv PREMIUM\t-${fmtAmt(829)}\tDR`,
    `${dt(16)}\tWOOLWORTHS FOOD BRYANSTON\t-${fmtAmt(2200)}\tDR`,
    `${dt(17)}\tVIRGIN ACTIVE BRYANSTON\t-${fmtAmt(699)}\tDR`,
    // Bank
    `${dt(28)}\tMONTHLY ACCOUNT FEE\t-${fmtAmt(195)}\tDR`,
  ];

  return formatStatement('NEDBANK', '10****3456', month, year, shuffleArray(transactions));
}

// ── Teacher (employed, limited deductions) ──
function generateTeacherStatement(month: number, year: number): string {
  const dt = (day?: number) => {
    const d = day || (Math.floor(Math.random() * 28) + 1);
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const transactions: string[] = [
    `${dt(25)}\tGAUTENG DEPT OF EDUCATION SALARY\t${fmtAmt(32000)}\tCR`,
    // Deductible for teachers
    `${dt(1)}\tSACE REGISTRATION FEE\t-${fmtAmt(250)}\tDR`,
    `${dt(3)}\tSTATIONERY WALTONS SCHOOL SUPPLIES\t-${fmtAmt(450)}\tDR`,
    `${dt(5)}\tEXCLUSIVE BOOKS TEXTBOOKS\t-${fmtAmt(680)}\tDR`,
    `${dt(5)}\tDISCOVERY HEALTH MEDICAL AID\t-${fmtAmt(2200)}\tDR`,
    `${dt(5)}\tLIBERTY RETIREMENT ANNUITY\t-${fmtAmt(2000)}\tDR`,
    // Personal expenses (most of the statement — typical salaried worker)
    `${dt(6)}\tBOND REPAYMENT ABSA HOME LOAN\t-${fmtAmt(9500)}\tDR`,
    `${dt(7)}\tMUNICIPAL RATES EKURHULENI\t-${fmtAmt(1600)}\tDR`,
    `${dt(8)}\tESKOM PREPAID ELECTRICITY\t-${fmtAmt(800)}\tDR`,
    `${dt(9)}\tPICK N PAY BOKSBURG\t-${fmtAmt(3500)}\tDR`,
    `${dt(10)}\tWOOLWORTHS EAST RAND MALL\t-${fmtAmt(1200)}\tDR`,
    `${dt(11)}\tMR PRICE EAST RAND MALL\t-${fmtAmt(850)}\tDR`,
    `${dt(12)}\tDSTv COMPACT\t-${fmtAmt(449)}\tDR`,
    `${dt(13)}\tNETFLIX.COM\t-${fmtAmt(199)}\tDR`,
    `${dt(14)}\tENGEN FUEL R21\t-${fmtAmt(1200)}\tDR`,
    `${dt(15)}\tPLANET FITNESS GYM\t-${fmtAmt(229)}\tDR`,
    `${dt(16)}\tSPAR SUPERMARKET\t-${fmtAmt(850)}\tDR`,
    `${dt(17)}\tDISCHEM PHARMACY BOKSBURG\t-${fmtAmt(350)}\tDR`,
    `${dt(28)}\tMONTHLY SERVICE FEE\t-${fmtAmt(105)}\tDR`,
  ];

  return formatStatement('ABSA', '40****7890', month, year, shuffleArray(transactions));
}

function formatStatement(bank: string, account: string, month: number, year: number, transactions: string[]): string {
  return `${bank} BANK
STATEMENT OF ACCOUNT
Account Number: ${account}
Statement Period: ${MONTH_NAMES[month]} ${year}

DATE\tDESCRIPTION\tAMOUNT\tDR/CR
${'─'.repeat(80)}
${transactions.join('\n')}
${'─'.repeat(80)}
END OF STATEMENT`;
}

// ─── Test Personas ──────────────────────────────────────────────────────
function buildPersonas(): TestPersona[] {
  const pool: TestPersona[] = [
    {
      name: 'Thabo Mokoena',
      email: `${TEST_EMAIL_PREFIX}thabo${TEST_EMAIL_DOMAIN}`,
      occupation: 'software developer',
      employmentType: 'employed',
      hasMedicalAid: true, medicalAidMembers: 2, monthlyMedicalAidFee: 3200,
      hasRetirementAnnuity: true, annualRAContribution: 60000,
      worksFromHome: true, homeOfficePct: 25,
      usesVehicleForWork: false, annualBusinessKm: 0,
      makesDonations: false, hasOutOfPocketMedical: false,
      taxNotes: 'I code full-stack at a fintech startup. Work from home 4 days a week. I use JetBrains, AWS, GitHub, Vercel for work.',
      expectedDeductions: ['JETBRAINS', 'GITHUB', 'AWS', 'VERCEL', 'AFRIHOST', 'DIGITALOCEAN', 'UDEMY', 'ALLAN GRAY', 'DISCOVERY HEALTH', 'IITPSA', 'ELECTRICITY', 'SERVICE FEE'],
      expectedPersonal: ['WOOLWORTHS', 'NETFLIX', 'SPOTIFY', 'VIRGIN ACTIVE', 'UBER EATS', 'CHECKERS', 'MR PRICE'],
      monthlyIncome: 65000,
      transactionGenerator: generateDevStatement,
    },
    {
      name: 'Zanele Nkosi',
      email: `${TEST_EMAIL_PREFIX}zanele${TEST_EMAIL_DOMAIN}`,
      occupation: 'freelance web designer',
      employmentType: 'self_employed',
      hasMedicalAid: true, medicalAidMembers: 1, monthlyMedicalAidFee: 2800,
      hasRetirementAnnuity: true, annualRAContribution: 42000,
      worksFromHome: true, homeOfficePct: 40,
      usesVehicleForWork: false, annualBusinessKm: 0,
      makesDonations: true, hasOutOfPocketMedical: false,
      taxNotes: 'Freelance UI/UX designer. I use Adobe CC, Figma, Google Workspace. I work from a co-working space some days. All my income is from freelance clients.',
      expectedDeductions: ['ADOBE', 'FIGMA', 'GOOGLE WORKSPACE', 'SLACK', 'NOTION', 'OPENSERVE', 'VODACOM', 'OLD MUTUAL', 'DISCOVERY HEALTH', 'REGUS', 'PROFESSIONAL INDEMNITY', 'GIFT OF THE GIVERS', 'ACCOUNT FEE'],
      expectedPersonal: ['PICK N PAY', 'NETFLIX', 'WINELANDS', 'PLANET FITNESS', 'ZARA', 'SPAR'],
      monthlyIncome: 55000,
      transactionGenerator: generateFreelancerStatement,
    },
    {
      name: 'DJ Mpho',
      email: `${TEST_EMAIL_PREFIX}mpho${TEST_EMAIL_DOMAIN}`,
      occupation: 'DJ and music producer',
      employmentType: 'self_employed',
      hasMedicalAid: false, medicalAidMembers: 0, monthlyMedicalAidFee: 0,
      hasRetirementAnnuity: false, annualRAContribution: 0,
      worksFromHome: true, homeOfficePct: 30,
      usesVehicleForWork: true, annualBusinessKm: 15000,
      makesDonations: false, hasOutOfPocketMedical: false,
      taxNotes: 'I DJ at clubs and festivals around SA. I produce music from my home studio. I travel to gigs by car or fly for out-of-town shows. My equipment (CDJs, speakers) costs a fortune.',
      expectedDeductions: ['ABLETON', 'SPLICE', 'BEATPORT', 'PIONEER DJ', 'MACKIE', 'ENGEN FUEL', 'SHELL FUEL', 'FLYSAFAIR', 'CITYLODGE', 'UBER SA', 'RAIN', 'VODACOM', 'SERVICE FEE', 'PARKING'],
      expectedPersonal: ['MCDONALDS', 'H&M', 'WOOLWORTHS FOOD', 'NETFLIX', 'PLAYSTATION'],
      monthlyIncome: 25000,
      transactionGenerator: generateDJStatement,
    },
    {
      name: 'Linda van der Merwe',
      email: `${TEST_EMAIL_PREFIX}linda${TEST_EMAIL_DOMAIN}`,
      occupation: 'estate agent',
      employmentType: 'commission',
      hasMedicalAid: true, medicalAidMembers: 3, monthlyMedicalAidFee: 2600,
      hasRetirementAnnuity: true, annualRAContribution: 48000,
      worksFromHome: false, homeOfficePct: 0,
      usesVehicleForWork: true, annualBusinessKm: 25000,
      makesDonations: false, hasOutOfPocketMedical: false,
      taxNotes: 'I am a Remax estate agent working on 100% commission. I drive to properties and client meetings daily. My phone is essential for my work.',
      expectedDeductions: ['ENGEN FUEL', 'SHELL FUEL', 'BP FUEL', 'SASOL', 'TIGER WHEEL', 'TOLL', 'VODACOM', 'EAAB', 'FIDELITY', 'DISCOVERY HEALTH', 'SANLAM RA', 'ACCOUNT FEE'],
      expectedPersonal: ['CHECKERS LIQ', 'TAKEALOT.COM PERSONAL', 'DSTV', 'WOOLWORTHS FOOD', 'VIRGIN ACTIVE'],
      monthlyIncome: 40000,
      transactionGenerator: generateSalesStatement,
    },
    {
      name: 'Priya Naidoo',
      email: `${TEST_EMAIL_PREFIX}priya${TEST_EMAIL_DOMAIN}`,
      occupation: 'teacher',
      employmentType: 'employed',
      hasMedicalAid: true, medicalAidMembers: 1, monthlyMedicalAidFee: 2200,
      hasRetirementAnnuity: true, annualRAContribution: 24000,
      worksFromHome: false, homeOfficePct: 0,
      usesVehicleForWork: false, annualBusinessKm: 0,
      makesDonations: false, hasOutOfPocketMedical: true,
      taxNotes: 'I teach high school maths. I sometimes buy stationery and textbooks out of my own pocket for my classroom.',
      expectedDeductions: ['SACE', 'WALTONS', 'EXCLUSIVE BOOKS', 'DISCOVERY HEALTH', 'LIBERTY RETIREMENT'],
      expectedPersonal: ['BOND REPAYMENT', 'PICK N PAY', 'MR PRICE', 'DSTV', 'NETFLIX', 'PLANET FITNESS', 'SPAR'],
      monthlyIncome: 32000,
      transactionGenerator: generateTeacherStatement,
    },
  ];

  return pool.slice(0, NUM_USERS);
}

// ─── HTTP Helpers ───────────────────────────────────────────────────────
async function api(method: string, path: string, body?: any, cookie?: string): Promise<{ status: number; data: any; cookie?: string }> {
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (cookie) headers['Cookie'] = cookie;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });

  const setCookie = res.headers.get('set-cookie');
  let authCookie = cookie;
  if (setCookie) {
    const match = setCookie.match(/auth-token=([^;]+)/);
    if (match) authCookie = `auth-token=${match[1]}`;
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = { raw: await res.text().catch(() => '') };
  }

  return { status: res.status, data, cookie: authCookie };
}

// ─── Main Test Flow ─────────────────────────────────────────────────────
async function runStressTest() {
  header('TIT TAX — STRESS TEST & ACCURACY VALIDATION');
  log(`  Target:     ${BASE_URL}`);
  log(`  Users:      ${NUM_USERS}`);
  log(`  Months/usr: ${MONTHS_PER_USER}`);
  log(`  Started:    ${new Date().toLocaleString('en-ZA')}`);

  const personas = buildPersonas();
  const allResults: TestResult[] = [];
  const startTime = Date.now();

  for (const persona of personas) {
    header(`USER: ${persona.name} (${persona.occupation})`);

    // ── Step 1: Register ──
    subheader('Step 1: Register');
    let res = await api('POST', '/api/auth/register', {
      email: persona.email,
      password: TEST_PASSWORD,
      name: persona.name,
    });

    let cookie: string;
    if (res.status === 409) {
      // Already exists — log in instead
      warn('User exists, logging in...');
      res = await api('POST', '/api/auth/login', {
        email: persona.email,
        password: TEST_PASSWORD,
      });
      if (res.status !== 200) {
        fail(`Login failed: ${res.data.error}`);
        continue;
      }
      cookie = res.cookie!;
      ok(`Logged in as ${persona.email}`);
    } else if (res.status === 200) {
      cookie = res.cookie!;
      ok(`Registered ${persona.email}`);
    } else {
      fail(`Register failed (${res.status}): ${JSON.stringify(res.data)}`);
      continue;
    }

    // ── Step 2: Complete tax profile ──
    subheader('Step 2: Tax Profile');
    res = await api('PATCH', '/api/profile', {
      name: persona.name,
      occupation: persona.occupation,
      employmentType: persona.employmentType,
      hasMedicalAid: persona.hasMedicalAid,
      medicalAidMembers: persona.medicalAidMembers,
      monthlyMedicalAidFee: persona.monthlyMedicalAidFee,
      hasRetirementAnnuity: persona.hasRetirementAnnuity,
      annualRAContribution: persona.annualRAContribution,
      worksFromHome: persona.worksFromHome,
      homeOfficePct: persona.homeOfficePct,
      usesVehicleForWork: persona.usesVehicleForWork,
      annualBusinessKm: persona.annualBusinessKm,
      makesDonations: persona.makesDonations,
      hasOutOfPocketMedical: persona.hasOutOfPocketMedical,
      taxNotes: persona.taxNotes,
      taxProfileComplete: true,
    }, cookie);

    if (res.status === 200) {
      ok(`Profile set: ${persona.occupation} (${persona.employmentType})`);
    } else {
      fail(`Profile update failed: ${res.data.error}`);
      continue;
    }

    // ── Step 3: Grant credits for testing ──
    // We need enough credits. Use direct DB update via a test endpoint
    // or just set a high number. For now, we'll set it via profile hack.
    // Actually — we'll just farm the free credit approach OR we need
    // to grant credits. Let's check current credits.
    res = await api('GET', '/api/profile', undefined, cookie);
    const currentCredits = res.data?.user?.credits || 0;
    info(`Credits available: ${currentCredits}`);

    if (currentCredits < MONTHS_PER_USER) {
      warn(`Need ${MONTHS_PER_USER} credits but only have ${currentCredits}. Will process ${currentCredits} months.`);
    }
    const monthsToProcess = Math.min(MONTHS_PER_USER, Math.max(currentCredits, 1));

    // ── Step 4: Get tax year ──
    subheader('Step 3: Tax Years');
    res = await api('GET', '/api/tax-years', undefined, cookie);
    if (res.status !== 200 || !res.data.taxYears?.length) {
      fail('No tax years found');
      continue;
    }

    const taxYear = res.data.taxYears[0]; // Most recent
    ok(`Using tax year: ${taxYear.yearLabel} (id: ${taxYear.id})`);

    // ── Step 5: Generate & analyze statements month by month ──
    subheader(`Step 4: Analyze ${monthsToProcess} Statements`);

    // Tax year months: March (2) → February (1)
    const [startYearStr] = taxYear.yearLabel.split('/');
    const startYear = parseInt(startYearStr);
    const taxMonths: { month: number; year: number; label: string }[] = [];
    for (let m = 2; m <= 11; m++) {
      taxMonths.push({ month: m, year: startYear, label: `${MONTH_NAMES[m]} ${startYear}` });
    }
    taxMonths.push({ month: 0, year: startYear + 1, label: `${MONTH_NAMES[0]} ${startYear + 1}` });
    taxMonths.push({ month: 1, year: startYear + 1, label: `${MONTH_NAMES[1]} ${startYear + 1}` });

    for (let i = 0; i < monthsToProcess && i < taxMonths.length; i++) {
      const { month, year, label } = taxMonths[i];
      log(`\n  ── ${label} ──`);

      // Generate statement text
      const statementText = persona.transactionGenerator(month, year);
      const textSize = (statementText.length / 1024).toFixed(1);
      info(`Statement: ${textSize}KB, ~${statementText.split('\n').length} lines`);

      // Analyze (this hits OpenAI — the real deal)
      const analyzeStart = Date.now();
      res = await api('POST', '/api/analyze', {
        text: statementText,
        occupation: persona.occupation,
        taxYearId: taxYear.id,
        fileName: `${persona.name.split(' ')[0]}_${label.replace(' ', '_')}.pdf`,
        fileSize: statementText.length,
        selectedMonth: label,
      }, cookie);
      const analyzeMs = Date.now() - analyzeStart;

      if (res.status !== 200) {
        fail(`Analysis failed (${res.status}): ${res.data.error}`);
        continue;
      }

      const analysis = res.data.analysis;
      const txns = analysis?.transactions || [];
      const summary = analysis?.summary || {};

      ok(`${txns.length} transactions in ${(analyzeMs / 1000).toFixed(1)}s`);
      info(`Income: R${(summary.totalIncome || 0).toLocaleString()} | Expenses: R${(summary.totalExpenses || 0).toLocaleString()} | Deductible: R${(summary.totalDeductible || 0).toLocaleString()}`);

      // ── ACCURACY VALIDATION ──
      // Check: Did the AI find the deductions we planted?
      const expectedHits = persona.expectedDeductions.map(keyword => {
        const match = txns.find((tx: any) =>
          tx.description?.toUpperCase().includes(keyword.toUpperCase()) && tx.isDeductible
        );
        if (match) {
          ok(`  Found: ${keyword} → R${Math.abs(match.amount).toLocaleString()} (${match.flag || 'no flag'}, ${match.deductiblePct}%)`);
        } else {
          const exists = txns.find((tx: any) => tx.description?.toUpperCase().includes(keyword.toUpperCase()));
          if (exists) {
            fail(`  MISSED: ${keyword} exists but NOT flagged deductible (flag: ${exists.flag}, deductible: ${exists.isDeductible})`);
          } else {
            warn(`  N/A: ${keyword} not in this month's transactions`);
          }
        }
        return {
          keyword,
          found: !!match,
          amount: match ? Math.abs(match.amount) : undefined,
          flag: match?.flag,
        };
      });

      // Check: Did the AI correctly ignore personal expenses?
      const expectedMisses = persona.expectedPersonal.map(keyword => {
        const match = txns.find((tx: any) =>
          tx.description?.toUpperCase().includes(keyword.toUpperCase())
        );
        const correctlyIgnored = !match || !match.isDeductible;
        if (correctlyIgnored) {
          ok(`  Ignored: ${keyword} ✓`);
        } else {
          fail(`  FALSE POSITIVE: ${keyword} flagged as deductible! (R${Math.abs(match.amount)}, ${match.deductiblePct}%)`);
        }
        return { keyword, correctlyIgnored };
      });

      // Find any other false positives
      const falsePositives = txns
        .filter((tx: any) => {
          if (!tx.isDeductible) return false;
          // Check if it's a known personal expense
          return persona.expectedPersonal.some(k =>
            tx.description?.toUpperCase().includes(k.toUpperCase())
          );
        })
        .map((tx: any) => tx.description);

      allResults.push({
        persona: persona.name,
        month: label,
        totalTransactions: txns.length,
        deductibleFound: txns.filter((tx: any) => tx.isDeductible).length,
        totalDeductible: summary.totalDeductible || 0,
        totalIncome: summary.totalIncome || 0,
        totalExpenses: summary.totalExpenses || 0,
        expectedHits,
        expectedMisses,
        falsePositives,
        parseTimeMs: 0,
        analyzeTimeMs: analyzeMs,
        chunks: analysis?.chunks || 1,
      });
    }

    // ── Step 6: Tax Report ──
    subheader('Step 5: Tax Report');
    res = await api('GET', `/api/tax-report?taxYearId=${taxYear.id}`, undefined, cookie);
    if (res.status === 200) {
      const report = res.data;
      ok(`Tax report generated`);
      info(`Total Income:     R${(report.totalIncome || 0).toLocaleString()}`);
      info(`Total Deductions: R${(report.totalDeductions || 0).toLocaleString()}`);
      info(`Tax Without Ded.: R${(report.taxWithoutDeductions || 0).toLocaleString()}`);
      info(`Tax With Ded.:    R${(report.taxWithDeductions || 0).toLocaleString()}`);
      info(`${c.green}${c.bright}TAX SAVINGS:      R${(report.taxSavings || 0).toLocaleString()}${c.reset}`);
    } else {
      fail(`Tax report failed: ${res.data.error}`);
    }
  }

  // ─── FINAL REPORT ──────────────────────────────────────────────────
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  header('FINAL RESULTS');

  // Accuracy summary
  let totalExpectedHits = 0;
  let totalHitsFound = 0;
  let totalExpectedMisses = 0;
  let totalCorrectMisses = 0;
  let totalFalsePositives = 0;

  for (const r of allResults) {
    const relevant = r.expectedHits.filter(h => h.amount !== undefined); // Only count ones that existed in the statement
    totalExpectedHits += relevant.length;
    totalHitsFound += relevant.filter(h => h.found).length;
    totalExpectedMisses += r.expectedMisses.length;
    totalCorrectMisses += r.expectedMisses.filter(m => m.correctlyIgnored).length;
    totalFalsePositives += r.falsePositives.length;
  }

  const deductionAccuracy = totalExpectedHits > 0 ? ((totalHitsFound / totalExpectedHits) * 100).toFixed(1) : 'N/A';
  const personalAccuracy = totalExpectedMisses > 0 ? ((totalCorrectMisses / totalExpectedMisses) * 100).toFixed(1) : 'N/A';

  log(`\n  ${c.bright}Deduction Detection Rate:${c.reset}  ${deductionAccuracy}% (${totalHitsFound}/${totalExpectedHits})`);
  log(`  ${c.bright}Personal Ignore Rate:${c.reset}      ${personalAccuracy}% (${totalCorrectMisses}/${totalExpectedMisses})`);
  log(`  ${c.bright}False Positives:${c.reset}           ${totalFalsePositives}`);

  // Performance
  const avgAnalyzeTime = allResults.length > 0
    ? (allResults.reduce((s, r) => s + r.analyzeTimeMs, 0) / allResults.length / 1000).toFixed(1)
    : 'N/A';
  log(`\n  ${c.bright}Avg Analysis Time:${c.reset}  ${avgAnalyzeTime}s per statement`);
  log(`  ${c.bright}Total Test Time:${c.reset}    ${totalTime}s`);
  log(`  ${c.bright}Statements Tested:${c.reset}  ${allResults.length}`);

  // Per-persona breakdown
  subheader('Per-Persona Accuracy');
  const personaNames = [...new Set(allResults.map(r => r.persona))];
  for (const name of personaNames) {
    const pResults = allResults.filter(r => r.persona === name);
    const pHits = pResults.flatMap(r => r.expectedHits).filter(h => h.amount !== undefined);
    const pFound = pHits.filter(h => h.found).length;
    const pMisses = pResults.flatMap(r => r.expectedMisses);
    const pCorrect = pMisses.filter(m => m.correctlyIgnored).length;
    const pFP = pResults.reduce((s, r) => s + r.falsePositives.length, 0);
    const pDedTotal = pResults.reduce((s, r) => s + r.totalDeductible, 0);

    log(`\n  ${c.cyan}${name}${c.reset}`);
    log(`    Deduction hit rate:  ${pHits.length > 0 ? ((pFound / pHits.length) * 100).toFixed(0) : 'N/A'}% (${pFound}/${pHits.length})`);
    log(`    Personal ignore:     ${pMisses.length > 0 ? ((pCorrect / pMisses.length) * 100).toFixed(0) : 'N/A'}% (${pCorrect}/${pMisses.length})`);
    log(`    False positives:     ${pFP}`);
    log(`    Total deductible:    R${pDedTotal.toLocaleString()}`);

    // Show what was missed
    const missed = pHits.filter(h => !h.found);
    if (missed.length > 0) {
      log(`    ${c.red}Missed deductions:${c.reset} ${missed.map(m => m.keyword).join(', ')}`);
    }
  }

  log(`\n${c.dim}${'─'.repeat(60)}${c.reset}`);

  // Grade
  const overallScore = (parseFloat(deductionAccuracy as string) + parseFloat(personalAccuracy as string)) / 2;
  if (overallScore >= 90) {
    log(`\n  ${c.green}${c.bright}GRADE: A — Excellent. AI is catching deductions accurately.${c.reset}`);
  } else if (overallScore >= 75) {
    log(`\n  ${c.yellow}${c.bright}GRADE: B — Good. Some deductions being missed.${c.reset}`);
  } else if (overallScore >= 60) {
    log(`\n  ${c.yellow}${c.bright}GRADE: C — Needs improvement. Significant misses.${c.reset}`);
  } else {
    log(`\n  ${c.red}${c.bright}GRADE: F — Poor. AI is not reliably catching deductions.${c.reset}`);
  }

  return allResults;
}

// ─── Cleanup ────────────────────────────────────────────────────────────
async function cleanup() {
  header('CLEANUP: Removing test data');

  const personas = buildPersonas();
  for (const persona of personas) {
    // Login and delete account data
    const res = await api('POST', '/api/auth/login', {
      email: persona.email,
      password: TEST_PASSWORD,
    });

    if (res.status === 200 && res.cookie) {
      // Delete all transactions for all tax years
      const tyRes = await api('GET', '/api/tax-years', undefined, res.cookie);
      if (tyRes.status === 200) {
        for (const ty of tyRes.data.taxYears || []) {
          await api('DELETE', `/api/transactions?taxYearId=${ty.id}`, undefined, res.cookie);
        }
      }
      ok(`Cleaned: ${persona.email}`);
    } else {
      warn(`Couldn't login to clean: ${persona.email} (may not exist)`);
    }
  }

  info('Note: User accounts left in place (no delete endpoint). Remove from DB directly if needed:');
  info(`  DELETE FROM users WHERE email LIKE '${TEST_EMAIL_PREFIX}%${TEST_EMAIL_DOMAIN}';`);
}

// ─── Report Only ────────────────────────────────────────────────────────
async function reportOnly() {
  header('DATABASE REPORT');

  const personas = buildPersonas();
  for (const persona of personas) {
    const res = await api('POST', '/api/auth/login', {
      email: persona.email,
      password: TEST_PASSWORD,
    });

    if (res.status !== 200) {
      warn(`${persona.name}: Not found`);
      continue;
    }

    const cookie = res.cookie!;
    const tyRes = await api('GET', '/api/tax-years', undefined, cookie);
    if (tyRes.status !== 200) continue;

    log(`\n  ${c.cyan}${persona.name}${c.reset} (${persona.occupation})`);
    
    for (const ty of tyRes.data.taxYears || []) {
      const txRes = await api('GET', `/api/transactions?taxYearId=${ty.id}`, undefined, cookie);
      if (txRes.status !== 200) continue;
      const s = txRes.data.summary;
      if (s.transactionCount === 0) continue;
      log(`    ${ty.yearLabel}: ${s.transactionCount} txns | Income R${s.totalIncome.toLocaleString()} | Deductible R${s.totalDeductible.toLocaleString()}`);
    }
  }
}

// ─── Entry Point ────────────────────────────────────────────────────────
(async () => {
  try {
    if (REPORT_ONLY) {
      await reportOnly();
    } else if (CLEANUP_ONLY) {
      await cleanup();
    } else {
      await runStressTest();
      if (!NO_CLEANUP) {
        log('');
        info(`To clean up test data: npx tsx scripts/stress-test.ts --cleanup-only`);
        info(`To keep data and view: npx tsx scripts/stress-test.ts --report-only`);
      }
    }
  } catch (err: any) {
    fail(`Fatal error: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
})();
