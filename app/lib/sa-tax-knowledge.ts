// ============================================================================
// South African Tax Knowledge Base
// Hard-coded SARS rules, deduction limits, and occupation-specific knowledge.
// This is what makes us BETTER than ChatGPT — constrained, validated, accurate.
// ============================================================================

// ─── Occupation-Specific Deduction Maps ────────────────────────────────────
// Each occupation has specific deductions that SARS recognizes.
// The AI uses these as a checklist — it doesn't guess, it matches.

export interface OccupationDeduction {
  category: string;
  description: string;
  sarsSection: string;
  maxDeductiblePct: number;  // 0-100
  annualLimit?: number;      // Max ZAR per year if applicable
  keywords: string[];        // Transaction descriptions to match
  notes: string;
  requiresProof: string;
}

export interface OccupationProfile {
  id: string;
  label: string;
  aliases: string[];  // Other names people might use
  deductions: OccupationDeduction[];
  commonMissed: string[];  // Deductions people commonly forget
  tips: string[];
}

export const OCCUPATION_PROFILES: OccupationProfile[] = [
  {
    id: 'medical_professional',
    label: 'Medical Professional (Doctor, Dentist, Specialist)',
    aliases: ['doctor', 'dentist', 'specialist', 'surgeon', 'GP', 'general practitioner', 'physician', 'dermatologist', 'paediatrician', 'psychiatrist', 'radiologist', 'anaesthetist', 'pathologist', 'optometrist', 'physiotherapist', 'chiropractor'],
    deductions: [
      { category: 'PROFESSIONAL', description: 'HPCSA registration fees', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['hpcsa', 'health professions council'], notes: 'Annual registration with Health Professions Council of SA', requiresProof: 'HPCSA receipt' },
      { category: 'PROFESSIONAL', description: 'BHF / medical scheme admin fees', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['bhf', 'board of healthcare funders'], notes: 'If in private practice', requiresProof: 'BHF statement' },
      { category: 'INSURANCE', description: 'Medical malpractice insurance', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['mps', 'medical protection', 'malpractice', 'indemnity', 'medprotect'], notes: 'Essential for private practice — fully deductible', requiresProof: 'Insurance certificate' },
      { category: 'EQUIPMENT', description: 'Medical equipment & consumables', sarsSection: 'Section 11(e)', maxDeductiblePct: 100, keywords: ['medical supplies', 'consumables', 'instruments', 'stethoscope', 'scrubs', 'PPE'], notes: 'Wear & tear allowance for equipment over R7,000', requiresProof: 'Invoices' },
      { category: 'TRAINING', description: 'CPD (Continuing Professional Development)', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['cpd', 'conference', 'medical congress', 'seminar', 'workshop', 'CME'], notes: 'Including travel to CPD events', requiresProof: 'CPD certificates + receipts' },
      { category: 'OFFICE', description: 'Practice rooms / consulting rooms', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['practice', 'consulting room', 'rooms rent'], notes: 'Rent for practice rooms', requiresProof: 'Lease agreement + receipts' },
      { category: 'PROFESSIONAL', description: 'Practice management software', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['healthbridge', 'geniustx', 'practice management', 'elation', 'mededi'], notes: 'Billing and patient management systems', requiresProof: 'Subscription invoices' },
    ],
    commonMissed: [
      'Malpractice insurance premiums',
      'CPD travel and accommodation costs',
      'Medical journals and textbook subscriptions',
      'Locum agency fees (if applicable)',
      'Practice management software subscriptions',
    ],
    tips: [
      'Keep a logbook if you travel between hospitals/clinics — vehicle expenses are deductible.',
      'Your HPCSA annual fees are fully deductible — don\'t miss this.',
      'If you work from a home office AND a practice, you can claim both (proportionally).',
    ],
  },
  {
    id: 'it_professional',
    label: 'IT / Software Professional',
    aliases: ['software engineer', 'software developer', 'web developer', 'programmer', 'data scientist', 'IT consultant', 'systems administrator', 'devops', 'frontend developer', 'backend developer', 'full stack', 'tech lead', 'CTO', 'scrum master', 'UX designer', 'UI designer'],
    deductions: [
      { category: 'EQUIPMENT', description: 'Computer equipment & hardware', sarsSection: 'Section 11(e)', maxDeductiblePct: 100, keywords: ['laptop', 'computer', 'monitor', 'keyboard', 'mouse', 'headset', 'webcam', 'dell', 'apple', 'lenovo', 'incredible', 'takealot'], notes: 'Wear & tear over 3 years for items >R7,000. Items <R7,000 immediate deduction.', requiresProof: 'Invoices' },
      { category: 'EQUIPMENT', description: 'Software subscriptions & licenses', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['github', 'jetbrains', 'microsoft', 'adobe', 'figma', 'aws', 'azure', 'google cloud', 'heroku', 'vercel', 'netlify', 'digitalocean', 'openai', 'slack', 'zoom', 'notion', 'atlassian', 'jira'], notes: 'Monthly/annual software tools for work', requiresProof: 'Subscription invoices' },
      { category: 'UTILITIES', description: 'Internet & fibre connection', sarsSection: 'Section 11(a)', maxDeductiblePct: 50, keywords: ['fibre', 'internet', 'vumatel', 'openserve', 'rain', 'afrihost', 'webafrica', 'cool ideas', 'mweb'], notes: 'Typically 50% deductible if used for both work and personal', requiresProof: 'ISP invoices' },
      { category: 'TRAINING', description: 'Online courses & certifications', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['udemy', 'coursera', 'pluralsight', 'linkedin learning', 'aws certification', 'certification exam'], notes: 'Must be related to your current work', requiresProof: 'Course receipts + certificates' },
      { category: 'PROFESSIONAL', description: 'Professional memberships', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['iitpsa', 'ieee', 'acm'], notes: 'IT professional body memberships', requiresProof: 'Membership receipts' },
    ],
    commonMissed: [
      'Cloud hosting costs (AWS, Azure, GCP) for personal/portfolio projects used professionally',
      'Domain name registrations for professional use',
      'Standing desk, ergonomic chair — if >50% work use',
      'Online learning platform subscriptions',
      'Phone used for 2FA and work communication (proportional)',
    ],
    tips: [
      'If you freelance on the side, ALL tools used for that work are deductible against freelance income.',
      'Home office deduction can be significant for remote workers — calculate your dedicated space %.',
      'Keep records of which software is for work vs personal use.',
    ],
  },
  {
    id: 'freelancer',
    label: 'Freelancer / Independent Contractor',
    aliases: ['freelance', 'independent contractor', 'consultant', 'self-employed', 'sole proprietor', 'gig worker', 'contractor'],
    deductions: [
      { category: 'OFFICE', description: 'Home office expenses', sarsSection: 'Section 11(a) read with 23(b)', maxDeductiblePct: 100, keywords: ['electricity', 'rent', 'rates', 'levy', 'cleaning'], notes: 'Proportional to dedicated office space. Must be used EXCLUSIVELY for work.', requiresProof: 'Lease/bond + utility bills + floor plan measurement' },
      { category: 'EQUIPMENT', description: 'Business equipment', sarsSection: 'Section 11(e)', maxDeductiblePct: 100, keywords: ['laptop', 'printer', 'desk', 'chair', 'stationery'], notes: 'Wear & tear allowance: 50% year 1, 30% year 2, 20% year 3 for >R7,000', requiresProof: 'Invoices' },
      { category: 'PROFESSIONAL', description: 'Accounting & tax services', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['accountant', 'tax', 'bookkeeper', 'xero', 'sage', 'freshbooks', 'invoisseur'], notes: 'Your tax prep costs are themselves deductible!', requiresProof: 'Accountant invoices' },
      { category: 'MARKETING', description: 'Marketing & advertising', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['google ads', 'facebook ads', 'linkedin', 'advertising', 'business cards', 'domain', 'hosting'], notes: 'Business marketing expenses', requiresProof: 'Ad platform receipts' },
      { category: 'BANK', description: 'Business bank charges', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['bank fee', 'service fee', 'monthly fee', 'transaction fee'], notes: 'If using a business account, 100% deductible', requiresProof: 'Bank statements' },
      { category: 'INSURANCE', description: 'Professional indemnity insurance', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['professional indemnity', 'business insurance', 'liability'], notes: 'Business insurance premiums', requiresProof: 'Insurance schedules' },
      { category: 'UTILITIES', description: 'Phone & internet', sarsSection: 'Section 11(a)', maxDeductiblePct: 50, keywords: ['vodacom', 'mtn', 'cell c', 'telkom', 'fibre', 'internet', 'data'], notes: 'Proportional to business use — typically 50%', requiresProof: 'Bills + usage estimation' },
    ],
    commonMissed: [
      'Tax preparation fees (yes, paying for this app is deductible!)',
      'Business portion of vehicle expenses',
      'Short-term insurance on business assets',
      'Bad debts from non-paying clients',
      'Stationery and printing costs',
      'Co-working space fees',
    ],
    tips: [
      'CRITICAL: Keep your personal and business banking separate. Mixed accounts make deductions harder to prove.',
      'Provisional tax payments are due in August and February — set aside 25-30% of income.',
      'You MUST register for provisional tax if your income exceeds R30,000 outside of employment.',
    ],
  },
  {
    id: 'sales_commission',
    label: 'Sales / Commission Earner',
    aliases: ['sales', 'sales rep', 'sales representative', 'estate agent', 'real estate agent', 'property agent', 'insurance broker', 'financial advisor', 'commission earner'],
    deductions: [
      { category: 'VEHICLE', description: 'Vehicle expenses (business travel)', sarsSection: 'Section 8(1)(b)', maxDeductiblePct: 80, keywords: ['fuel', 'petrol', 'diesel', 'engen', 'shell', 'caltex', 'sasol', 'totalenergies', 'car wash', 'tyres', 'service'], notes: 'Keep a detailed logbook! Business km / total km = deductible %', requiresProof: 'Logbook + fuel receipts' },
      { category: 'TRAVEL', description: 'Travel & accommodation', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['hotel', 'flight', 'uber', 'car hire', 'toll', 'parking', 'airbnb'], notes: 'Must be for business purposes', requiresProof: 'Receipts + purpose documentation' },
      { category: 'UTILITIES', description: 'Mobile phone', sarsSection: 'Section 11(a)', maxDeductiblePct: 70, keywords: ['vodacom', 'mtn', 'cell c', 'telkom mobile'], notes: 'Higher deduction for sales roles — phone is essential tool', requiresProof: 'Phone bills' },
      { category: 'MARKETING', description: 'Client entertainment (limited)', sarsSection: 'Section 11(a)', maxDeductiblePct: 50, annualLimit: 5000, keywords: ['restaurant', 'lunch', 'dinner', 'client meeting'], notes: 'SARS is STRICT on entertainment. Only 50% deductible, keep detailed records of who/why.', requiresProof: 'Receipts + client names + business purpose' },
      { category: 'PROFESSIONAL', description: 'Professional body fees', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['fpi', 'cfp', 'estate agency affairs board', 'fsca'], notes: 'FPI, EAAB, FSCA registrations', requiresProof: 'Membership receipts' },
    ],
    commonMissed: [
      'Vehicle logbook deduction (most people forget to keep a logbook)',
      'Home office for admin/call work',
      'Client gifts (limited deductibility)',
      'Branded clothing/uniforms',
      'Parking at client sites',
    ],
    tips: [
      'A LOGBOOK IS ESSENTIAL. Without it, SARS can deny your entire vehicle claim.',
      'The actual cost method vs SARS fixed cost method — calculate both and use the better one.',
      'If you receive a travel allowance, the excess after deductions is taxable income.',
    ],
  },
  {
    id: 'legal_professional',
    label: 'Legal Professional (Attorney, Advocate)',
    aliases: ['attorney', 'lawyer', 'advocate', 'legal advisor', 'paralegal', 'conveyancer', 'notary'],
    deductions: [
      { category: 'PROFESSIONAL', description: 'Law Society / Bar Council fees', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['law society', 'bar council', 'lssa', 'legal practice council', 'lpc'], notes: 'Annual professional registration', requiresProof: 'LPC receipt' },
      { category: 'INSURANCE', description: 'Professional indemnity insurance', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['professional indemnity', 'LPIIF', 'attorneys insurance'], notes: 'Mandatory for practicing attorneys', requiresProof: 'Insurance certificate' },
      { category: 'TRAINING', description: 'Legal CPD & conferences', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['cpd', 'legal conference', 'seminar', 'law', 'workshop'], notes: 'Continuing legal education', requiresProof: 'CPD certificates + receipts' },
      { category: 'EQUIPMENT', description: 'Legal research tools', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['lexisnexis', 'juta', 'sabinet', 'legal research', 'law library'], notes: 'Online legal databases and law reports', requiresProof: 'Subscription invoices' },
    ],
    commonMissed: [
      'Fidelity fund contributions',
      'Legal research database subscriptions',
      'Travel to courts/clients',
      'Professional gowns and attire (advocates)',
    ],
    tips: [
      'Advocates in their own practice can claim home office as chambers.',
      'Pro bono work doesn\'t create a deduction, but associated costs (travel, printing) may be deductible.',
    ],
  },
  {
    id: 'education_professional',
    label: 'Teacher / Education Professional',
    aliases: ['teacher', 'lecturer', 'professor', 'educator', 'tutor', 'trainer', 'academic'],
    deductions: [
      { category: 'PROFESSIONAL', description: 'SACE registration', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['sace', 'south african council for educators'], notes: 'Annual registration fee', requiresProof: 'SACE receipt' },
      { category: 'TRAINING', description: 'Further studies & qualifications', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['university', 'unisa', 'nmmu', 'wits', 'uct', 'tuition', 'education'], notes: 'Only if related to CURRENT teaching position', requiresProof: 'Registration + fee receipts' },
      { category: 'OFFICE', description: 'Teaching materials & supplies', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['stationery', 'books', 'textbook', 'educational', 'school supplies'], notes: 'Purchased from own pocket for classroom use', requiresProof: 'Receipts' },
    ],
    commonMissed: [
      'Classroom supplies purchased out of pocket',
      'Educational app/software subscriptions',
      'Travel between schools (if teaching at multiple)',
      'Home office for lesson preparation (if applicable)',
    ],
    tips: [
      'Employed teachers have LIMITED deduction options — only if expenses are required AND not reimbursed.',
      'If you tutor privately on the side, those expenses are deductible against tutoring income.',
    ],
  },
  {
    id: 'construction_trades',
    label: 'Construction / Trades',
    aliases: ['builder', 'plumber', 'electrician', 'carpenter', 'mechanic', 'welder', 'artisan', 'contractor', 'construction worker', 'painter'],
    deductions: [
      { category: 'EQUIPMENT', description: 'Tools & equipment', sarsSection: 'Section 11(e)', maxDeductiblePct: 100, keywords: ['tools', 'hardware', 'builder', 'cashbuild', 'build it', 'makro', 'leroy merlin'], notes: 'Wear & tear on tools. Small tools (<R7,000) immediate deduction.', requiresProof: 'Invoices' },
      { category: 'VEHICLE', description: 'Work vehicle / bakkie', sarsSection: 'Section 8(1)(b)', maxDeductiblePct: 80, keywords: ['fuel', 'petrol', 'diesel', 'vehicle service', 'tyres'], notes: 'Must keep logbook for business vs personal use', requiresProof: 'Logbook + receipts' },
      { category: 'INSURANCE', description: 'COIDA / workman\'s comp', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['coida', 'compensation fund', 'workmen'], notes: 'Compensation for Occupational Injuries and Diseases', requiresProof: 'COIDA certificate' },
      { category: 'OFFICE', description: 'Materials & consumables', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['cement', 'paint', 'pipes', 'wiring', 'materials'], notes: 'Only if not reimbursed by client, and for income-producing work', requiresProof: 'Invoices' },
    ],
    commonMissed: [
      'Safety equipment and PPE',
      'Work clothing/uniforms with protective function',
      'Trade-specific insurance premiums',
      'License and certification renewals',
    ],
    tips: [
      'Keep ALL receipts for tools and materials. SARS audits trades workers frequently.',
      'If you use your bakkie for work, a logbook is NON-NEGOTIABLE.',
    ],
  },
  {
    id: 'dj_musician',
    label: 'DJ / Musician / Music Producer',
    aliases: ['dj', 'disc jockey', 'musician', 'music producer', 'singer', 'vocalist', 'rapper', 'band', 'composer', 'songwriter', 'beatmaker', 'sound engineer', 'audio engineer', 'performer'],
    deductions: [
      { category: 'EQUIPMENT', description: 'Music equipment & instruments', sarsSection: 'Section 11(e)', maxDeductiblePct: 100, keywords: ['guitar', 'keyboard', 'turntable', 'cdj', 'mixer', 'speaker', 'amplifier', 'microphone', 'midi', 'controller', 'pioneer', 'denon', 'takealot', 'music store'], notes: 'Wear & tear over 3-5 years for items >R7,000. Instruments, decks, mixers, speakers, mics all qualify.', requiresProof: 'Invoices + proof of professional use' },
      { category: 'EQUIPMENT', description: 'Music software & subscriptions', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['spotify', 'beatport', 'ableton', 'logic pro', 'fl studio', 'serato', 'rekordbox', 'splice', 'distrokid', 'tunecore', 'soundcloud', 'bandcamp', 'plugin', 'waves', 'native instruments', 'izotope'], notes: 'DAW software, DJ software, sample packs, distribution platforms', requiresProof: 'Subscription invoices' },
      { category: 'TRAVEL', description: 'Gig travel & accommodation', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['flight', 'uber', 'hotel', 'airbnb', 'car hire', 'toll', 'parking', 'fuel', 'petrol'], notes: 'Travel to gigs, studio sessions, performances. Keep records of gig dates + venues.', requiresProof: 'Receipts + gig schedule/contracts' },
      { category: 'MARKETING', description: 'Promotion & marketing', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['facebook ads', 'instagram', 'google ads', 'poster', 'flyer', 'press', 'PR', 'music video', 'photography', 'branding'], notes: 'Social media ads, music video production, promo materials, press kits', requiresProof: 'Ad platform receipts + invoices' },
      { category: 'PROFESSIONAL', description: 'Agent/manager commissions', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['agent', 'manager', 'booking', 'commission', 'management fee'], notes: 'Fees paid to agents, managers, booking agents', requiresProof: 'Agency invoices/contracts' },
      { category: 'OFFICE', description: 'Studio rental / home studio', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['studio', 'rehearsal', 'practice room', 'recording'], notes: 'Studio hire or home studio space (proportional if at home)', requiresProof: 'Lease/invoices + floor plan for home studio' },
      { category: 'INSURANCE', description: 'Equipment insurance', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['equipment insurance', 'instrument insurance', 'music insurance'], notes: 'Insurance on professional music equipment', requiresProof: 'Insurance schedules' },
      { category: 'PROFESSIONAL', description: 'SAMRO / CAPASSO / SAMPRA royalties admin', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['samro', 'capasso', 'sampra', 'risa'], notes: 'Music rights organisation membership and administration fees', requiresProof: 'Membership receipts' },
    ],
    commonMissed: [
      'Music streaming service subscriptions used for research/work',
      'Sound treatment and acoustic panels for home studio',
      'Transport of equipment (courier, trailer hire)',
      'Costume/stage wardrobe for performances',
      'Music video production costs',
      'Sound engineer or producer fees',
      'SAMRO/CAPASSO membership fees',
    ],
    tips: [
      'Keep a gig diary — dates, venues, fees earned. This proves your music income is professional, not a hobby.',
      'Your home studio space qualifies as a home office — measure the dedicated area.',
      'Equipment wear & tear is a MAJOR deduction. A R50,000 DJ setup = ~R25,000 deduction in year 1.',
      'Register for provisional tax if music income exceeds R30,000/year outside employment.',
    ],
  },
  {
    id: 'content_creator',
    label: 'YouTuber / Content Creator / Influencer',
    aliases: ['youtuber', 'content creator', 'influencer', 'social media', 'blogger', 'vlogger', 'streamer', 'twitch', 'tiktok', 'tiktoker', 'instagram influencer', 'podcaster', 'creator'],
    deductions: [
      { category: 'EQUIPMENT', description: 'Camera, lighting & production gear', sarsSection: 'Section 11(e)', maxDeductiblePct: 100, keywords: ['camera', 'canon', 'sony', 'nikon', 'lens', 'tripod', 'gimbal', 'lighting', 'ring light', 'gopro', 'drone', 'microphone', 'rode', 'audio', 'sd card'], notes: 'Cameras, lenses, lighting, audio equipment, drones. Wear & tear over 3 years.', requiresProof: 'Invoices' },
      { category: 'EQUIPMENT', description: 'Editing software & tools', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['adobe', 'premiere', 'final cut', 'davinci', 'canva', 'photoshop', 'lightroom', 'capcut', 'figma', 'envato', 'epidemic sound', 'artlist', 'storyblocks'], notes: 'Video/photo editing software, stock footage, music licensing', requiresProof: 'Subscription invoices' },
      { category: 'UTILITIES', description: 'Internet & data', sarsSection: 'Section 11(a)', maxDeductiblePct: 70, keywords: ['fibre', 'internet', 'data', 'vodacom', 'mtn', 'rain', 'afrihost'], notes: 'High % deductible — uploading video content requires significant bandwidth', requiresProof: 'ISP invoices' },
      { category: 'MARKETING', description: 'Paid promotion & sponsorships', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['boost', 'promotion', 'sponsored', 'facebook ads', 'google ads', 'youtube ads', 'instagram ads'], notes: 'Costs to promote your content and grow your audience', requiresProof: 'Ad platform receipts' },
      { category: 'OFFICE', description: 'Studio/filming space', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['studio', 'backdrop', 'set design', 'props'], notes: 'Home studio room or rented filming space', requiresProof: 'Lease + floor plan' },
      { category: 'TRAVEL', description: 'Travel for content creation', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['flight', 'hotel', 'uber', 'airbnb', 'car hire'], notes: 'Travel to filming locations, brand events, collaborations', requiresProof: 'Receipts + content proof (uploaded videos)' },
      { category: 'PROFESSIONAL', description: 'Editors, designers & freelancers', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['editor', 'freelancer', 'designer', 'thumbnail', 'fiverr', 'upwork'], notes: 'Paying others to edit videos, design thumbnails, manage socials', requiresProof: 'Invoices from freelancers' },
      { category: 'PROFESSIONAL', description: 'Management & talent agency fees', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['management', 'talent agency', 'mcn', 'agent'], notes: 'Multi-channel network fees, talent manager commissions', requiresProof: 'Agency contracts/invoices' },
    ],
    commonMissed: [
      'Props and set furniture used in content',
      'Products bought to review (if not gifted/sponsored)',
      'Phone used for filming/social media (proportional)',
      'Wardrobe specifically for on-camera — must be "costume" not regular clothing',
      'Travel to brand collaboration events',
      'Accounting/tax prep fees',
      'Domain & hosting for personal website/portfolio',
    ],
    tips: [
      'SARS treats content creation as self-employment — register for provisional tax if income > R30,000.',
      'Keep records showing your channel/page is a BUSINESS (income statements, brand deals, ad revenue).',
      'Gifted products for review are taxable income at market value — but you can deduct business use.',
      'Your home filming space qualifies as a home office if used exclusively for content creation.',
    ],
  },
  {
    id: 'visual_artist',
    label: 'Visual Artist / Designer / Photographer',
    aliases: ['artist', 'painter', 'sculptor', 'graphic designer', 'photographer', 'illustrator', 'animator', 'fine artist', 'craft', 'ceramic', 'printmaker', 'muralist', 'tattoo artist', 'creative director'],
    deductions: [
      { category: 'EQUIPMENT', description: 'Art supplies & materials', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['canvas', 'paint', 'brush', 'ink', 'paper', 'clay', 'supplies', 'art materials', 'framing', 'deckle', 'artsavingsclub', 'pen', 'pigment'], notes: 'All consumable materials used to create art for sale', requiresProof: 'Receipts from art supply stores' },
      { category: 'EQUIPMENT', description: 'Professional equipment', sarsSection: 'Section 11(e)', maxDeductiblePct: 100, keywords: ['camera', 'printer', 'wacom', 'tablet', 'mac', 'imac', 'ipad', 'lens', 'lighting', 'easel', 'kiln'], notes: 'Cameras, computers, drawing tablets, printers. Wear & tear for >R7,000.', requiresProof: 'Invoices' },
      { category: 'EQUIPMENT', description: 'Design software & subscriptions', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['adobe', 'photoshop', 'illustrator', 'procreate', 'figma', 'sketch', 'affinity', 'capture one', 'lightroom'], notes: 'Creative software subscriptions', requiresProof: 'Subscription invoices' },
      { category: 'OFFICE', description: 'Studio space', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['studio', 'gallery', 'workspace', 'workshop'], notes: 'Rented studio or home studio (proportional)', requiresProof: 'Lease + floor plan' },
      { category: 'MARKETING', description: 'Exhibition & marketing costs', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['exhibition', 'gallery commission', 'portfolio', 'business cards', 'website', 'domain'], notes: 'Gallery commissions, exhibition fees, print portfolios, online portfolio hosting', requiresProof: 'Gallery contracts + invoices' },
      { category: 'TRAVEL', description: 'Travel for shoots/exhibitions', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['flight', 'uber', 'hotel', 'airbnb', 'petrol', 'fuel'], notes: 'Travel to photoshoots, exhibitions, art fairs, client meetings', requiresProof: 'Receipts + event documentation' },
    ],
    commonMissed: [
      'Art supply purchases (often paid cash — keep receipts!)',
      'Gallery commissions (usually 40-60% of sale price, fully deductible)',
      'Portfolio website hosting and domain costs',
      'Art fair stall/entry fees',
      'Printing and framing costs for exhibitions',
      'Model hire for photoshoots',
    ],
    tips: [
      'Gallery commissions (30-60%) are deductible against your art income — get statements from galleries.',
      'If you sell art online (Etsy, own website), platform fees and shipping are deductible.',
      'Home studio deduction can be substantial — measure your dedicated creative space accurately.',
      'Keep a catalogue of works sold with dates and prices for SARS income reconciliation.',
    ],
  },
  {
    id: 'performer_dancer',
    label: 'Dancer / Performer / Actor',
    aliases: ['dancer', 'actor', 'actress', 'performer', 'theatre', 'theater', 'stage', 'ballet', 'choreographer', 'stunt', 'voice actor', 'comedian', 'entertainer', 'mc', 'master of ceremonies', 'emcee', 'model'],
    deductions: [
      { category: 'TRAINING', description: 'Classes, coaching & workshops', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['dance class', 'acting class', 'coaching', 'workshop', 'masterclass', 'vocal training', 'singing lessons', 'rehearsal'], notes: 'Ongoing training to maintain/improve professional skills', requiresProof: 'Class/studio receipts' },
      { category: 'EQUIPMENT', description: 'Costumes, shoes & wardrobe', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['costume', 'dance shoes', 'pointe', 'leotard', 'tights', 'performance wear', 'wardrobe', 'makeup', 'wig'], notes: 'Performance-specific clothing, dance shoes, stage costumes. NOT everyday clothing.', requiresProof: 'Receipts + proof of professional use' },
      { category: 'EQUIPMENT', description: 'Stage makeup & grooming', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['mac cosmetics', 'stage makeup', 'makeup artist', 'hair', 'grooming', 'salon'], notes: 'Stage/performance makeup and hair. Must be for professional appearances, not personal grooming.', requiresProof: 'Receipts + performance schedule' },
      { category: 'TRAVEL', description: 'Travel to auditions, rehearsals & shows', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['flight', 'uber', 'hotel', 'airbnb', 'fuel', 'petrol', 'toll', 'parking'], notes: 'Travel to auditions, rehearsals, performances, tours', requiresProof: 'Receipts + audition/show schedule' },
      { category: 'PROFESSIONAL', description: 'Agent & casting fees', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['agent', 'casting', 'agency commission', 'management'], notes: 'Talent agent commissions (typically 10-20% of earnings)', requiresProof: 'Agency statements' },
      { category: 'PROFESSIONAL', description: 'Union & association fees', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['saga', 'equity', 'union', 'performers'], notes: 'SA Guild of Actors (SAGA) and similar membership fees', requiresProof: 'Membership receipts' },
      { category: 'MEDICAL', description: 'Physio, sports therapy & body maintenance', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['physiotherapy', 'physio', 'sports massage', 'chiropractor', 'rehabilitation'], notes: 'Body maintenance is a work expense for physical performers. Must show professional necessity.', requiresProof: 'Practitioner receipts + doctor letter' },
      { category: 'MARKETING', description: 'Headshots, showreel & portfolio', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['headshot', 'photographer', 'showreel', 'portfolio', 'demo reel', 'comp card'], notes: 'Professional marketing materials required for auditions', requiresProof: 'Photographer/videographer invoices' },
    ],
    commonMissed: [
      'Physiotherapy and body maintenance (dancers especially)',
      'Dance shoes replacement (pointe shoes wear out frequently)',
      'Self-tape equipment for remote auditions (lighting, backdrop)',
      'Gym/fitness membership (if body maintenance is professional requirement)',
      'Agent commissions deducted from earnings',
    ],
    tips: [
      'Keep an audition/booking log — dates, roles, outcomes. This proves professional activity.',
      'Dance shoes and performance costumes are deductible because they\'re NOT everyday wear.',
      'If you teach dance/acting on the side, those expenses are separately deductible.',
      'Physio and sports therapy can be deductible as a work-related expense if your body IS your instrument.',
    ],
  },
  {
    id: 'sports_professional',
    label: 'Sports Professional / Athlete / Coach',
    aliases: ['athlete', 'sportsman', 'sportswoman', 'rugby', 'soccer', 'cricket', 'football', 'swimmer', 'runner', 'cyclist', 'golfer', 'tennis', 'boxing', 'mma', 'personal trainer', 'coach', 'fitness instructor', 'gym instructor', 'yoga instructor', 'pilates', 'sports coach', 'referee'],
    deductions: [
      { category: 'EQUIPMENT', description: 'Sports equipment & gear', sarsSection: 'Section 11(e)', maxDeductiblePct: 100, keywords: ['sports equipment', 'running shoes', 'bike', 'bicycle', 'golf', 'racket', 'bat', 'gloves', 'boots', 'wetsuit', 'sportsmans warehouse', 'totalsports', 'adidas', 'nike', 'under armour'], notes: 'Professional sports equipment, training gear, competition kit. Wear & tear for >R7,000.', requiresProof: 'Invoices + proof of professional use' },
      { category: 'TRAINING', description: 'Coaching, training & facilities', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['coaching', 'training', 'gym membership', 'swimming pool', 'track', 'club fees', 'personal trainer', 'strength', 'conditioning'], notes: 'Gym memberships, coaching fees, training facility access — if required for professional sport', requiresProof: 'Facility/coach receipts + club confirmation' },
      { category: 'TRAINING', description: 'Sports certifications & courses', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['certification', 'coaching course', 'referee course', 'first aid', 'CPR', 'REPSSA', 'fitness qualification'], notes: 'Required certifications and continuing education', requiresProof: 'Certificate + course receipts' },
      { category: 'MEDICAL', description: 'Sports medicine & rehabilitation', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['physiotherapy', 'physio', 'sports doctor', 'rehabilitation', 'sports massage', 'chiropractor', 'biokineticist', 'orthopaedic', 'supplement'], notes: 'Injury prevention and treatment, sports medicine consultations. Directly work-related for athletes.', requiresProof: 'Medical receipts + doctor letters' },
      { category: 'TRAVEL', description: 'Travel to events & competitions', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['flight', 'hotel', 'airbnb', 'uber', 'fuel', 'race entry', 'competition', 'tournament', 'event'], notes: 'Travel, accommodation, and entry fees for competitions and tournaments', requiresProof: 'Receipts + event entry confirmation' },
      { category: 'PROFESSIONAL', description: 'Agent & federation fees', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['agent', 'federation', 'sports association', 'athletics sa', 'cricket sa', 'safa'], notes: 'Sports agent commissions, federation/association membership', requiresProof: 'Agent contract + federation receipts' },
      { category: 'EQUIPMENT', description: 'Nutrition & supplements', sarsSection: 'Section 11(a)', maxDeductiblePct: 50, keywords: ['supplement', 'protein', 'dis-chem', 'nutrition', 'vitamins', 'sports drink'], notes: 'Performance supplements for professional athletes — typically 50% deductible. Must show professional necessity.', requiresProof: 'Receipts + nutritionist recommendation' },
      { category: 'INSURANCE', description: 'Sports/injury insurance', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['sports insurance', 'injury insurance', 'disability', 'income protection'], notes: 'Insurance against sports injuries that could affect income', requiresProof: 'Insurance policy + payment receipts' },
    ],
    commonMissed: [
      'Race/competition entry fees',
      'Sports nutrition and supplements (proportional)',
      'Injury rehabilitation costs',
      'GPS/tracking devices for training',
      'Physiotherapy and biokineticist sessions',
      'Branded gear sponsorship value if you provide services in return',
    ],
    tips: [
      'Professional athletes: gym memberships ARE deductible because physical fitness is your job requirement.',
      'Keep a training log — it strengthens claims for training-related expenses.',
      'Competition prize money IS taxable income. Keep records of all winnings.',
      'If you coach part-time, those expenses are deductible against coaching income.',
      'Sports supplements are a grey area — get a nutritionist letter stating professional requirement.',
    ],
  },
  {
    id: 'creative_media',
    label: 'Film / TV / Media Professional',
    aliases: ['filmmaker', 'videographer', 'camera operator', 'editor', 'producer', 'director', 'production', 'media', 'broadcast', 'journalist', 'presenter', 'news anchor', 'radio presenter', 'video editor', 'motion graphics', 'vfx', 'sound designer'],
    deductions: [
      { category: 'EQUIPMENT', description: 'Camera & production equipment', sarsSection: 'Section 11(e)', maxDeductiblePct: 100, keywords: ['camera', 'lens', 'tripod', 'gimbal', 'drone', 'lighting', 'audio', 'monitor', 'storage', 'hard drive', 'ssd'], notes: 'Professional camera gear, audio equipment, storage. Wear & tear over 2-5 years.', requiresProof: 'Invoices' },
      { category: 'EQUIPMENT', description: 'Editing hardware & software', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['adobe', 'premiere', 'after effects', 'davinci', 'final cut', 'avid', 'mac', 'imac', 'mac pro', 'external drive'], notes: 'Editing suite, NLE software, motion graphics tools', requiresProof: 'Subscription/purchase invoices' },
      { category: 'OFFICE', description: 'Edit suite / office space', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['studio', 'edit suite', 'office', 'workspace'], notes: 'Dedicated editing or production office space', requiresProof: 'Lease + floor plan' },
      { category: 'TRAVEL', description: 'Location travel & shoots', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['flight', 'hotel', 'uber', 'car hire', 'fuel', 'location', 'shoot', 'recce'], notes: 'Travel to shoots, recces, edit sessions, meetings', requiresProof: 'Receipts + call sheets' },
      { category: 'PROFESSIONAL', description: 'Industry memberships', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['nfvf', 'ipp', 'safta', 'press club', 'sanef'], notes: 'National Film and Video Foundation, industry guild fees', requiresProof: 'Membership receipts' },
      { category: 'INSURANCE', description: 'Equipment insurance', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['equipment insurance', 'camera insurance', 'production insurance'], notes: 'Insurance on production gear', requiresProof: 'Insurance schedules' },
      { category: 'PROFESSIONAL', description: 'Crew & freelancer payments', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['crew', 'freelancer', 'sound', 'gaffer', 'grip', 'makeup', 'catering'], notes: 'Payments to crew members on your productions', requiresProof: 'Invoices/contracts from crew' },
    ],
    commonMissed: [
      'Hard drive and storage costs (data-heavy industry)',
      'Stock footage and music licensing fees',
      'Location fees and permits',
      'Equipment insurance premiums',
      'Festival submission fees',
      'Portfolio/showreel hosting costs',
    ],
    tips: [
      'Keep call sheets and production schedules as proof of business activities.',
      'Storage costs (SSDs, cloud backup) add up and are fully deductible.',
      'If you own your equipment and rent it to productions, that\'s a separate income stream with its own deductions.',
      'The NFVF, DTI film incentives, and provincial film commissions may offer additional rebates on qualifying productions.',
    ],
  },
  {
    id: 'health_fitness',
    label: 'Health & Wellness Professional',
    aliases: ['nutritionist', 'dietitian', 'wellness', 'massage therapist', 'beauty therapist', 'aesthetician', 'nail technician', 'hairdresser', 'barber', 'spa therapist', 'life coach', 'motivational speaker', 'counsellor', 'psychologist', 'hypnotherapist', 'naturopath', 'homeopath'],
    deductions: [
      { category: 'PROFESSIONAL', description: 'Professional registration', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['hpcsa', 'ahpcsa', 'health council', 'registration', 'professional body'], notes: 'HPCSA or AHPCSA registration for regulated practitioners', requiresProof: 'Registration receipt' },
      { category: 'EQUIPMENT', description: 'Professional tools & products', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['supplies', 'products', 'tools', 'equipment', 'treatment bed', 'salon'], notes: 'Treatment products, professional tools, salon equipment', requiresProof: 'Supplier invoices' },
      { category: 'OFFICE', description: 'Treatment room / practice space', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['rent', 'salon', 'practice', 'room hire', 'spa'], notes: 'Salon/studio/practice room rental or home-based space', requiresProof: 'Lease + utilities' },
      { category: 'TRAINING', description: 'CPD & continuing education', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['cpd', 'course', 'certification', 'training', 'workshop', 'conference'], notes: 'Ongoing professional development courses and certifications', requiresProof: 'CPD certificates + receipts' },
      { category: 'INSURANCE', description: 'Professional indemnity insurance', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['indemnity', 'professional insurance', 'liability', 'malpractice'], notes: 'Professional liability/indemnity insurance', requiresProof: 'Insurance certificate' },
      { category: 'MARKETING', description: 'Marketing & client acquisition', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['facebook ads', 'google ads', 'instagram', 'website', 'domain', 'business cards', 'fresha', 'cliniko'], notes: 'Online ads, booking platform fees, marketing materials', requiresProof: 'Ad receipts + platform invoices' },
    ],
    commonMissed: [
      'Booking platform fees (Fresha, Cliniko, etc.)',
      'Cleaning and hygiene supplies for treatment spaces',
      'Professional product samples',
      'Laundry costs for professional towels/linens',
      'Business portion of vehicle if doing home visits',
    ],
    tips: [
      'If you rent a chair/room in a salon, that rental is fully deductible against your income.',
      'Product costs are deductible when used on clients — keep business and personal purchases separate.',
      'If you run a mobile service (home visits), vehicle logbook is essential for travel deductions.',
    ],
  },
  {
    id: 'general_employed',
    label: 'General Employment (Salaried)',
    aliases: ['employed', 'salaried', 'office worker', 'administrator', 'manager', 'clerk', 'general', 'receptionist', 'PA', 'executive', 'director'],
    deductions: [
      { category: 'PROFESSIONAL', description: 'Professional body membership', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['membership', 'registration', 'professional body'], notes: 'Must be required for your job', requiresProof: 'Membership receipt' },
      { category: 'TRAINING', description: 'Work-related studies', sarsSection: 'Section 11(a)', maxDeductiblePct: 100, keywords: ['course', 'diploma', 'degree', 'certification'], notes: 'Must be related to current employment AND paid by you (not employer)', requiresProof: 'Institution receipt + employer letter' },
    ],
    commonMissed: [
      'Retirement annuity contributions (if you make additional voluntary contributions)',
      'Medical tax credits (most people get this wrong)',
      'Donations to approved PBOs (Section 18A)',
    ],
    tips: [
      'Salaried employees have VERY limited deduction options. Focus on medical credits and RA optimization.',
      'If your employer doesn\'t provide a travel allowance but you use your car for work, you MAY have a claim.',
      'Check if you\'ve been getting the correct medical tax credits on your IRP5.',
    ],
  },
];

