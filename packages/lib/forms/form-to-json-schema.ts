import type { Schema as JSONSchema } from 'jsonschema';

import slugify from '../slugify';
import { FormFieldSchema } from '../types/dtos';

export function formToJsonSchema(fields: FormFieldSchema[]): JSONSchema {
  const defaultValue = {
    type: 'object',
    properties: {},
    required: [],
  } as JSONSchema;

  if ((fields || [])?.length <= 0) {
    return defaultValue;
  }

  return fields.reduce(
    (acc, field) => {
      const fieldName = slugify(field.name);

      acc['properties']![fieldName] = {
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
        ...(acc.required! as string[]),
        ...(field.required ? [fieldName] : []),
      ];
      return acc;
    },
    { type: 'object', properties: {}, required: [] } as JSONSchema
  );
}
