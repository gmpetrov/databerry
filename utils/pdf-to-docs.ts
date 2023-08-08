import * as pdfJS from 'pdfjs-dist';

import { AppDocument } from '@app/types/document';

import cleanTextForEmbeddings from './clean-text-for-embeddings';

const pdfToDocs = async (buffer: ArrayBuffer) => {
  const pdf = await pdfJS.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;
  const meta = await pdf.getMetadata().catch(() => null);

  const pages = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item: any) => item.str).join('\n');
    pages.push(
      new AppDocument<any>({
        metadata: {
          page_number: i,
          total_pages: pdf.numPages,
        },
        pageContent: cleanTextForEmbeddings(text),
      })
    );
  }

  return pages;
};

export default pdfToDocs;
