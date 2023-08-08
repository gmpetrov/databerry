import { AppDocument } from '@app/types/document';

import cleanTextForEmbeddings from './clean-text-for-embeddings';

const { DOMParser } = require('@xmldom/xmldom');

const pptxToDocs = async (buffer: ArrayBuffer) => {
  const JSZip = await (await import('jszip')).default;

  const zip = await JSZip.loadAsync(buffer);
  const slidePromises = [] as any[];

  zip?.forEach((relativePath, file) => {
    if (relativePath.startsWith('ppt/slides/slide')) {
      slidePromises.push(file.async('text'));
    }
  });

  const slideContents = await Promise.all(slidePromises);

  const docs: AppDocument<any>[] = [];

  slideContents.forEach((slideContent, index) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(slideContent, 'application/xml');
    const textTags = xmlDoc.getElementsByTagName('a:t');
    const texts: string[] = [];

    Array.from(textTags).forEach((el: any) => {
      if (el?.textContent) {
        texts.push(el.textContent);
      }
    });

    docs.push(
      new AppDocument<any>({
        pageContent: cleanTextForEmbeddings(texts.join(' ')),
        metadata: {
          page_number: index + 1,
          total_pages: slideContents.length,
        },
      })
    );
  });

  return docs;
};

export default pptxToDocs;
