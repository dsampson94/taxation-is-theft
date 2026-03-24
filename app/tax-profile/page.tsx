'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Briefcase,
  Heart,
  PiggyBank,
  Home,
  Car,
  Gift,
  User,
  Shield,
  Sparkles,
} from 'lucide-react';
import { OCCUPATION_PROFILES, TAX_PROFILE_QUESTIONS, matchOccupation, getApplicableDeductions } from '@/app/lib/sa-tax-knowledge';

interface ProfileData {
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
  receivesTravelAllowance: boolean;
  makesDonations: boolean;
  hasOutOfPocketMedical: boolean;
  age: number;
  taxNumber: string;
  entityType: string;
  taxNotes: string;
}

const STEPS = [
  { id: 'occupation', label: 'Your Work', icon: Briefcase, description: 'What do you do?' },
  { id: 'medical', label: 'Medical Aid', icon: Heart, description: 'Medical scheme details' },
  { id: 'retirement', label: 'Retirement', icon: PiggyBank, description: 'RA contributions' },
  { id: 'home_office', label: 'Home Office', icon: Home, description: 'Work from home?' },
  { id: 'vehicle', label: 'Vehicle', icon: Car, description: 'Business travel' },
  { id: 'other', label: 'Other', icon: Gift, description: 'Donations & more' },
  { id: 'review', label: 'Review', icon: Check, description: 'Confirm & save' },
];

