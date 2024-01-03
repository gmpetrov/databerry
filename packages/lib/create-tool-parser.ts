import { Schema as JSONSchema, validate } from 'jsonschema';

const createToolParser = (schema: JSONSchema) => (payload: string) => {
  const values = JSON.parse((payload as string) || '{}');

  validate(payload, schema, { throwFirst: true });

  return values as Record<string, unknown>;
};

export default createToolParser;
