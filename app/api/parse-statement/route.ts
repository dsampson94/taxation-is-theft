import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
    }

    const PDFParser = (await import('pdf2json')).default;
    const pdfParser = new PDFParser();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfData = await new Promise((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(new Error(errData.parserError || 'PDF parse error'));
      });
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        resolve(pdfData);
      });
      pdfParser.parseBuffer(buffer);
    });

    const pdf = pdfData as any;
    let fullText = '';

    if (pdf.Pages) {
      pdf.Pages.forEach((page: any) => {
        if (page.Texts) {
          // Sort text elements by Y position (row), then X position (column)
          // This preserves table structure in SA bank statement PDFs
          const sortedTexts = [...page.Texts].sort((a: any, b: any) => {
            const yDiff = (a.y || 0) - (b.y || 0);
            // Treat items within 0.5 units of Y as same row
            if (Math.abs(yDiff) < 0.5) return (a.x || 0) - (b.x || 0);
            return yDiff;
          });

          let lastY = -1;
          let lastX = -1;
          sortedTexts.forEach((text: any) => {
            const y = text.y || 0;
            const x = text.x || 0;

            // New row — add newline
            if (lastY >= 0 && Math.abs(y - lastY) >= 0.5) {
              fullText += '\n';
              lastX = -1;
            }

            // Column gap — add tab separator to preserve table columns
            if (lastX >= 0 && (x - lastX) > 2) {
              fullText += '\t';
            }

            text.R.forEach((run: any) => {
              fullText += decodeURIComponent(run.T);
            });
            fullText += ' ';

            lastY = y;
            lastX = x + (text.w || 0);
          });
          fullText += '\n\n'; // Page break
        }
      });
    }

    const pageCount = pdf.Pages?.length || 0;
    const trimmedText = fullText.trim();

    // Warn if PDF appears to be scanned/image-based (very little text extracted)
    if (pageCount > 0 && trimmedText.length < pageCount * 50) {
      return NextResponse.json({
        success: true,
        text: trimmedText,
        pages: pageCount,
        fileName: file.name,
        warning: 'Very little text was extracted from this PDF. It may be a scanned document. For best results, use a text-based PDF from your bank\'s online banking portal.',
      });
    }

    return NextResponse.json({
      success: true,
      text: trimmedText,
      pages: pageCount,
      fileName: file.name,
    });
  } catch (error) {
    console.error('PDF parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse PDF', message: (error as Error).message },
      { status: 500 }
    );
  }
}