export default function TaxProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    occupation: '',
    employmentType: 'employed',
    hasMedicalAid: false,
    medicalAidMembers: 1,
    monthlyMedicalAidFee: 0,
    hasRetirementAnnuity: false,
    annualRAContribution: 0,
    worksFromHome: false,
    homeOfficePct: 0,
    usesVehicleForWork: false,
    annualBusinessKm: 0,
    receivesTravelAllowance: false,
    makesDonations: false,
    hasOutOfPocketMedical: false,
    age: 30,
    taxNumber: '',
    entityType: 'INDIVIDUAL',
    taxNotes: '',
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        setProfile(prev => ({
          ...prev,
          occupation: u.occupation || '',
          employmentType: u.employmentType || 'employed',
          hasMedicalAid: u.hasMedicalAid || false,
          medicalAidMembers: u.medicalAidMembers || 1,
          monthlyMedicalAidFee: u.monthlyMedicalAidFee ? Number(u.monthlyMedicalAidFee) : 0,
          hasRetirementAnnuity: u.hasRetirementAnnuity || false,
          annualRAContribution: u.annualRAContribution ? Number(u.annualRAContribution) : 0,
          worksFromHome: u.worksFromHome || false,
          homeOfficePct: u.homeOfficePct || 0,
          usesVehicleForWork: u.usesVehicleForWork || false,
          annualBusinessKm: u.annualBusinessKm || 0,
          receivesTravelAllowance: u.receivesTravelAllowance || false,
          makesDonations: u.makesDonations || false,
          hasOutOfPocketMedical: u.hasOutOfPocketMedical || false,
          taxNumber: u.taxNumber || '',
          entityType: u.entityType || 'INDIVIDUAL',
          taxNotes: u.taxNotes || '',
        }));
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile.occupation.trim()) {
      toast.error('Please enter your occupation');
      setStep(0);
      return;
    }
    if (!profile.age || profile.age < 18) {
      toast.error('Please enter a valid age (18+)');
      setStep(0);
      return;
    }
    if (!profile.employmentType) {
      toast.error('Please select your employment type');
      setStep(0);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          taxProfileComplete: true,
        }),
      });
      if (res.ok) {
        await refreshUser();
        toast.success('Tax profile saved! Your AI analysis will now be personalized.');
        router.push('/upload');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save profile');
      }
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const update = (field: keyof ProfileData, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const matchedOccupation = matchOccupation(profile.occupation);
  const applicableDeductions = getApplicableDeductions(profile);

  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <section className="bg-gradient-to-b from-brand-800 to-brand-950 text-white py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-3 backdrop-blur-sm">
            <Sparkles size={16} />
            Personalized Tax Analysis
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Set Up Your Tax Profile</h1>
          <p className="text-brand-200 text-sm">Answer these questions so our AI knows exactly which deductions to find for you</p>
        </div>
      </section>

      {/* Progress bar */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="card p-3">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setStep(i)}
                  className={`flex flex-col items-center gap-1 transition-colors ${
                    i === step ? 'text-brand-600' : i < step ? 'text-brand-500' : 'text-slate-300 dark:text-slate-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === step ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300' : i < step ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                  }`}>
                    {i < step ? <Check size={14} /> : <Icon size={14} />}
                  </div>
                  <span className="text-[10px] font-medium hidden sm:block">{s.label}</span>
                </button>
              );
            })}
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="card">
          {/* Step 0: Occupation */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-bold mb-1">What do you do for a living?</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Your occupation determines which specific deductions SARS allows. We have specialized knowledge for each profession.
              </p>

              <div className="bg-brand-50 dark:bg-brand-950/20 rounded-lg p-3 border border-brand-200 dark:border-brand-800 mb-6">
                <p className="text-xs text-brand-700 dark:text-brand-300">
                  <strong>Why this matters:</strong> A software engineer can claim equipment and home office expenses. A doctor can claim CPD, medical equipment, and practice costs. An estate agent can claim vehicle, marketing, and client entertainment. We tailor everything to YOUR profession.
                </p>
              </div>

              <div className="mb-4">
                <label className="label">Occupation / Job Title</label>
                <input
                  type="text"
                  value={profile.occupation}
                  onChange={e => update('occupation', e.target.value)}
                  className="input"
                  placeholder="e.g. Software Engineer, Doctor, Estate Agent, Teacher"
                />
                {profile.occupation && (
                  <p className="mt-2 text-sm text-brand-600 dark:text-brand-400">
                    Matched profile: <strong>{matchedOccupation.label}</strong>
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="label">Employment Type</label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">This determines your tax obligations and which deductions you qualify for.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { value: 'employed', label: 'Employed (salaried)', desc: 'Receive IRP5 from employer' },
                    { value: 'self_employed', label: 'Self-employed', desc: 'Freelancer / own business' },
                    { value: 'commission', label: 'Commission earner', desc: 'Sales / estate agent' },
                    { value: 'both', label: 'Both', desc: 'Employed + side income' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => update('employmentType', opt.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        profile.employmentType === opt.value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 dark:border-brand-400'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="font-medium text-sm">{opt.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {(profile.employmentType === 'self_employed' || profile.employmentType === 'commission' || profile.employmentType === 'both') && (
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800 mb-4">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Good to know:</strong> Self-employed and commission earners can typically claim MORE deductions than salaried employees — including a portion of home expenses, internet, phone, equipment, and all costs incurred to produce income (Section 11(a)).
                  </p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="label">SARS Tax Number (optional)</label>
                  <input
                    type="text"
                    value={profile.taxNumber}
                    onChange={e => update('taxNumber', e.target.value)}
                    className="input"
                    placeholder="e.g. 0123456789"
                  />
                  <p className="text-xs text-slate-400 mt-1">Found on your IRP5 or SARS correspondence</p>
                </div>
                <div>
                  <label className="label">Your Age</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={e => update('age', parseInt(e.target.value) || 0)}
                    className="input"
                    min={18}
                    max={100}
                  />
                  <p className="text-xs text-slate-400 mt-1">Age affects your tax rebate — over 65s get an additional R9,444 rebate</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Medical Aid */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold mb-1">Medical Aid</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Medical tax credits can save you <strong>R4,000–R12,000+</strong> per year. Most South Africans either don&apos;t claim these or claim them incorrectly.
              </p>

              <div className="bg-brand-50 dark:bg-brand-950/20 rounded-lg p-3 border border-brand-200 dark:border-brand-800 mb-6">
                <p className="text-xs text-brand-700 dark:text-brand-300">
                  <strong>How it works:</strong> SARS gives you a fixed monthly tax credit per medical aid member — R364 for the first two members, R246 for each additional member. This is subtracted directly from your tax owed, not just your taxable income, making it very valuable.
                </p>
              </div>

              <div className="mb-6">
                <label className="label mb-3">Do you belong to a medical aid?</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => update('hasMedicalAid', true)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      profile.hasMedicalAid ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-400' : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => update('hasMedicalAid', false)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      !profile.hasMedicalAid ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-400' : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {profile.hasMedicalAid && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="label">Members on medical aid</label>
                      <input
                        type="number"
                        value={profile.medicalAidMembers}
                        onChange={e => update('medicalAidMembers', parseInt(e.target.value) || 1)}
                        className="input"
                        min={1}
                        max={20}
                        placeholder="Include yourself + dependents"
                      />
                      <p className="text-xs text-slate-400 mt-1">Include yourself, spouse, and children</p>
                    </div>
                    <div>
                      <label className="label">Monthly contribution (R)</label>
                      <input
                        type="number"
                        value={profile.monthlyMedicalAidFee || ''}
                        onChange={e => update('monthlyMedicalAidFee', parseFloat(e.target.value) || 0)}
                        className="input"
                        placeholder="e.g. 3500"
                      />
                      <p className="text-xs text-slate-400 mt-1">What YOU pay (not employer portion)</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="label mb-3">Do you have significant out-of-pocket medical expenses?</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Expenses NOT covered by medical aid — gap payments, specialists, dental, optical, physio, psychology</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => update('hasOutOfPocketMedical', true)}
                        className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                          profile.hasOutOfPocketMedical ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-400' : 'border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => update('hasOutOfPocketMedical', false)}
                        className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                          !profile.hasOutOfPocketMedical ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-400' : 'border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Preview credit calculation */}
                  <div className="bg-brand-50 dark:bg-brand-950/20 rounded-lg p-4 border border-brand-200 dark:border-brand-800 mb-4">
                    <div className="text-sm font-medium text-brand-700 dark:text-brand-300 mb-1">Estimated Annual Medical Tax Credit</div>
                    <div className="text-2xl font-bold text-brand-600">
                      R{(
                        (profile.medicalAidMembers <= 2
                          ? 364 * profile.medicalAidMembers
                          : 364 * 2 + (profile.medicalAidMembers - 2) * 246
                        ) * 12
                      ).toLocaleString()}
                    </div>
                    <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">
                      R364/month for main member{profile.medicalAidMembers >= 2 ? ' + first dependent' : ''}{profile.medicalAidMembers > 2 ? ` + R246/month × ${profile.medicalAidMembers - 2} additional` : ''}
                    </p>
                  </div>

                  {profile.hasOutOfPocketMedical && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        <strong>Keep those receipts:</strong> If your out-of-pocket medical expenses exceed 7.5% of your taxable income (for under-65s), the excess qualifies for an additional medical tax credit. This includes dental work, glasses, specialist visits, chronic medication co-payments, and even over-the-counter medicines prescribed by a doctor.
                      </p>
                    </div>
                  )}
                </>
              )}

              {!profile.hasMedicalAid && (
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Even without medical aid</strong> — if you have out-of-pocket medical expenses that exceed 7.5% of your taxable income, you may still qualify for additional medical tax credits. Keep records of any medical spending.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Retirement */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold mb-1">Retirement Annuity (RA)</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                RA contributions are deductible up to <strong>27.5% of your income</strong> (max R350,000/year). This is the single most powerful legal tax-saving tool in South Africa.
              </p>

              <div className="bg-brand-50 dark:bg-brand-950/20 rounded-lg p-3 border border-brand-200 dark:border-brand-800 mb-6">
                <p className="text-xs text-brand-700 dark:text-brand-300">
                  <strong>Why it&apos;s so effective:</strong> Every rand you put into an RA reduces your taxable income directly. If you&apos;re in the 36% tax bracket, a R10,000 RA contribution saves you R3,600 in tax — AND that money grows tax-free until retirement. It&apos;s a double benefit.
                </p>
              </div>

              <div className="mb-6">
                <label className="label mb-3">Do you contribute to a Retirement Annuity?</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => update('hasRetirementAnnuity', true)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      profile.hasRetirementAnnuity ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-400' : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => update('hasRetirementAnnuity', false)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      !profile.hasRetirementAnnuity ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-400' : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {profile.hasRetirementAnnuity && (
                <div className="mb-4">
                  <label className="label">Annual RA contribution (R)</label>
                  <input
                    type="number"
                    value={profile.annualRAContribution || ''}
                    onChange={e => update('annualRAContribution', parseFloat(e.target.value) || 0)}
                    className="input"
                    placeholder="e.g. 36000 (R3,000/month × 12)"
                  />
                  <p className="text-xs text-slate-400 mt-1">Total annual amount you contribute. This combines with any employer pension/provident fund contributions towards the 27.5% limit.</p>
                </div>
              )}

              {!profile.hasRetirementAnnuity && (
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <div className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Something to consider</div>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    If you earn R500,000/year, contributing R137,500 to an RA could save you approximately <strong>R50,875 in tax</strong> (at the 37% marginal rate).
                    Providers like Allan Gray, 10X, Sanlam, and Old Mutual offer easy RA accounts you can set up online. Even R1,000/month makes a meaningful difference.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Home Office */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold mb-1">Home Office</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                If you have a dedicated room used regularly and exclusively for work, you can deduct a proportion of your home expenses.
              </p>

              <div className="bg-brand-50 dark:bg-brand-950/20 rounded-lg p-3 border border-brand-200 dark:border-brand-800 mb-6">
                <p className="text-xs text-brand-700 dark:text-brand-300">
                  <strong>What you can claim:</strong> Rent or bond interest, property rates, electricity, cleaning, internet, home insurance, security, and repairs — all proportional to the percentage of your home used as an office. For example, if your office is 15% of your home, you can claim 15% of these expenses.
                </p>
              </div>

              <div className="mb-6">
                <label className="label mb-3">Do you work from home (fully or partially)?</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => update('worksFromHome', true)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      profile.worksFromHome ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-400' : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => update('worksFromHome', false)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      !profile.worksFromHome ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-400' : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {profile.worksFromHome && (
                <>
                  <div className="mb-4">
                    <label className="label">What % of your home is your office?</label>
                    <input
                      type="number"
                      value={profile.homeOfficePct || ''}
                      onChange={e => update('homeOfficePct', parseFloat(e.target.value) || 0)}
                      className="input"
                      placeholder="e.g. 15 (for 15%)"
                      min={1}
                      max={50}
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Measure your office room area ÷ total home area. E.g., 15m² office in 120m² home = 12.5%
                    </p>
                  </div>

                  {profile.employmentType === 'employed' && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                      <div className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Important for salaried employees</div>
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        SARS requires that your employer specifically requires you to work from home AND the room must be used <strong>exclusively</strong> for work.
                        If your employer provides an office but you choose to WFH, this deduction may not apply. Self-employed individuals have more flexibility here.
                      </p>
                    </div>
                  )}

                  {(profile.employmentType === 'self_employed' || profile.employmentType === 'commission') && (
                    <div className="bg-brand-50 dark:bg-brand-950/20 rounded-lg p-3 border border-brand-200 dark:border-brand-800">
                      <p className="text-xs text-brand-700 dark:text-brand-300">
                        <strong>Self-employed advantage:</strong> As a self-employed individual, SARS is more lenient about home office claims. You just need a dedicated space used regularly and exclusively for work. No employer instruction required.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 4: Vehicle */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-bold mb-1">Vehicle &amp; Travel</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                If you use your personal vehicle for work travel (not commuting to/from the office), you can claim fuel, maintenance, insurance, and other vehicle costs.
              </p>

              <div className="bg-brand-50 dark:bg-brand-950/20 rounded-lg p-3 border border-brand-200 dark:border-brand-800 mb-6">
                <p className="text-xs text-brand-700 dark:text-brand-300">
                  <strong>What counts as work travel:</strong> Visiting clients, travelling between work sites, attending conferences, meetings at other offices, site inspections. Commuting between home and your regular workplace does NOT count.
                </p>
              </div>

              <div className="mb-6">
                <label className="label mb-3">Do you use your personal vehicle for work travel?</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => update('usesVehicleForWork', true)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      profile.usesVehicleForWork ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-400' : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => update('usesVehicleForWork', false)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      !profile.usesVehicleForWork ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-400' : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {profile.usesVehicleForWork && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="label">Estimated annual business km</label>
                      <input
                        type="number"
                        value={profile.annualBusinessKm || ''}
                        onChange={e => update('annualBusinessKm', parseInt(e.target.value) || 0)}
                        className="input"
                        placeholder="e.g. 15000"
                      />
                      <p className="text-xs text-slate-400 mt-1">Estimate from your logbook or GPS records</p>
                    </div>
                    <div>
                      <label className="label mb-3">Receive a travel allowance?</label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => update('receivesTravelAllowance', true)}
                          className={`flex-1 p-2 rounded-lg border text-center text-sm font-medium transition-colors ${
                            profile.receivesTravelAllowance ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-400' : 'border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => update('receivesTravelAllowance', false)}
                          className={`flex-1 p-2 rounded-lg border text-center text-sm font-medium transition-colors ${
                            !profile.receivesTravelAllowance ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-400' : 'border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800 mb-3">
                    <div className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Logbook is essential</div>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      SARS requires a detailed logbook to claim vehicle expenses. Without one, your entire claim can be denied.
                      Record: date, destination, purpose, and km for each business trip. Phone apps like <em>TripLog</em> make this easy.
                    </p>
                  </div>

                  <div className="bg-brand-50 dark:bg-brand-950/20 rounded-lg p-3 border border-brand-200 dark:border-brand-800">
                    <p className="text-xs text-brand-700 dark:text-brand-300">
                      <strong>Don&apos;t forget:</strong> Uber/Bolt rides for business meetings, parking at client sites, and toll fees are also deductible business travel expenses. Keep those receipts and e-receipts.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 5: Other */}
          {step === 5 && (
            <div>
              <h2 className="text-lg font-bold mb-1">Other Deductions</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                There are several additional deductions that many taxpayers miss — these can add up to significant savings.
              </p>

              <div className="mb-6">
                <label className="label mb-3">Do you donate to registered charities / PBOs?</label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Donations with a Section 18A certificate are deductible up to 10% of taxable income. This includes registered charities, churches with PBO status, and qualifying non-profits.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => update('makesDonations', true)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      profile.makesDonations ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-400' : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => update('makesDonations', false)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      !profile.makesDonations ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-400' : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {profile.makesDonations && (
                <div className="bg-brand-50 dark:bg-brand-950/20 rounded-lg p-3 border border-brand-200 dark:border-brand-800 mb-6">
                  <p className="text-xs text-brand-700 dark:text-brand-300">
                    <strong>Remember:</strong> Always request a Section 18A certificate from the organisation. Without it, SARS will not accept the deduction. Most registered charities will issue one automatically — just ask.
                  </p>
                </div>
              )}

              <div className="bg-brand-50 dark:bg-brand-950/20 rounded-lg p-4 border border-brand-200 dark:border-brand-800 mb-6">
                <div className="text-sm font-medium text-brand-700 dark:text-brand-300 mb-2">Other commonly missed deductions</div>
                <ul className="text-xs text-brand-600 dark:text-brand-400 space-y-1.5">
                  <li>• <strong>Professional body fees</strong> — SAICA, SACAP, HPCSA, Law Society, Engineering Council, etc. (Section 11(a))</li>
                  <li>• <strong>Trade union fees</strong> — fully deductible under Section 11(a)</li>
                  <li>• <strong>Work-related subscriptions</strong> — industry journals, professional software licenses, LinkedIn Premium for job-related use</li>
                  <li>• <strong>Study &amp; training</strong> — courses directly related to your current occupation (not career changes)</li>
                  <li>• <strong>Protective clothing &amp; uniforms</strong> — required workwear, safety gear, branded uniforms</li>
                  <li>• <strong>Bad debts</strong> — for self-employed: invoices that clients never paid</li>
                </ul>
              </div>

              <div>
                <label className="label">Entity Type</label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">This affects your tax rate brackets and filing obligations.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { value: 'INDIVIDUAL', label: 'Individual' },
                    { value: 'COMPANY', label: 'Company (Pty Ltd)' },
                    { value: 'SBC', label: 'Small Business Corp' },
                    { value: 'TRUST', label: 'Trust' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => update('entityType', opt.value)}
                      className={`p-3 rounded-lg border text-center text-sm font-medium transition-colors ${
                        profile.entityType === opt.value
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-400'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-500'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional context for AI */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <label className="label">Additional Context for AI (optional)</label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Share anything that helps the AI identify your deductions more accurately. This info is sent with every analysis.
                </p>
                <textarea
                  value={profile.taxNotes}
                  onChange={e => update('taxNotes', e.target.value)}
                  className="input w-full h-32 resize-y"
                  maxLength={2000}
                  placeholder={"Examples:\n• I run my DJ business from home and buy equipment monthly\n• I have a separate business bank account at FNB\n• I pay R2,000/month for a co-working space\n• My Spotify subscription is for work — I'm a music producer\n• I know my gym expense qualifies — I'm a personal trainer"}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-slate-400">
                    Tell us what definitely qualifies, what doesn&apos;t, and anything that helps identify deductions
                  </p>
                  <span className="text-xs text-slate-400">{profile.taxNotes.length}/2000</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div>
              <h2 className="text-lg font-bold mb-1">Review Your Tax Profile</h2>
              <p className="text-sm text-slate-500 mb-6">
                Here&apos;s what our AI will look for based on your profile. You can always update this later.
              </p>

              <div className="space-y-4 mb-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500">Occupation</div>
                    <div className="font-medium">{profile.occupation || 'Not set'}</div>
                    <div className="text-xs text-brand-600 dark:text-brand-400">{matchedOccupation.label}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500">Employment</div>
                    <div className="font-medium capitalize">{profile.employmentType.replace('_', '-')}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500">Medical Aid</div>
                    <div className="font-medium">{profile.hasMedicalAid ? `Yes (${profile.medicalAidMembers} members)` : 'No'}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500">Retirement Annuity</div>
                    <div className="font-medium">{profile.hasRetirementAnnuity ? `R${profile.annualRAContribution.toLocaleString()}/year` : 'No'}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500">Home Office</div>
                    <div className="font-medium">{profile.worksFromHome ? `Yes (${profile.homeOfficePct}%)` : 'No'}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500">Vehicle for Work</div>
                    <div className="font-medium">{profile.usesVehicleForWork ? `Yes (${profile.annualBusinessKm.toLocaleString()} km)` : 'No'}</div>
                  </div>
                </div>

                {profile.taxNotes && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Your Additional Context</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{profile.taxNotes}</div>
                  </div>
                )}
              </div>

              <div className="bg-brand-50 dark:bg-brand-950/20 rounded-lg p-4 border border-brand-200 dark:border-brand-800 mb-4">
                <div className="text-sm font-medium text-brand-700 dark:text-brand-300 mb-2">
                  <Sparkles size={16} className="inline mr-1" />
                  Deductions We&apos;ll Look For ({applicableDeductions.length} categories)
                </div>
                <ul className="text-sm text-brand-600 dark:text-brand-400 space-y-1">
                  {applicableDeductions.slice(0, 10).map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 shrink-0" />
                      {d}
                    </li>
                  ))}
                  {applicableDeductions.length > 10 && (
                    <li className="text-brand-500">+ {applicableDeductions.length - 10} more categories</li>
                  )}
                </ul>
              </div>

              {matchedOccupation.tips.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="text-sm font-medium text-blue-700 mb-2">Tips for {matchedOccupation.label}</div>
                  <ul className="text-sm text-blue-600 space-y-1">
                    {matchedOccupation.tips.map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="btn-secondary py-2 px-4 text-sm disabled:opacity-30"
            >
              <ArrowLeft size={16} className="mr-1" /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Next <ArrowRight size={16} className="ml-1" />
              </button>
            ) : (
              <button
                onClick={saveProfile}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : (
                  <>
                    <Shield size={16} className="mr-1" />
                    Save & Start Analyzing
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
