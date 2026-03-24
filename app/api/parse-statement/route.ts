import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
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
          page.Texts.forEach((text: any) => {
            text.R.forEach((run: any) => {
              fullText += decodeURIComponent(run.T) + ' ';
            });
          });
          fullText += '\n';
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
