'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  ArrowLeft,
  Calendar,
  TrendingUp,
  Receipt,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';

interface Checkpoint {
  id: string;
  title: string;
  monthsAnalyzed: number;
  totalIncome: number;
  totalDeductions: number;
  transactionCount: number;
  createdAt: string;
  content?: string;
  reviewNotes?: string | null;
  reviewQuestion?: string | null;
  reviewedAt?: string | null;
}

interface TaxYear {
  id: string;
  yearLabel: string;
}

const formatZAR = (amount: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

export default function CheckpointsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>}>
      <CheckpointsContent />
    </Suspense>
  );
}

function CheckpointsContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTaxYearId = searchParams.get('taxYearId') || '';

  const [taxYears, setTaxYears] = useState<TaxYear[]>([]);
  const [selectedTaxYear, setSelectedTaxYear] = useState<string>('');
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedContent, setExpandedContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewQuestion, setReviewQuestion] = useState('');
  const [showReviewInput, setShowReviewInput] = useState<string | null>(null);
  const [reviewResult, setReviewResult] = useState<{ [id: string]: string }>({});

  // Fetch tax years
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    fetch('/api/tax-years')
      .then(r => r.json())
      .then(data => {
        if (data.taxYears?.length) {
          setTaxYears(data.taxYears);
          // Prefer URL param, fallback to first
          const match = initialTaxYearId && data.taxYears.find((ty: TaxYear) => ty.id === initialTaxYearId);
          setSelectedTaxYear(match ? match.id : data.taxYears[0].id);
        }
      })
      .catch(() => toast.error('Failed to load tax years'))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  // Fetch checkpoints when tax year changes
  const fetchCheckpoints = useCallback(async () => {
    if (!selectedTaxYear) return;
    try {
      const res = await fetch(`/api/checkpoints?taxYearId=${selectedTaxYear}`);
      const data = await res.json();
      setCheckpoints(data.checkpoints || []);
    } catch {
      toast.error('Failed to load checkpoints');
    }
  }, [selectedTaxYear]);

  useEffect(() => {
    fetchCheckpoints();
  }, [fetchCheckpoints]);

  // Create new checkpoint
  const createCheckpoint = async () => {
    if (!selectedTaxYear) return;
    setCreating(true);
    try {
      const res = await fetch('/api/checkpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxYearId: selectedTaxYear }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create checkpoint');
      }
      toast.success('Checkpoint saved!');
      fetchCheckpoints();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  // View checkpoint content
  const toggleContent = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedContent(null);
      return;
    }
    setExpandedId(id);
    setLoadingContent(true);
    try {
      const res = await fetch(`/api/checkpoints/${id}`);
      const data = await res.json();
      setExpandedContent(data.checkpoint?.content || 'No content available');
    } catch {
      setExpandedContent('Failed to load checkpoint content');
    } finally {
      setLoadingContent(false);
    }
  };

  // Delete checkpoint
  const deleteCheckpoint = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/checkpoints/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Checkpoint deleted');
      setCheckpoints(prev => prev.filter(c => c.id !== id));
      if (expandedId === id) { setExpandedId(null); setExpandedContent(null); }
    } catch {
      toast.error('Failed to delete checkpoint');
    } finally {
      setDeleting(null);
    }
  };

  // Deep Review — send checkpoint to AI for verification
  const requestDeepReview = async (id: string) => {
    setReviewingId(id);
    try {
      const res = await fetch(`/api/checkpoints/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: reviewQuestion || undefined }),
      });
      if (res.status === 403) {
        toast.error('No credits remaining — purchase more to use Deep Review');
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Deep review failed');
      }
      const data = await res.json();
      setReviewResult(prev => ({ ...prev, [id]: data.reviewNotes }));
      // Update checkpoint in list to show review badge
      setCheckpoints(prev => prev.map(c => c.id === id ? { ...c, reviewNotes: data.reviewNotes, reviewedAt: new Date().toISOString() } : c));
      setShowReviewInput(null);
      setReviewQuestion('');
      toast.success(data.isAdmin ? 'Deep review complete (admin — no credit charged)' : 'Deep review complete — 1 credit used');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setReviewingId(null);
    }
  };

  // Download as markdown
  const downloadMarkdown = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/checkpoints/${id}`);
      const data = await res.json();
      if (!data.checkpoint?.content) { toast.error('No content'); return; }

      const blob = new Blob([data.checkpoint.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9\s_-]/g, '').replace(/\s+/g, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  // Print checkpoint (opens in new tab for clean print/PDF)
  const printCheckpoint = async (id: string) => {
    try {
      const res = await fetch(`/api/checkpoints/${id}`);
      const data = await res.json();
      if (!data.checkpoint?.content) { toast.error('No content'); return; }

      const content = data.checkpoint.content;
      // Convert basic markdown to HTML for print
      const html = markdownToBasicHtml(content);

      const printWindow = window.open('', '_blank');
      if (!printWindow) { toast.error('Pop-up blocked'); return; }

      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${data.checkpoint.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; line-height: 1.6; }
    h1 { font-size: 24px; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
    h2 { font-size: 18px; color: #2563eb; margin-top: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
    ul { padding-left: 20px; }
    li { margin-bottom: 4px; }
    strong { color: #0f172a; }
    em { color: #64748b; font-size: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>${html}</body>
</html>`);
      printWindow.document.close();
      // Give a moment for styles, then trigger print
      setTimeout(() => printWindow.print(), 500);
    } catch {
      toast.error('Print failed');
    }
  };

  const selectedYear = taxYears.find(ty => ty.id === selectedTaxYear);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-800 to-brand-900 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-brand-200 hover:text-white text-sm mb-4 transition">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <FileText size={28} />
            Review & Deep Analysis
          </h1>
          <p className="text-brand-200 mt-1">
            Save checkpoints of your tax analysis, verify results, and generate SARS-ready supporting documents
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Tax year selector + create button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          {taxYears.length > 0 ? (
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-slate-400" />
              <select
                value={selectedTaxYear}
                onChange={e => setSelectedTaxYear(e.target.value)}
                className="input py-2 pr-8"
              >
                {taxYears.map(ty => (
                  <option key={ty.id} value={ty.id}>{ty.yearLabel} Tax Year</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-slate-500">
              No tax years found.{' '}
              <Link href="/upload" className="text-brand-600 hover:underline">Upload a statement</Link>{' '}
              to get started.
            </p>
          )}

          {selectedTaxYear && (
            <button
              onClick={createCheckpoint}
              disabled={creating}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              {creating ? 'Saving...' : 'Save Checkpoint'}
            </button>
          )}
        </div>

        {/* Checkpoint list */}
        {checkpoints.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
            <h3 className="text-lg font-semibold mb-2">No checkpoints yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Checkpoints are snapshots of your tax analysis — save one after uploading statements to review
              your results, verify deductions, and track progress. Each checkpoint captures income, deductions, and AI confidence at that point.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {checkpoints.map(cp => (
              <div key={cp.id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{cp.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(cp.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {cp.monthsAnalyzed}/12 months
                      </span>
                      <span className="flex items-center gap-1">
                        <Receipt size={14} />
                        {cp.transactionCount} transactions
                      </span>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span>
                        Income: <strong className="text-green-600">{formatZAR(cp.totalIncome)}</strong>
                      </span>
                      <span>
                        Deductions: <strong className="text-brand-600">{formatZAR(cp.totalDeductions)}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        if (showReviewInput === cp.id) { setShowReviewInput(null); }
                        else { setShowReviewInput(cp.id); setReviewQuestion(''); }
                      }}
                      disabled={reviewingId === cp.id}
                      className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-500 hover:text-amber-600 transition disabled:opacity-50"
                      title="AI Deep Review (1 credit)"
                    >
                      {reviewingId === cp.id
                        ? <div className="animate-spin rounded-full h-[18px] w-[18px] border-b-2 border-amber-600" />
                        : <Sparkles size={18} />}
                    </button>
                    <button
                      onClick={() => toggleContent(cp.id)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-brand-600 transition"
                      title="View content"
                    >
                      {expandedId === cp.id ? <ChevronUp size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      onClick={() => downloadMarkdown(cp.id, cp.title)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-brand-600 transition"
                      title="Download as Markdown"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => printCheckpoint(cp.id)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-brand-600 transition"
                      title="Print / Save as PDF"
                    >
                      <FileText size={18} />
                    </button>
                    <button
                      onClick={() => deleteCheckpoint(cp.id)}
                      disabled={deleting === cp.id}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition disabled:opacity-50"
                      title="Delete checkpoint"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Deep Review input bar */}
                {showReviewInput === cp.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Optional question for the AI reviewer</label>
                        <input
                          type="text"
                          value={reviewQuestion}
                          onChange={e => setReviewQuestion(e.target.value)}
                          placeholder='e.g. "Are my home office deductions correct?"'
                          className="input w-full text-sm"
                          onKeyDown={e => { if (e.key === 'Enter') requestDeepReview(cp.id); }}
                        />
                      </div>
                      <button
                        onClick={() => requestDeepReview(cp.id)}
                        disabled={reviewingId === cp.id}
                        className="btn-primary flex items-center gap-2 shrink-0 self-end"
                      >
                        <Sparkles size={16} />
                        {reviewingId === cp.id ? 'Reviewing...' : 'Run Deep Review (1 credit)'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      AI will triple-check your deductions, flag errors, and suggest missed claims. Leave the question blank for a general review.
                    </p>
                  </div>
                )}

                {/* Review notes — from previous deep review */}
                {(cp.reviewNotes || reviewResult[cp.id]) && (
                  <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800/50">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 size={16} className="text-amber-600" />
                      <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                        AI Deep Review
                      </span>
                      {cp.reviewedAt && (
                        <span className="text-xs text-slate-400">
                          {new Date(cp.reviewedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {cp.reviewQuestion && (
                        <span className="text-xs text-slate-500 italic ml-2 flex items-center gap-1">
                          <MessageSquare size={12} /> &ldquo;{cp.reviewQuestion}&rdquo;
                        </span>
                      )}
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none overflow-x-auto bg-amber-50/50 dark:bg-amber-950/20 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-xs leading-relaxed">
                        {reviewResult[cp.id] || cp.reviewNotes}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Expanded content */}
                {expandedId === cp.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    {loadingContent ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600" />
                      </div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none overflow-x-auto">
                        <pre className="whitespace-pre-wrap text-xs leading-relaxed bg-slate-50 dark:bg-slate-900 rounded-lg p-4 overflow-x-auto">
                          {expandedContent}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Very basic markdown → HTML converter for print view */
function markdownToBasicHtml(md: string): string {
  let html = md
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Tables — convert markdown tables to HTML
  const lines = html.split('\n');
  let inTable = false;
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Table row
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').filter(c => c.trim() !== '');
      // Check if next line is separator
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      const isSep = /^\|[-\s|]+\|$/.test(nextLine);

      if (!inTable) {
        out.push('<table>');
        inTable = true;
      }

      if (isSep) {
        // Header row
        out.push('<tr>' + cells.map(c => `<th>${c.trim()}</th>`).join('') + '</tr>');
        i++; // skip separator
      } else {
        out.push('<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>');
      }
      continue;
    }

    if (inTable) {
      out.push('</table>');
      inTable = false;
    }

    // Headings
    if (line.startsWith('# ')) { out.push(`<h1>${line.slice(2)}</h1>`); continue; }
    if (line.startsWith('## ')) { out.push(`<h2>${line.slice(3)}</h2>`); continue; }
    if (line.startsWith('### ')) { out.push(`<h3>${line.slice(4)}</h3>`); continue; }

    // HR
    if (line === '---') { out.push('<hr>'); continue; }

    // List items
    if (line.startsWith('- ')) { out.push(`<li>${line.slice(2)}</li>`); continue; }

    // Bold and italic
    let processed = line
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');

    if (processed.trim() === '') {
      out.push('<br>');
    } else {
      out.push(`<p>${processed}</p>`);
    }
  }

  if (inTable) out.push('</table>');

  return out.join('\n');
}
