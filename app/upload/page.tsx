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

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchTaxYears();
      fetchProfile();
    }
  }, [user]);

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
      }
    } catch {
      // Profile fetch failure is non-critical
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

      // Analyze
      setFiles(prev => prev.map((file, idx) => idx === i ? { ...file, status: 'analyzing' } : file));

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, occupation, taxYearId }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Analysis failed');
        }

        const data = await res.json();
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
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Upload Bank Statements
          </h1>
          <p className="text-slate-500 mt-1">
            Upload your bank statement PDFs and let AI find your deductions
          </p>
        </div>

        {/* Tax year selector */}
        <div className="card mb-6">
          <label className="label">Tax Year</label>
          <div className="flex gap-3">
            <select
              value={taxYearId}
              onChange={e => setTaxYearId(e.target.value)}
              className="input flex-1"
            >
              <option value="">Select a tax year...</option>
              {taxYears.map((ty: any) => (
                <option key={ty.id} value={ty.id}>
                  {ty.yearLabel}
                </option>
              ))}
            </select>
            <button
              onClick={async () => {
                const res = await fetch('/api/tax-years', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({}),
                });
                if (res.ok) {
                  const data = await res.json();
                  setTaxYearId(data.taxYear.id);
                  fetchTaxYears();
                  toast.success(`Created ${data.taxYear.yearLabel}`);
                }
              }}
              className="btn-secondary py-2 px-3 text-sm whitespace-nowrap"
            >
              + New Year
            </button>
          </div>
          {occupation && (
            <p className="text-xs text-slate-400 mt-2">
              AI will optimize deductions for: <span className="font-medium">{occupation}</span>
            </p>
          )}
        </div>

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
                or click to browse • Supports FNB, Standard Bank, Nedbank, Absa, Capitec & more • Max 10MB per file
              </p>
            </>
          )}
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
                        <span className="text-xs text-brand-500">AI analyzing...</span>
                      </div>
                    )}
                    {f.status === 'done' && (
                      <CheckCircle size={16} className="text-accent-500" />
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
          <div className="card border-accent-200 bg-accent-50 dark:bg-accent-950/20">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CheckCircle className="text-accent-600" size={20} />
              Analysis Complete
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-sm text-slate-500">Transactions</div>
                <div className="text-xl font-bold">{combinedSummary.transactions}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Total Income</div>
                <div className="text-xl font-bold">{formatZAR(combinedSummary.totalIncome)}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Total Expenses</div>
                <div className="text-xl font-bold">{formatZAR(combinedSummary.totalExpenses)}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Deductible</div>
                <div className="text-xl font-bold text-accent-600">
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
  );
}
