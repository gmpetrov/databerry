const wordToText = async (file: File) => {
  const buffer = await file.arrayBuffer();

  const mammoth = await import('mammoth');

  const result = await mammoth.extractRawText({ arrayBuffer: buffer });

  return result.value;
};

export default wordToText;
