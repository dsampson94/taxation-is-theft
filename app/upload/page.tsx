'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Brain,
  ArrowRight,
  Trash2,
  Lock,
  Shield,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center"><div className="animate-pulse text-slate-400">Loading...</div></div>}>
      <UploadContent />
    </Suspense>
  );
}

interface UploadedFile {
  file: File;
  status: 'pending' | 'parsing' | 'parsed' | 'analyzing' | 'done' | 'error';
  text?: string;
  pages?: number;
  analysis?: any;
  error?: string;
}

const formatZAR = (amount: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Get the 12 months for a SA tax year (March of startYear → February of endYear) */
function getTaxYearMonths(yearLabel: string): { label: string; short: string }[] {
  const [startYearStr, endYearStr] = yearLabel.split('/');
  const startYear = parseInt(startYearStr);
  const endYear = parseInt(endYearStr);
  if (isNaN(startYear) || isNaN(endYear)) return [];
  const months: { label: string; short: string }[] = [];
  for (let m = 2; m <= 11; m++) { // March(2) to December(11) of startYear
    months.push({ label: `${MONTH_NAMES[m]} ${startYear}`, short: `${MONTH_SHORT[m]} ${startYear}` });
  }
  months.push({ label: `${MONTH_NAMES[0]} ${endYear}`, short: `${MONTH_SHORT[0]} ${endYear}` }); // Jan
  months.push({ label: `${MONTH_NAMES[1]} ${endYear}`, short: `${MONTH_SHORT[1]} ${endYear}` }); // Feb
  return months;
}

function UploadContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const taxYearIdParam = searchParams.get('taxYearId');

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [taxYearId, setTaxYearId] = useState<string>(taxYearIdParam || '');
  const [taxYears, setTaxYears] = useState<any[]>([]);
  const [occupation, setOccupation] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [allAnalyses, setAllAnalyses] = useState<any[]>([]);
  const [profileComplete, setProfileComplete] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [uploadedMonths, setUploadedMonths] = useState<Record<string, { fileName: string; createdAt: string }>>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchTaxYears();
      fetchProfile();
    }
  }, [user]);

  // When tax year changes, update uploaded months checklist
  useEffect(() => {
    if (taxYearId && taxYears.length > 0) {
      const ty = taxYears.find((t: any) => t.id === taxYearId);
      if (ty?.statements) {
        const map: Record<string, { fileName: string; createdAt: string }> = {};
        for (const s of ty.statements) {
          if (s.monthLabel) {
            map[s.monthLabel] = { fileName: s.fileName, createdAt: s.createdAt };
          }
        }
        setUploadedMonths(map);
      } else {
        setUploadedMonths({});
      }
    }
  }, [taxYearId, taxYears]);

  const fetchTaxYears = async () => {
    try {
      const res = await fetch('/api/tax-years');
      if (res.ok) {
        const data = await res.json();
        setTaxYears(data.taxYears);
        if (!taxYearId && data.taxYears.length > 0) {
          setTaxYearId(data.taxYears[0].id);
        }
      }
    } catch {
      toast.error('Failed to load tax years');
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setOccupation(data.user.occupation || '');
        const isComplete = data.user.taxProfileComplete || false;
        setProfileComplete(isComplete);
        if (!isComplete) {
          toast('Complete your tax profile first so AI knows what to look for', { icon: '\uD83D\uDCCB', duration: 5000 });
          router.push('/tax-profile');
        }
      }
    } catch {
      // Profile fetch failure is non-critical
    }
  };

  const clearTaxYearData = async () => {
    if (!taxYearId) return;
    setClearing(true);
    try {
      const res = await fetch(`/api/transactions?taxYearId=${taxYearId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('All data cleared for this tax year');
        setUploadedMonths({});
        setAllAnalyses([]);
        setFiles([]);
        fetchTaxYears();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to clear data');
      }
    } catch {
      toast.error('Failed to clear data');
    } finally {
      setClearing(false);
      setShowClearConfirm(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length < acceptedFiles.length) {
      toast.error('Only PDF files are accepted');
    }
    const newFiles: UploadedFile[] = pdfFiles.map(file => ({ file, status: 'pending' }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const parseFile = async (index: number): Promise<string | null> => {
    const uploadedFile = files[index];
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'parsing' } : f));

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile.file);

      const res = await fetch('/api/parse-statement', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Parse failed');
      }

      const data = await res.json();
      if (data.warning) {
        toast.error(data.warning, { duration: 6000 });
      }
      setFiles(prev =>
        prev.map((f, i) =>
          i === index ? { ...f, status: 'parsed', text: data.text, pages: data.pages } : f
        )
      );
      return data.text;
    } catch (error: any) {
      setFiles(prev =>
        prev.map((f, i) => i === index ? { ...f, status: 'error', error: error.message } : f)
      );
      return null;
    }
  };

  const analyzeAll = async () => {
    if (!taxYearId) {
      toast.error('Please select or create a tax year first');
      return;
    }

    setAnalyzing(true);
    const results: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.status === 'done') continue;
      if (f.status === 'error') continue;

      // Parse first if needed
      let text = f.text;
      if (!text) {
        const parsed = await parseFile(i);
        if (!parsed) continue;
        text = parsed;
      }

      // Analyze statement
      setFiles(prev => prev.map((file, idx) => idx === i ? { ...file, status: 'analyzing' } : file));

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, occupation, taxYearId, fileName: f.file.name, fileSize: f.file.size }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Analysis failed');
        }

        if (!data.analysis) {
          throw new Error('No analysis result received');
        }

        setFiles(prev =>
          prev.map((file, idx) =>
            idx === i ? { ...file, status: 'done', analysis: data.analysis } : file
          )
        );
        results.push(data.analysis);
      } catch (error: any) {
        setFiles(prev =>
          prev.map((file, idx) => idx === i ? { ...file, status: 'error', error: error.message } : file)
        );
      }
    }

    setAllAnalyses(results);
    setAnalyzing(false);

    if (results.length > 0) {
      toast.success(`Successfully analyzed ${results.length} statement(s)!`);
      // Refresh tax years to update month checklist
      fetchTaxYears();
    }
  };

  // Compute combined summary from all analyses
  const combinedSummary = allAnalyses.reduce(
    (acc, a) => ({
      totalIncome: acc.totalIncome + (a.summary?.totalIncome || 0),
      totalExpenses: acc.totalExpenses + (a.summary?.totalExpenses || 0),
      totalDeductible: acc.totalDeductible + (a.summary?.totalDeductible || 0),
      transactions: acc.transactions + (a.transactions?.length || 0),
    }),
    { totalIncome: 0, totalExpenses: 0, totalDeductible: 0, transactions: 0 }
  );

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="bg-gradient-to-b from-brand-800 to-brand-950 text-white py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-3 backdrop-blur-sm">
            <Upload size={16} />
            Statement Upload
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            Extract Bank Statement Info
          </h1>
          <p className="text-brand-200 text-sm">
            Upload your bank statement PDFs and let AI extract and categorize your transactions
          </p>
        </div>
      </section>

      <div className="bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">

        {/* Profile nudge */}
        <div className="card mb-6 border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/20">
          <div className="flex items-start gap-3">
            <Brain size={20} className="text-brand-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              {profileComplete ? (
                <>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Tax profile complete
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    AI deductions are tailored to your occupation and tax situation.{' '}
                    <Link href="/tax-profile" className="text-brand-600 hover:underline font-medium">Update profile</Link>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Want more accurate deductions?
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <Link href="/tax-profile" className="text-brand-600 hover:underline font-medium">Complete your tax profile</Link>
                    {' '}so the AI knows your occupation and tax situation. This is optional but significantly improves results.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tax year selector */}
        <div className="card mb-6">
          <label className="label">Tax Year</label>
          <select
            value={taxYearId}
            onChange={e => setTaxYearId(e.target.value)}
            className="input w-full"
          >
            <option value="">Select a tax year...</option>
            {taxYears.map((ty: any) => (
              <option key={ty.id} value={ty.id}>
                {ty.yearLabel}
              </option>
            ))}
          </select>
          {occupation && (
            <p className="text-xs text-slate-400 mt-2">
              AI will optimize deductions for: <span className="font-medium">{occupation}</span>
            </p>
          )}
        </div>

        {/* Month upload checklist */}
        {taxYearId && taxYears.length > 0 && (() => {
          const ty = taxYears.find((t: any) => t.id === taxYearId);
          if (!ty) return null;
          const months = getTaxYearMonths(ty.yearLabel);
          if (months.length === 0) return null;
          const uploadedCount = months.filter(m => uploadedMonths[m.label]).length;
          return (
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-brand-600" />
                  <span className="font-semibold text-sm">Upload Progress</span>
                </div>
                <span className="text-xs text-slate-500">{uploadedCount}/12 months</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {months.map(m => {
                  const uploaded = uploadedMonths[m.label];
                  return (
                    <div
                      key={m.label}
                      className={`relative rounded-lg p-2 text-center text-xs transition-colors ${
                        uploaded
                          ? 'bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800'
                          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-dashed'
                      }`}
                      title={uploaded ? `${uploaded.fileName}\nUploaded ${new Date(uploaded.createdAt).toLocaleDateString('en-ZA')}` : `${m.label} — not uploaded`}
                    >
                      {uploaded && (
                        <CheckCircle size={12} className="absolute top-1 right-1 text-brand-500" />
                      )}
                      <div className={`font-medium ${uploaded ? 'text-brand-700 dark:text-brand-300' : 'text-slate-400'}`}>
                        {m.short.split(' ')[0]}
                      </div>
                      <div className={`text-[10px] ${uploaded ? 'text-brand-500' : 'text-slate-300 dark:text-slate-600'}`}>
                        {m.short.split(' ')[1]}
                      </div>
                    </div>
                  );
                })}
              </div>
              {uploadedCount > 0 && uploadedCount < 12 && (
                <p className="text-xs text-slate-500 mt-3">
                  <RefreshCw size={12} className="inline mr-1" />
                  Re-uploading a month automatically replaces the previous data — no duplicates.
                </p>
              )}
              {uploadedCount > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Clear all data for this tax year
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={`card border-2 border-dashed cursor-pointer transition-colors text-center py-12 mb-6 ${
            isDragActive
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20'
              : 'border-slate-300 hover:border-brand-400 dark:border-slate-600'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto text-slate-400 mb-4" size={48} />
          {isDragActive ? (
            <p className="text-brand-600 font-medium">Drop your PDFs here...</p>
          ) : (
            <>
              <p className="font-medium text-slate-700 dark:text-slate-200 mb-2">
                Drag & drop bank statement PDFs here
              </p>
              <p className="text-sm text-slate-500">
                or click to browse • Max 10MB per file
              </p>
              <p className="text-xs text-brand-600 mt-2 font-medium">
                Upload cheque/salary statements first, then credit cards
              </p>
            </>
          )}
        </div>

        {/* Instructions & Privacy toggles */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {/* How to use */}
          <div className="card">
            <button
              onClick={() => setShowInstructions(v => !v)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <Info size={18} className="text-brand-600" />
                <span className="font-semibold text-sm text-slate-900 dark:text-white">How to use TIT</span>
              </div>
              {showInstructions ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {showInstructions && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 space-y-3">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white mb-1">What you need</p>
                  <ul className="list-disc ml-4 space-y-1 text-xs">
                    <li><strong>12 months</strong> of bank statement PDFs (March–February for one tax year)</li>
                    <li>Download from your bank&apos;s online banking &rarr; Statements &rarr; PDF</li>
                    <li>Include <strong>all accounts</strong>: cheque, savings, and credit cards</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white mb-1">Upload order (important!)</p>
                  <ol className="list-decimal ml-4 space-y-1 text-xs">
                    <li><strong className="text-brand-700 dark:text-brand-300">Cheque / salary account first</strong> — this captures your income</li>
                    <li><strong>Credit card statements next</strong> — these capture business expenses</li>
                    <li>Savings accounts last (if applicable)</li>
                  </ol>
                  <p className="text-xs text-slate-500 mt-1">
                    Your salary/income must be uploaded for the tax report to calculate savings correctly.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white mb-1">Step by step</p>
                  <ol className="list-decimal ml-4 space-y-1 text-xs">
                    <li>Select your tax year above</li>
                    <li>Upload cheque account statements first (one per month)</li>
                    <li>Then upload credit card statements</li>
                    <li>Click &quot;Analyze All with AI&quot; — each statement uses 1 credit</li>
                    <li>Review flagged transactions, then generate your Tax Report</li>
                  </ol>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white mb-1">Tips</p>
                  <ul className="list-disc ml-4 space-y-1 text-xs">
                    <li>Upload one month per PDF for best results</li>
                    <li>Re-uploading a month replaces the old data — no duplicates</li>
                    <li>FNB, Standard Bank, Nedbank, Absa, Capitec, Investec &amp; Discovery Bank supported</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Privacy & Security */}
          <div className="card">
            <button
              onClick={() => setShowPrivacy(v => !v)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-brand-600" />
                <span className="font-semibold text-sm text-slate-900 dark:text-white">Privacy &amp; security</span>
              </div>
              {showPrivacy ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {showPrivacy && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <div className="flex items-start gap-2">
                  <Lock size={14} className="text-brand-600 mt-0.5 shrink-0" />
                  <span>Bank statements are <strong>processed in memory only</strong> and never stored on our servers. The PDF is read, transactions are extracted, then the file is discarded.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lock size={14} className="text-brand-600 mt-0.5 shrink-0" />
                  <span>Extracted transaction data (descriptions, amounts, dates) is <strong>encrypted at rest with AES-256-GCM</strong> in our database.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lock size={14} className="text-brand-600 mt-0.5 shrink-0" />
                  <span>Your <strong>ID number and SARS tax reference</strong> are encrypted — even our team cannot read them in the database.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lock size={14} className="text-brand-600 mt-0.5 shrink-0" />
                  <span>All connections use <strong>HTTPS/TLS</strong> encryption in transit.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lock size={14} className="text-brand-600 mt-0.5 shrink-0" />
                  <span>Compliant with South Africa&apos;s <strong>POPIA</strong> (Protection of Personal Information Act).</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lock size={14} className="text-brand-600 mt-0.5 shrink-0" />
                  <span>We <strong>never sell or share</strong> your data with third parties. Your information is used solely for tax analysis.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{files.length} file(s) selected</h3>
              <button
                onClick={analyzeAll}
                disabled={analyzing || !taxYearId}
                className="btn-primary py-2 px-4 text-sm"
              >
                {analyzing ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain size={16} className="mr-2" />
                    Analyze All with AI
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <FileText size={20} className="text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.file.name}</p>
                    <p className="text-xs text-slate-500">
                      {(f.file.size / 1024).toFixed(0)} KB
                      {f.pages ? ` • ${f.pages} pages` : ''}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {f.status === 'pending' && (
                      <span className="text-xs text-slate-400">Ready</span>
                    )}
                    {f.status === 'parsing' && (
                      <Loader2 size={16} className="text-blue-500 animate-spin" />
                    )}
                    {f.status === 'parsed' && (
                      <span className="text-xs text-blue-500">Parsed</span>
                    )}
                    {f.status === 'analyzing' && (
                      <div className="flex items-center gap-1">
                        <Loader2 size={16} className="text-brand-500 animate-spin" />
                        <span className="text-xs text-brand-500">{(f as any).statusMessage || 'AI analyzing...'}</span>
                      </div>
                    )}
                    {f.status === 'done' && (
                      <CheckCircle size={16} className="text-brand-500" />
                    )}
                    {f.status === 'error' && (
                      <div className="flex items-center gap-1">
                        <AlertCircle size={16} className="text-red-500" />
                        <span className="text-xs text-red-500 max-w-[150px] truncate">
                          {f.error}
                        </span>
                      </div>
                    )}
                  </div>
                  {f.status !== 'analyzing' && f.status !== 'parsing' && (
                    <button
                      onClick={() => removeFile(i)}
                      className="text-slate-400 hover:text-red-500 shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results summary */}
        {allAnalyses.length > 0 && (
          <div className="card border-brand-200 bg-brand-50 dark:bg-brand-950/20">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CheckCircle className="text-brand-600" size={20} />
              Analysis Complete
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6">
              <div>
                <div className="text-sm text-slate-500">Transactions</div>
                <div className="text-lg sm:text-xl font-bold">{combinedSummary.transactions}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Total Income</div>
                <div className="text-lg sm:text-xl font-bold">{formatZAR(combinedSummary.totalIncome)}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Total Expenses</div>
                <div className="text-lg sm:text-xl font-bold">{formatZAR(combinedSummary.totalExpenses)}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Deductible</div>
                <div className="text-lg sm:text-xl font-bold text-brand-600">
                  {formatZAR(combinedSummary.totalDeductible)}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/report?taxYearId=${taxYearId}`}
                className="btn-primary py-2 px-4 text-sm"
              >
                <ArrowRight size={16} className="mr-2" />
                View Tax Report
              </Link>
              <Link
                href={`/transactions?taxYearId=${taxYearId}`}
                className="btn-secondary py-2 px-4 text-sm"
              >
                Review Transactions
              </Link>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Clear data confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Clear Tax Year Data</h3>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete <strong>all transactions, deductions, and upload records</strong> for this tax year?
              You will need to re-upload and re-analyze your statements.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={clearTaxYearData}
                disabled={clearing}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {clearing ? 'Clearing...' : 'Yes, clear all data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
