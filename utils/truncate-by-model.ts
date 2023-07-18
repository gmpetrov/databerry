import { AgentModelName } from '@prisma/client';

import { ModelConfig } from './config';
import splitTextByToken from './split-text-by-token';

const truncateByModel = async (props: {
  modelName: AgentModelName;
  text: string;
}) => {
  const inputRatio = 3 / 4;
  const limit = Math.round(ModelConfig[props.modelName].maxTokens * inputRatio);

  const chunks = await splitTextByToken({
    text: props.text,
    chunkSize: limit,
  });

  return chunks?.[0];
};

export default truncateByModel;
