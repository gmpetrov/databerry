/**
 * Utility function used to convert field key-value pairs to a structured object representation.
 *
 * This function takes an array of keys and a value, constructing a nested object structure based on the keys. Keys ending with 'index_' indicate an array should be created at that level, allowing for the representation of complex, nested data structures.
 *
 * The keys array is expected to be in reverse order, meaning the deepest level of nesting comes first. For example, given keys ['key4', 'index_0', 'key2', 'index_0', 'key1'] and a value 'value', the resulting object would be:
 * `{key1: [{key2: [{key4: 'value'}]}]}`.
 *
 * @param {string[]} splittedKeys - An array of keys representing the path to navigate through the base value. Keys ending with 'index_' indicate an array should be created at that level.
 * @param {string} value - The value to be assigned to the deepest level of the constructed object.
 * @returns {RecordType} A nested object structure based on the keys and value provided.
 *
 * @example
 * // Example usage:
 * // Given keys ['key1', 'index_0', 'key2', 'index_0', 'key4'] and a value 'value',
 * // the function constructs the following object:
 * // {key1: [{key2: [{key4: 'value'}]}]}
 *
 */

import { RecordType } from './constructKeysAndValues';

export default function makeObjectFromKeys(
  splittedKeys: string[],
  value: any
): RecordType | RecordType[] {
  if (splittedKeys?.length === 0) {
    return value;
  }

  const currentKey = splittedKeys?.[0];
  const remainingKeys = splittedKeys?.slice(1);

  if (currentKey?.includes('index_')) {
    return [makeObjectFromKeys(remainingKeys, value)] as RecordType[];
  } else {
    const newObj = {
      [currentKey]: makeObjectFromKeys(remainingKeys, value),
    } as RecordType;
    return newObj;
  }
}
