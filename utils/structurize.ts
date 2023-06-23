// Parse text into Json from a given Json Schema
import { Configuration, OpenAIApi } from 'openai';

import countTokens from './count-tokens';
import splitTextByToken from './split-text-by-token';

const MAX_TOKENS = 3072;

const structurize = async (props: {
  text: string;
  spec: {
    [key: string]: any;
  };
}) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const nbTokens = countTokens({
    text: props.text,
  });

  let chunks = [props.text];

  if (nbTokens > MAX_TOKENS) {
    // For now just troncate the document
    chunks = await splitTextByToken({
      text: props.text,
      chunkSize: MAX_TOKENS,
    });

    chunks = [chunks[0]];
  }

  let json = null;
  let totalTokens = 0;

  for (const each of chunks) {
    const prompt = json
      ? `extractData Current Value: ${JSON.stringify(json)}\nContent: ${each}`
      : each;

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo-0613',
      messages: [{ role: 'user', content: prompt }],
      functions: [
        {
          name: 'extractData',
          description: 'Extract data from the following document',
          parameters: props.spec,
        },
      ],
    });

    totalTokens += completion?.data?.usage?.total_tokens || 0;

    json = JSON.parse(
      completion.data.choices?.[0]?.message?.function_call?.arguments || '{}'
    );

    console.log('JSON STEP', json);
  }

  console.log('totalTokens', totalTokens);
  console.log('completion', json);

  return {
    data: json,
    totalTokens,
  };
};

export default structurize;
