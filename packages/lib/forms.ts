import { JSONSchema7 } from 'json-schema';

import { FormFieldSchema } from './types/dtos';

export function formToJsonSchema(fields: FormFieldSchema[]): JSONSchema7 {
  const defaultValue = {
    type: 'object',
    properties: {},
    required: [],
  } as JSONSchema7;

  if ((fields || [])?.length <= 0) {
    return defaultValue;
  }

  return fields.reduce(
    (acc, field) => {
      acc['properties']![field.name] = {
        // id: field.id,
        ...(field.type === 'text'
          ? {
              type: 'string',
            }
          : {}),
        ...(field.type === 'multiple_choice'
          ? {
              type: 'string',
              enum: field.choices,
            }
          : {}),
      };
      acc['required'] = [
        ...acc.required!,
        ...(field.required ? [field.name] : []),
      ];
      return acc;
    },
    { type: 'object', properties: {}, required: [] } as JSONSchema7
  );
}
