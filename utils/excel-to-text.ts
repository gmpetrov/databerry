const excelToText = async (buffer: ArrayBuffer) => {
  let text = '';
  const XLSX = await import('xlsx');

  const workbook = XLSX.read(buffer, { type: 'array' });

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_csv(worksheet);
    text += sheetData;
  });

  return text;
};

export default excelToText;
