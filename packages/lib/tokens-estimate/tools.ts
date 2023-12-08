import { ChatCompletionTool } from 'openai/resources/chat/completions';

import { FunctionDef } from './functions';

type OpenAITool = ChatCompletionTool;

// Types representing the OpenAI function definitions. While the OpenAI client library
// does have types for function definitions, the properties are just Record<string, unknown>,
// which isn't very useful for type checking this formatting code.

export interface ToolDef {
  function: FunctionDef;
  type: 'function';
}
