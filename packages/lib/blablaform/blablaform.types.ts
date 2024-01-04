import type { Schema as JSONSchema } from 'jsonschema';

// hander langchain typing problems
export type BlablaSchema = JSONSchema & Record<string, unknown>;
