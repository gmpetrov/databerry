import { AppDocument, FileMetadataSchema } from '@app/types/document';

import cleanTextForEmbeddings from './clean-text-for-embeddings';

const excelToDocs = async (buffer: ArrayBuffer) => {
  const XLSX = await import('xlsx');

  const workbook = XLSX.read(buffer, { type: 'array' });

  const docs: AppDocument<any>[] = [];

  workbook.SheetNames.forEach((sheetName, index) => {
    const worksheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_csv(worksheet);
    // text += sheetData;

    docs.push(
      new AppDocument<any>({
        pageContent: cleanTextForEmbeddings(sheetData),
        metadata: {
          page_number: index + 1,
          total_pages: workbook.SheetNames.length,
        },
      })
    );
  });

  return docs;
};

export default excelToDocs;
