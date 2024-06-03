function getNestedKeysAndValues(obj: object, path = '') {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newPath = path ? `${path}.${key}` : key;
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      acc.push(...getNestedKeysAndValues(value, newPath));
    } else {
      acc.push([newPath, value]);
    }
    return acc;
  }, [] as [string, any][]);
}
export default getNestedKeysAndValues;
