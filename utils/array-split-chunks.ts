const arraySplitChunks = <T>(array: T[], chunkSize: number) => {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  return chunks;
};

export default arraySplitChunks;