// ─── SARS Deduction Rules & Limits ─────────────────────────────────────────
// Hard-coded rules that the AI CANNOT override

export const SARS_DEDUCTION_RULES = {
  // Retirement Annuity - Section 11F
  retirementAnnuity: {
    sarsSection: 'Section 11F',
    maxPctOfRemuneration: 27.5,
    annualCap: 350000,
    description: 'Retirement annuity fund contributions',
    calculation: (annualIncome: number, totalContributions: number) => {
      const limit = Math.min(annualIncome * 0.275, 350000);
      return Math.min(totalContributions, limit);
    },
  },

  // Medical Tax Credits - Section 6A & 6B
  medicalCredits: {
    sarsSection: 'Section 6A & 6B',
    mainMember: 364,   // per month
    firstDependent: 364,  // per month (same as main)
    additionalDependent: 246,  // per month each
    additionalQualifyingPct: 33.3, // % of excess out-of-pocket medical costs
    description: 'Medical scheme fees tax credits',
    calculateMonthlyCredit: (members: number) => {
      if (members <= 0) return 0;
      if (members === 1) return 364;
      if (members === 2) return 364 + 364;
      return 364 + 364 + (members - 2) * 246;
    },
    calculateAnnualCredit: (members: number, monthsOnScheme: number = 12) => {
      const monthly = SARS_DEDUCTION_RULES.medicalCredits.calculateMonthlyCredit(members);
      return monthly * monthsOnScheme;
    },
    // Additional medical expenses credit (out-of-pocket)
    calculateAdditionalCredit: (
      outOfPocketMedical: number,
      medicalCreditsUsed: number,
      annualMedicalAidFees: number,
      age: number
    ) => {
      // For persons 65+ or disabled: 33.3% of (fees paid + out-of-pocket - 3 x medical credits)
      // For persons under 65: 25% of (fees paid + out-of-pocket - 4 x medical credits)
      if (age >= 65) {
        const excess = annualMedicalAidFees + outOfPocketMedical - 3 * medicalCreditsUsed;
        return Math.max(0, excess * 0.333);
      }
      const excess = outOfPocketMedical - (4 * medicalCreditsUsed - annualMedicalAidFees);
      return Math.max(0, excess * 0.25);
    },
  },

  // Home Office - Section 23(b)
  homeOffice: {
    sarsSection: 'Section 23(b)',
    description: 'Home office deduction',
    rules: {
      employed: 'Must have a dedicated room used EXCLUSIVELY for work AND be required by employer. Very strict.',
      selfEmployed: 'Must have a dedicated room used REGULARLY and EXCLUSIVELY for work. Broader allowance.',
    },
    // Deductible expenses (proportional to office area / total area)
    allowedExpenses: ['rent', 'bond interest', 'rates', 'electricity', 'water', 'cleaning', 'repairs', 'insurance', 'security'],
    calculate: (totalHomeExpenses: number, officeAreaPct: number) => {
      return totalHomeExpenses * (officeAreaPct / 100);
    },
  },

  // Travel Allowance - Section 8(1)(b)
  travelAllowance: {
    sarsSection: 'Section 8(1)(b)',
    description: 'Vehicle/travel allowance deduction',
    // SARS fixed cost table 2025/2026
    fixedCostTable: [
      { maxKm: 10000, fixedCost: 0, fuelCost: 0, maintenanceCost: 0 },  // No fixed method under 10k
      { maxKm: 14000, fixedCost: 103299, fuelCost: 159.3, maintenanceCost: 76.9 },
      { maxKm: 18000, fixedCost: 113919, fuelCost: 159.3, maintenanceCost: 77.4 },
      { maxKm: 22000, fixedCost: 128886, fuelCost: 159.3, maintenanceCost: 77.7 },
      { maxKm: 26000, fixedCost: 154895, fuelCost: 173.3, maintenanceCost: 86.7 },
      { maxKm: 30000, fixedCost: 179498, fuelCost: 173.3, maintenanceCost: 86.7 },
      { maxKm: 35000, fixedCost: 210498, fuelCost: 173.3, maintenanceCost: 86.7 },
      { maxKm: 40000, fixedCost: 210498, fuelCost: 173.3, maintenanceCost: 86.7 },
      { maxKm: Infinity, fixedCost: 210498, fuelCost: 173.3, maintenanceCost: 86.7 },
    ],
    deemedCostPerKm: 464, // cents per km for simplified method (2025/2026)
    calculate: (businessKm: number, totalKm: number, actualCosts: number) => {
      const businessPct = totalKm > 0 ? businessKm / totalKm : 0;
      const actualMethod = actualCosts * businessPct;
      // Also calculate SARS deemed method for comparison
      const deemedMethod = (businessKm * 464) / 100;
      return { actualMethod, deemedMethod, recommended: Math.max(actualMethod, deemedMethod) };
    },
  },

  // Donations - Section 18A
  donations: {
    sarsSection: 'Section 18A',
    maxPctOfTaxableIncome: 10,
    description: 'Donations to approved Public Benefit Organisations (PBOs)',
    calculate: (totalDonations: number, taxableIncome: number) => {
      const limit = taxableIncome * 0.1;
      return Math.min(totalDonations, limit);
    },
  },

  // Wear & Tear - Section 11(e)
  wearAndTear: {
    sarsSection: 'Section 11(e)',
    description: 'Depreciation on business assets',
    rates: {
      computers: { rate: 50, years: 2, description: 'Computers & peripherals (50% per year)' },
      furniture: { rate: 16.67, years: 6, description: 'Office furniture (16.67% per year)' },
      vehicles: { rate: 25, years: 4, description: 'Motor vehicles (25% per year)' },
      machinery: { rate: 20, years: 5, description: 'Machinery & equipment (20% per year)' },
      smallAssets: { rate: 100, years: 1, description: 'Assets under R7,000 (immediate write-off)' },
    },
  },

  // Entertainment - strictly limited
  entertainment: {
    sarsSection: 'Section 11(a)',
    maxDeductiblePct: 50,
    description: 'Client entertainment is generally NOT deductible except in very limited cases',
    rules: 'SARS is extremely strict. Most entertainment is not deductible. Only if directly related to producing income and you have full records (who, when, where, business purpose).',
  },
};

