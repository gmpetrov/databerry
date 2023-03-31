const pptxToText = async (file: File) => {
  const JSZip = await (await import('jszip')).default;

  const zip = await JSZip.loadAsync(file);
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
    for (const text of texts) {
      if (text.textContent) {
        all.push(text.textContent);
      }
    }
  });

  return all.join('\n\n');
};

export default pptxToText;
