const { DOMParser } = require('@xmldom/xmldom');

const pptxToText = async (buffer: ArrayBuffer) => {
  const JSZip = await (await import('jszip')).default;

  const zip = await JSZip.loadAsync(buffer);
  const slidePromises = [] as any[];

  zip?.folder?.('ppt/slides')?.forEach((relativePath, file) => {
    slidePromises.push(file.async('text'));
  });

  const slideContents = await Promise.all(slidePromises);

  const all = [] as string[];

  slideContents.forEach((slideContent) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(slideContent, 'application/xml');
    const texts = xmlDoc.getElementsByTagName('a:t');

    Array.from(texts).forEach((el: any) => {
      if (el?.textContent) {
        all.push(el.textContent);
      }
    });
  });

  return all.join('\n\n');
};

export default pptxToText;
