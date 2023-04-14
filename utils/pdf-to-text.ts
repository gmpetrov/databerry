const pdfToText = async (buffer: ArrayBuffer) => {
  // @ts-ignore
  const pdfJS = await import('pdfjs-dist/webpack');

  const pdf = await pdfJS.getDocument({
    data: new Uint8Array(buffer),
    // useWorkerFetch: true,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;
  const meta = await pdf.getMetadata().catch(() => null);

  const pages = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item: any) => item.str).join('\n');
    pages.push(text);
  }

  return pages.join('\n\n');
};

export default pdfToText;