// ─── Tax Profile Question Definitions ──────────────────────────────────────
// These questions determine what deductions to look for in bank statements

export interface TaxProfileQuestion {
  id: string;
  question: string;
  description: string;
  type: 'boolean' | 'select' | 'number' | 'text';
  options?: { value: string; label: string }[];
  relevantDeductions: string[];
  impactLevel: 'high' | 'medium' | 'low';
}

export const TAX_PROFILE_QUESTIONS: TaxProfileQuestion[] = [
  {
    id: 'employmentType',
    question: 'What is your primary employment type?',
    description: 'This determines which deductions apply to you and how your income is taxed.',
    type: 'select',
    options: [
      { value: 'employed', label: 'Employed (salaried, receive IRP5)' },
      { value: 'self_employed', label: 'Self-employed / Freelancer' },
      { value: 'commission', label: 'Commission earner (sales, estate agent)' },
      { value: 'both', label: 'Both employed and freelancing' },
    ],
    relevantDeductions: ['all'],
    impactLevel: 'high',
  },
  {
    id: 'hasMedicalAid',
    question: 'Do you belong to a medical aid / medical scheme?',
    description: 'Medical tax credits can save you R4,000-R12,000+ per year.',
    type: 'boolean',
    relevantDeductions: ['medicalCredits'],
    impactLevel: 'high',
  },
  {
    id: 'medicalAidMembers',
    question: 'How many people are on your medical aid?',
    description: 'Include yourself, spouse, and dependents.',
    type: 'number',
    relevantDeductions: ['medicalCredits'],
    impactLevel: 'high',
  },
  {
    id: 'monthlyMedicalAidFee',
    question: 'What is your monthly medical aid contribution? (ZAR)',
    description: 'The total monthly premium you pay (not what your employer pays).',
    type: 'number',
    relevantDeductions: ['medicalCredits', 'additionalMedical'],
    impactLevel: 'high',
  },
  {
    id: 'hasRetirementAnnuity',
    question: 'Do you contribute to a Retirement Annuity (RA)?',
    description: 'RA contributions are deductible up to 27.5% of income (max R350,000/year). This is one of the biggest tax-saving tools.',
    type: 'boolean',
    relevantDeductions: ['retirementAnnuity'],
    impactLevel: 'high',
  },
  {
    id: 'annualRAContribution',
    question: 'Total annual RA contribution? (ZAR)',
    description: 'How much you contribute to your RA per year (12 × monthly contribution).',
    type: 'number',
    relevantDeductions: ['retirementAnnuity'],
    impactLevel: 'high',
  },
  {
    id: 'worksFromHome',
    question: 'Do you work from home (at least partially)?',
    description: 'If you have a dedicated home office, you may be able to claim a proportional deduction.',
    type: 'boolean',
    relevantDeductions: ['homeOffice'],
    impactLevel: 'medium',
  },
  {
    id: 'homeOfficePct',
    question: 'What percentage of your home is used exclusively as an office?',
    description: 'Measure your office room area divided by total home area. E.g., 15m² office in 120m² home = 12.5%.',
    type: 'number',
    relevantDeductions: ['homeOffice'],
    impactLevel: 'medium',
  },
  {
    id: 'usesVehicleForWork',
    question: 'Do you use your personal vehicle for work travel?',
    description: 'Not commuting — actual work travel (visiting clients, between offices, site visits).',
    type: 'boolean',
    relevantDeductions: ['travelAllowance'],
    impactLevel: 'medium',
  },
  {
    id: 'annualBusinessKm',
    question: 'Estimated annual business kilometers?',
    description: 'Approximate business km driven per year. A logbook is required for SARS.',
    type: 'number',
    relevantDeductions: ['travelAllowance'],
    impactLevel: 'medium',
  },
  {
    id: 'receivesTravelAllowance',
    question: 'Do you receive a travel allowance from your employer?',
    description: 'This is taxable but you can claim expenses against it.',
    type: 'boolean',
    relevantDeductions: ['travelAllowance'],
    impactLevel: 'medium',
  },
  {
    id: 'makesDonations',
    question: 'Do you donate to registered charities / PBOs?',
    description: 'Donations to approved Section 18A organisations are deductible up to 10% of taxable income.',
    type: 'boolean',
    relevantDeductions: ['donations'],
    impactLevel: 'low',
  },
  {
    id: 'hasOutOfPocketMedical',
    question: 'Do you have significant out-of-pocket medical expenses?',
    description: 'Medical expenses NOT covered by medical aid (gap payments, specialists, dental, optical).',
    type: 'boolean',
    relevantDeductions: ['additionalMedical'],
    impactLevel: 'medium',
  },
  {
    id: 'age',
    question: 'What is your age?',
    description: 'Age affects tax thresholds and rebates (65+ and 75+ get additional rebates).',
    type: 'number',
    relevantDeductions: ['rebates', 'medicalCredits'],
    impactLevel: 'medium',
  },
];

