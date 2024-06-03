import { RecordType } from './constructKeysAndValues';

function mergeTwoObjects(obj1: RecordType, obj2: RecordType) {
  // Check if either obj1 or obj2 is not an object
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj2;
  }

  // Iterate over keys in obj2
  for (let key in obj2) {
    // If key exists in obj1
    if (obj1.hasOwnProperty(key)) {
      // If both values are objects, recursively merge them
      if (
        typeof obj1[key] === 'object' &&
        typeof obj2[key] === 'object' &&
        !Array.isArray(obj1[key]) &&
        !Array.isArray(obj2[key])
      ) {
        obj1[key] = mergeTwoObjects(
          obj1[key] as RecordType,
          obj2[key] as RecordType
        );
      } else if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
        obj1[key] = [...obj1[key], ...obj2[key]];
      } else {
        // If one of the values is not an object, replace it with the value from obj2
        obj1[key] = obj2[key];
      }
    } else {
      // If key does not exist in obj1, add it
      obj1[key] = obj2[key];
    }
  }

  return obj1;
}

export default function MergeListOfObjects(listOfObjects: RecordType[]) {
  if (listOfObjects?.length === 0) {
    return {};
  }

  let result = listOfObjects?.[0];

  for (let i = 1; i < listOfObjects?.length; i++) {
    result = mergeTwoObjects(result, listOfObjects[i]);
  }

  return result;
}
