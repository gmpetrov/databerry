const makeBatch = <T>(arr: T[], batchSize: number): T[][] => {
  const batches = [];
  for (let i = 0; i < arr.length; i += batchSize) {
    batches.push(arr.slice(i, i + batchSize));
  }
  return batches;
};

export default makeBatch;