// ─── Prompt Builder: Creates occupation-aware AI instructions ──────────────
// This is the KEY differentiator vs ChatGPT — we don't send a generic prompt.
// We send a prompt that is customized for the user's exact situation.

export function buildAnalysisPrompt(profile: {
  occupation?: string;
  employmentType?: string;
  hasMedicalAid?: boolean;
  hasRetirementAnnuity?: boolean;
  worksFromHome?: boolean;
  usesVehicleForWork?: boolean;
  homeOfficePct?: number;
  taxNotes?: string;
}): string {
  // Find matching occupation profile
  const occLower = (profile.occupation || '').toLowerCase();
  const matchedProfile = OCCUPATION_PROFILES.find(p =>
    p.aliases.some(a => occLower.includes(a.toLowerCase())) ||
    occLower.includes(p.id.replace('_', ' '))
  ) || OCCUPATION_PROFILES.find(p => p.id === 'general_employed');

  // Build occupation-specific deduction checklist
  const deductionChecklist = matchedProfile?.deductions.map(d =>
    `- ${d.description} (${d.sarsSection}, max ${d.maxDeductiblePct}% deductible): Look for keywords: ${d.keywords.join(', ')}`
  ).join('\n') || '';

  const commonlyMissed = matchedProfile?.commonMissed.join('\n- ') || '';

  // Build conditional sections based on profile
  const sections: string[] = [];

  if (profile.hasMedicalAid) {
    sections.push(`MEDICAL: The user has medical aid. Flag medical aid debit orders and any out-of-pocket medical expenses (pharmacy, specialists, dental, optical). These qualify for medical tax credits under Section 6A/6B.`);
  }

  if (profile.hasRetirementAnnuity) {
    sections.push(`RETIREMENT: The user has a Retirement Annuity. Flag RA contributions (e.g., Allan Gray, Sanlam, Old Mutual, 10X, Discovery). Deductible under Section 11F up to 27.5% of income, max R350,000/year.`);
  }

  if (profile.worksFromHome && profile.homeOfficePct) {
    sections.push(`HOME OFFICE: The user works from home with ${profile.homeOfficePct}% of home dedicated to office. Flag rent/bond, rates, electricity, water, internet, security, cleaning payments. ${profile.homeOfficePct}% of these may be deductible under Section 23(b).`);
  }

  if (profile.usesVehicleForWork) {
    sections.push(`VEHICLE: The user uses a personal vehicle for business. Flag fuel, vehicle insurance, servicing, tyres, licence fees, tolls, parking. Must distinguish business from personal travel.`);
  }

  if (profile.taxNotes && profile.taxNotes.trim()) {
    sections.push(`USER'S ADDITIONAL CONTEXT (treat as sworn testimony — use this to make more accurate deduction decisions):\n${profile.taxNotes.trim()}`);
  }

  const employmentContext = profile.employmentType === 'self_employed' || profile.employmentType === 'commission'
    ? 'The user is self-employed/commission-based. MORE deductions are available compared to salaried employees.'
    : profile.employmentType === 'both'
      ? 'The user is both employed AND freelances. Deductions apply to the freelance income portion.'
      : 'The user is salaried. Deduction options are LIMITED to specific categories (Section 23(b) home office, professional fees, etc.).';

  return `You are a South African tax expert AI specializing in tax analysis for a ${matchedProfile?.label || 'general taxpayer'}.

EMPLOYMENT STATUS: ${employmentContext}

YOUR TASK: Analyze the bank statement and extract ALL transactions. For EACH transaction, determine if it qualifies as a tax deduction based on the user's specific occupation and situation.

═══ OCCUPATION-SPECIFIC DEDUCTIONS TO LOOK FOR ═══
${deductionChecklist}

═══ COMMONLY MISSED DEDUCTIONS FOR THIS OCCUPATION ═══
- ${commonlyMissed}

═══ USER'S SPECIFIC TAX SITUATION ═══
${sections.join('\n')}

═══ UNIVERSAL DEDUCTIONS (apply to everyone) ═══
- Retirement Annuity contributions (Section 11F) — max 27.5% of income, cap R350,000
- Donations to approved PBOs with Section 18A certificates — max 10% of taxable income
- Medical scheme contributions → medical tax credits (Section 6A)
- Bad debts written off (self-employed only)
- Interest on business loans (if applicable)

═══ STRICT RULES (DO NOT VIOLATE) ═══
1. Entertainment expenses are generally NOT deductible in SA. Only mark as deductible if CLEARLY business-related with strong evidence.
2. Personal living expenses (groceries, personal clothing, gym, streaming services) are NEVER deductible.
3. Commuting to/from work is NOT a deductible travel expense.
4. If employed, home office deduction requires EXCLUSIVE use AND employer requirement.
5. Mixed-use items (phone, internet) — suggest proportional deduction (typically 30-70% depending on role).
6. Transfers between own accounts are NOT income or expenses — mark as TRANSFER.
7. Loan repayments (bond, personal loan, car finance) — only the INTEREST portion may be deductible, and only for business purposes.
8. Insurance — only BUSINESS insurance is deductible, not personal life/household insurance.
9. Be CONSERVATIVE. If unsure, mark as NOT deductible with notes explaining why.

═══ OUTPUT FORMAT ═══
Return a JSON object:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "Original transaction description",
      "amount": number (positive for income, negative for expenses),
      "type": "INCOME" | "EXPENSE" | "TRANSFER",
      "category": "SALARY" | "FREELANCE" | "INVESTMENT" | "RENTAL" | "OTHER_INCOME" | "OFFICE" | "TRAVEL" | "VEHICLE" | "EQUIPMENT" | "PROFESSIONAL" | "MARKETING" | "UTILITIES" | "INSURANCE" | "BANK" | "TRAINING" | "RENT" | "ENTERTAINMENT" | "MEDICAL" | "FOOD" | "PERSONAL" | "TRANSFER" | "DONATION" | "RETIREMENT" | "OTHER",
      "isDeductible": boolean,
      "deductiblePct": 0-100,
      "confidence": 0.0-1.0,
      "sarsSection": "Section XX" or null,
      "notes": "Brief explanation of deductibility reasoning",
      "flag": "OBVIOUS" | "LIKELY" | "REVIEW" | "PERSONAL" | null
    }
  ],
  "summary": {
    "totalIncome": number,
    "totalExpenses": number,
    "totalDeductible": number,
    "potentialSavings": number (estimated tax saving at marginal rate),
    "bankName": string,
    "accountNumber": "last 4 digits only",
    "statementPeriod": "YYYY-MM",
    "occupationMatch": "${matchedProfile?.label || 'General'}",
    "missedDeductionWarnings": ["string array of deductions the user SHOULD look for but weren't found in this statement"],
    "actionItems": ["string array of things user should do to maximize deductions"]
  }
}

═══ FLAGGING RULES ═══
For each transaction, assign a flag:
- "OBVIOUS": Clearly deductible — professional body fees, RA debit orders, medical aid, business insurance, work equipment matching occupation keywords. High confidence.
- "LIKELY": Probably deductible — items that match this occupation's common deductions, partial-use items (internet, phone), recurring business-pattern payments. User should confirm.
- "REVIEW": Uncertain/suspicious — large unusual purchases, ambiguous descriptions, items that COULD be personal or business, anything you're less than 60% confident about. Flag for human review.
- "PERSONAL": Clearly personal — groceries, entertainment, streaming services, gym, personal clothing, dining out, personal insurance. Not deductible.
- null: For transfers, salary credits, and other neutral items.

Be thorough: extract EVERY transaction, no matter how many. Do not skip or summarize transactions.`;
}

