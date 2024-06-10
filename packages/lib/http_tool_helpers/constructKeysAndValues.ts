export type RecordType = Record<PropertyKey, unknown>;

/*  
   utiltity used to convert the raw body object into keys and values,
   for array case, adopt the prefix index_{number} as a key, which will be recognised
   by @makeObjectFromKeys as an indicator to build an array at key.
*/

export default function constructKeysAndValues(
  obj: RecordType,
  parentKey = ''
) {
  let result: {
    key: string;
    value: unknown;
    isUserProvided: boolean;
    isRaw: true;
  }[] = [];

  for (let key in obj) {
    let newKey = parentKey ? `${parentKey}.${key}` : key;

    if (Array.isArray(obj[key])) {
      obj[key].forEach((item, index) => {
        if (typeof item === 'object') {
          result = result.concat(
            constructKeysAndValues(item, `${newKey}.index_${index}`)
          );
        } else {
          if (item === '{user}') {
            result.push({
              key: `${newKey}.index_${index}`,
              value: item,
              isUserProvided: true,
              isRaw: true,
            });
          } else {
            result.push({
              key: `${newKey}.index_${index}`,
              value: item,
              isUserProvided: false,
              isRaw: true,
            });
          }
        }
      });
    } else if (typeof obj[key] === 'object') {
      result = result.concat(
        constructKeysAndValues(obj[key] as RecordType, newKey)
      );
    } else {
      if (obj[key] === '{user}') {
        result.push({
          key: newKey,
          value: obj[key],
          isUserProvided: true,
          isRaw: true,
        });
      } else {
        result.push({
          key: newKey,
          value: obj[key],
          isUserProvided: false,
          isRaw: true,
        });
      }
    }
  }

  return result;
}
