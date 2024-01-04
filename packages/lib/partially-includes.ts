const partiallyIncludes = (str: string, needle: string) => {
  let buf = '';
  const limit = Math.min(str.length, needle.length);

  for (
    let i = 0;
    i < limit - (str.indexOf(buf) >= 0 ? str.indexOf(buf) : 0);
    i++
  ) {
    buf += needle[i];

    if (str.indexOf(buf) < 0) {
      return false;
    }
  }
  return true;
};
export default partiallyIncludes;