// ─── Helper: Match occupation to profile ───────────────────────────────────

export function matchOccupation(occupation: string): OccupationProfile {
  const occLower = occupation.toLowerCase();
  return OCCUPATION_PROFILES.find(p =>
    p.aliases.some(a => occLower.includes(a.toLowerCase())) ||
    occLower.includes(p.id.replace('_', ' '))
  ) || OCCUPATION_PROFILES[OCCUPATION_PROFILES.length - 1]; // default to general_employed
}

// ─── Helper: Get all applicable deductions for a profile ───────────────────

export function getApplicableDeductions(profile: {
  occupation?: string;
  employmentType?: string;
  hasMedicalAid?: boolean;
  hasRetirementAnnuity?: boolean;
  worksFromHome?: boolean;
  usesVehicleForWork?: boolean;
}): string[] {
  const deductions: string[] = [];
  const matched = matchOccupation(profile.occupation || 'employed');

  deductions.push(...matched.deductions.map(d => d.description));

  if (profile.hasMedicalAid) deductions.push('Medical tax credits (Section 6A/6B)');
  if (profile.hasRetirementAnnuity) deductions.push('Retirement annuity deduction (Section 11F)');
  if (profile.worksFromHome) deductions.push('Home office deduction (Section 23(b))');
  if (profile.usesVehicleForWork) deductions.push('Vehicle/travel expense deduction (Section 8(1)(b))');

  return deductions;
}
