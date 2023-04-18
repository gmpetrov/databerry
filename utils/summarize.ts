import { BasePromptTemplate } from 'langchain/prompts';

const summarize = async ({
  text,
  prompt,
}: {
  text: string;
  prompt?: BasePromptTemplate;
}) => {
  const { AnalyzeDocumentChain, loadSummarizationChain } = await import(
    'langchain/chains'
  );
  const { OpenAI } = await import('langchain/llms/openai');
  const model = new OpenAI({ temperature: 0, modelName: 'gpt-3.5-turbo' });
  const combineDocsChain = loadSummarizationChain(model, {
    prompt,
    combineMapPrompt: prompt,
    combinePrompt: prompt,
  });
  const chain = new AnalyzeDocumentChain({
    combineDocumentsChain: combineDocsChain,
  });

  const res = await chain.call({
    input_document: text,
  });

  return {
    answer: res.text,
  };
};

export default summarize;
