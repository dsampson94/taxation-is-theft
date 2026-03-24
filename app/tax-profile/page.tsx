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
        }));
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
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
        router.push('/dashboard');
      } else {
        toast.error('Failed to save profile');
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
      <section className="bg-gradient-to-b from-emerald-800 to-emerald-900 text-white py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-4 backdrop-blur-sm">
            <Sparkles size={16} />
            Personalized Tax Analysis
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Set Up Your Tax Profile</h1>
          <p className="text-emerald-100 text-sm">
            Answer these questions so our AI knows exactly which deductions to find for you.
            This is what makes us better than generic AI.
          </p>
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
                    i === step ? 'text-emerald-600' : i < step ? 'text-accent-500' : 'text-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === step ? 'bg-emerald-100 text-emerald-700' : i < step ? 'bg-accent-100 text-accent-700' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {i < step ? <Check size={14} /> : <Icon size={14} />}
                  </div>
                  <span className="text-[10px] font-medium hidden sm:block">{s.label}</span>
                </button>
              );
            })}
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
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
              <p className="text-sm text-slate-500 mb-6">
                Your occupation determines which specific deductions SARS allows. We have specialized knowledge for each profession.
              </p>

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
                  <p className="mt-2 text-sm text-emerald-600">
                    Matched profile: <strong>{matchedOccupation.label}</strong>
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="label">Employment Type</label>
                <div className="grid grid-cols-2 gap-3">
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
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{opt.label}</div>
                      <div className="text-xs text-slate-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">SARS Tax Number (optional)</label>
                  <input
                    type="text"
                    value={profile.taxNumber}
                    onChange={e => update('taxNumber', e.target.value)}
                    className="input"
                    placeholder="e.g. 0123456789"
                  />
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
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Medical Aid */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold mb-1">Medical Aid</h2>
              <p className="text-sm text-slate-500 mb-6">
                Medical tax credits can save you <strong>R4,000-R12,000+</strong> per year. Most people don&apos;t claim these correctly.
              </p>

              <div className="mb-6">
                <label className="label mb-3">Do you belong to a medical aid?</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => update('hasMedicalAid', true)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      profile.hasMedicalAid ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => update('hasMedicalAid', false)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      !profile.hasMedicalAid ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'
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
                    <p className="text-xs text-slate-500 mb-3">Expenses NOT covered by medical aid (gap payments, specialists, dental, optical)</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => update('hasOutOfPocketMedical', true)}
                        className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                          profile.hasOutOfPocketMedical ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => update('hasOutOfPocketMedical', false)}
                        className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                          !profile.hasOutOfPocketMedical ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Preview credit calculation */}
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                    <div className="text-sm font-medium text-emerald-700 mb-1">Estimated Annual Medical Tax Credit</div>
                    <div className="text-2xl font-bold text-emerald-600">
                      R{(
                        (profile.medicalAidMembers <= 2
                          ? 364 * profile.medicalAidMembers
                          : 364 * 2 + (profile.medicalAidMembers - 2) * 246
                        ) * 12
                      ).toLocaleString()}
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">
                      R364/month for main member{profile.medicalAidMembers >= 2 ? ' + first dependent' : ''}{profile.medicalAidMembers > 2 ? ` + R246/month × ${profile.medicalAidMembers - 2} additional` : ''}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Retirement */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold mb-1">Retirement Annuity (RA)</h2>
              <p className="text-sm text-slate-500 mb-6">
                RA contributions are deductible up to <strong>27.5% of your income</strong> (max R350,000/year). This is one of the most powerful legal tax-saving tools.
              </p>

              <div className="mb-6">
                <label className="label mb-3">Do you contribute to a Retirement Annuity?</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => update('hasRetirementAnnuity', true)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      profile.hasRetirementAnnuity ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => update('hasRetirementAnnuity', false)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      !profile.hasRetirementAnnuity ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'
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
                  <p className="text-xs text-slate-400 mt-1">Total annual amount, including employer RA contributions if applicable</p>
                </div>
              )}

              {!profile.hasRetirementAnnuity && (
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <div className="text-sm font-medium text-amber-700 mb-1">Did you know?</div>
                  <p className="text-sm text-amber-600">
                    If you earn R500,000/year, contributing R137,500 to an RA would save you approximately <strong>R50,875 in tax</strong> (at 37% marginal rate). 
                    Providers like Allan Gray, 10X, Sanlam, and Old Mutual offer easy RA accounts.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Home Office */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold mb-1">Home Office</h2>
              <p className="text-sm text-slate-500 mb-6">
                If you have a dedicated room used exclusively for work, you can deduct a proportion of home expenses.
              </p>

              <div className="mb-6">
                <label className="label mb-3">Do you work from home (fully or partially)?</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => update('worksFromHome', true)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      profile.worksFromHome ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => update('worksFromHome', false)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      !profile.worksFromHome ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'
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
                      <div className="text-sm font-medium text-amber-700 mb-1">Important for employees</div>
                      <p className="text-sm text-amber-600">
                        SARS requires that your employer specifically requires you to work from home AND the room must be used <strong>exclusively</strong> for work. 
                        If your employer provides an office but you choose to WFH, this deduction may not apply.
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
              <h2 className="text-lg font-bold mb-1">Vehicle & Travel</h2>
              <p className="text-sm text-slate-500 mb-6">
                If you use your personal vehicle for work travel (not commuting), you can claim fuel, maintenance, and other vehicle costs.
              </p>

              <div className="mb-6">
                <label className="label mb-3">Do you use your personal vehicle for work travel?</label>
                <p className="text-xs text-slate-500 mb-3">Work travel = visiting clients, travelling between sites, etc. NOT commuting to/from office.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => update('usesVehicleForWork', true)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      profile.usesVehicleForWork ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => update('usesVehicleForWork', false)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      !profile.usesVehicleForWork ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'
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
                    </div>
                    <div>
                      <label className="label mb-3">Receive a travel allowance?</label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => update('receivesTravelAllowance', true)}
                          className={`flex-1 p-2 rounded-lg border text-center text-sm font-medium transition-colors ${
                            profile.receivesTravelAllowance ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => update('receivesTravelAllowance', false)}
                          className={`flex-1 p-2 rounded-lg border text-center text-sm font-medium transition-colors ${
                            !profile.receivesTravelAllowance ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                    <div className="text-sm font-medium text-amber-700 mb-1">Logbook Required</div>
                    <p className="text-sm text-amber-600">
                      SARS requires a detailed logbook to claim vehicle expenses. Without one, your entire claim can be denied.
                      Record: date, destination, purpose, and km for each business trip.
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
              <p className="text-sm text-slate-500 mb-6">
                Additional items that can reduce your tax bill.
              </p>

              <div className="mb-6">
                <label className="label mb-3">Do you donate to registered charities / PBOs?</label>
                <p className="text-xs text-slate-500 mb-3">Donations with a Section 18A certificate are deductible up to 10% of taxable income.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => update('makesDonations', true)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      profile.makesDonations ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => update('makesDonations', false)}
                    className={`flex-1 p-3 rounded-lg border text-center font-medium transition-colors ${
                      !profile.makesDonations ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Entity Type</label>
                <div className="grid grid-cols-2 gap-3">
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
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
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
                    <div className="text-xs text-emerald-600">{matchedOccupation.label}</div>
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
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800 mb-4">
                <div className="text-sm font-medium text-emerald-700 mb-2">
                  <Sparkles size={16} className="inline mr-1" />
                  Deductions We&apos;ll Look For ({applicableDeductions.length} categories)
                </div>
                <ul className="text-sm text-emerald-600 space-y-1">
                  {applicableDeductions.slice(0, 10).map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 shrink-0" />
                      {d}
                    </li>
                  ))}
                  {applicableDeductions.length > 10 && (
                    <li className="text-emerald-500">+ {applicableDeductions.length - 10} more categories</li>
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
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                Next <ArrowRight size={16} className="ml-1" />
              </button>
            ) : (
              <button
                onClick={saveProfile}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
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
