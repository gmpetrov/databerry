import ExcelJS from 'exceljs';

interface IExcelSheetSkeleton<R, H> {
  rows: R[keyof R][][];
  header: H[];
}

export async function generateExcelBuffer<R, H extends string = string>({
  header,
  rows,
}: IExcelSheetSkeleton<R, H>) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('sheet');

  worksheet.addRow(header);
  worksheet.addRows(rows);

  const excelBuffer = workbook.csv.writeBuffer();

  return excelBuffer;
}
