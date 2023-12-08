import OpenAI from 'openai';
import { ChatCompletionNamedToolChoice } from 'openai/resources/chat/completions';

import countTokens, {
  countTokensEstimation,
} from '@chaindesk/lib/count-tokens';

import { formatFunctionDefinitions, FunctionDef } from './functions';
import { ToolDef } from './tools';

type Message = OpenAI.Chat.ChatCompletionMessageParam;
type Function = OpenAI.Chat.ChatCompletionCreateParams.Function;
type FunctionCall = OpenAI.Chat.ChatCompletionFunctionCallOption;
type Tool = OpenAI.Chat.ChatCompletionTool;
type ToolChoice = OpenAI.Chat.ChatCompletionToolChoiceOption;

/**
 * Estimate the number of tokens a prompt will use.
 * @param {Object} prompt OpenAI prompt data
 * @param {Message[]} prompt.messages OpenAI chat messages
 * @param {Function[]} prompt.functions OpenAI function definitions
 * @param {useFastApproximation} prompt.useFastApproximation Whether to use the fast approximation or not
 * @returns An estimate for the number of tokens the prompt will use
 */
export function promptTokensEstimate({
  messages,
  functions,
  function_call,
  tools,
  tool_choice,
  useFastApproximation,
}: {
  messages: Message[];
  functions?: Function[];
  function_call?: 'none' | 'auto' | FunctionCall;
  tools?: Tool[];
  tool_choice?: ToolChoice;
  useFastApproximation?: boolean;
}): number {
  // It appears that if functions are present, the first system message is padded with a trailing newline. This
  // was inferred by trying lots of combinations of messages and functions and seeing what the token counts were.
  let paddedSystem = false;
  let tokens = messages
    .map((m) => {
      if (m.role === 'system' && functions && !paddedSystem) {
        m = { ...m, content: m.content + '\n' };
        paddedSystem = true;
      }
      return messageTokensEstimate({ message: m, useFastApproximation });
    })
    .reduce((a, b) => a + b, 0);

  // Each completion (vs message) seems to carry a 3-token overhead
  tokens += 3;

  // If there are functions, add the function definitions as they count towards token usage
  if (functions) {
    tokens += functionsTokensEstimate({
      functions: functions as any as FunctionDef[],
      useFastApproximation,
    });
  }

  if (tools) {
    tokens += toolsTokensEstimate({
      tools: tools as any as ToolDef[],
      useFastApproximation,
    });
  }

  // If there's a system message _and_ functions are present, subtract four tokens. I assume this is because
  // functions typically add a system message, but reuse the first one if it's already there. This offsets
  // the extra 9 tokens added by the function definitions.
  if (functions && messages.find((m) => m.role === 'system')) {
    tokens -= 4;
  }

  // If function_call is 'none', add one token.
  // If it's a FunctionCall object, add 4 + the number of tokens in the function name.
  // If it's undefined or 'auto', don't add anything.
  if (function_call && function_call !== 'auto') {
    tokens +=
      function_call === 'none'
        ? 1
        : stringTokens(function_call.name, useFastApproximation) + 4;
  }

  if (tool_choice && tool_choice !== 'auto') {
    tokens +=
      tool_choice === 'none'
        ? 1
        : stringTokens(
            tool_choice?.function?.name || '',
            useFastApproximation
          ) + 4;
  }

  return tokens;
}

/**
 * Count the number of tokens in a string.
 * @param s The string to count tokens in
 * @param useFastApproximation Whether to use the fast approximation or not
 * @returns The number of tokens in the string
 */
export function stringTokens(
  s: string,
  useFastApproximation?: boolean
): number {
  if (useFastApproximation) {
    return countTokensEstimation({ text: s });
  }
  return countTokens({ text: s });
}

/**
 * Estimate the number of tokens a message will use. Note that using the message within a prompt will add extra
 * tokens, so you might want to use `promptTokensEstimate` instead.
 * @param {message} props.message An OpenAI chat message
 * @param {useFastApproximation} props.useFastApproximation Whether to use the fast approximation or not
 * @returns An estimate for the number of tokens the message will use
 */
export function messageTokensEstimate(props: {
  message: Message;
  useFastApproximation?: boolean;
}): number {
  const components: string[] = [props.message.role];
  if (typeof props.message.content === 'string') {
    components.push(props.message.content);
  }

  if ('name' in props.message && props.message.name) {
    components.push(props.message.name);
  }

  if (props.message.role === 'assistant' && props.message.function_call) {
    components.push(props.message.function_call.name);
    components.push(props.message.function_call.arguments);
  }

  let tokens = components
    .map((each) => stringTokens(each, props.useFastApproximation))
    .reduce((a, b) => a + b, 0);
  tokens += 3; // Add three per props.message
  if ('name' in props.message && props.message.name) {
    tokens += 1;
  }
  if (props.message.role === 'function') {
    tokens -= 2;
  }
  if (props.message.role === 'assistant' && props.message.function_call) {
    tokens += 3;
  }
  return tokens;
}

/**
 * Estimate the number of tokens a function definition will use. Note that using the function definition within
 * a prompt will add extra tokens, so you might want to use `promptTokensEstimate` instead.
 * @param {functions} props.functions An array of OpenAI function definitions
 * @param {useFastApproximation} props.useFastApproximation Whether to use the fast approximation or not
 * @returns An estimate for the number of tokens the function definitions will use
 */
export function functionsTokensEstimate(props: {
  functions: FunctionDef[];
  useFastApproximation?: boolean;
}) {
  const promptDefinitions = formatFunctionDefinitions(props.functions);
  let tokens = stringTokens(promptDefinitions, props.useFastApproximation);
  tokens += 9; // Add nine per completion
  return tokens;
}

export function toolsTokensEstimate(props: {
  tools: ToolDef[];
  useFastApproximation?: boolean;
}) {
  const promptDefinitions = formatFunctionDefinitions(
    props.tools.map((each) => each.function)
  );
  let tokens = stringTokens(promptDefinitions, props.useFastApproximation);
  tokens += 9; // Add nine per completion
  return tokens;
}
