import { CompletionUsage } from 'openai/resources';

import { AgentModelName } from '@chaindesk/prisma';

import { ModelConfig } from './config';

type Props = {};

function getUsageCost(props: {
  modelName: AgentModelName;
  usage: CompletionUsage;
}) {
  return (
    (props.usage?.prompt_tokens || 0) *
      ModelConfig[props.modelName]?.providerPriceByInputToken +
    (props.usage?.completion_tokens || 0) *
      ModelConfig[props.modelName]?.providerPricePriceByOutputToken
  );
}
export default getUsageCost;
