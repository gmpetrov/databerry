import { NextApiResponse } from 'next';
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources';

import { HttpToolPayload } from '@chaindesk/lib/agent';
import {
  createHandler as createHttpToolHandler,
  toJsonSchema as httpToolToJsonSchema,
} from '@chaindesk/lib/agent/tools/http';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import ChatModel from '@chaindesk/lib/chat-model';
import { ModelConfig } from '@chaindesk/lib/config';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import pipe from '@chaindesk/lib/middlewares/pipe';
import promptInject from '@chaindesk/lib/prompt-inject';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { HttpToolSchema } from '@chaindesk/lib/types/dtos';
import validate from '@chaindesk/lib/validate';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const approve = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string;

  const action = await prisma.actionApproval.findUnique({
    where: {
      id,
      organizationId: req.session.organization.id,
    },
    include: {
      agent: {
        include: {
          tools: {
            include: {
              datastore: true,
              form: true,
            },
          },
        },
      },
      message: {
        include: {
          input: true,
        },
      },
      tool: true,
    },
  });

  if (action?.organizationId !== req.session.organization.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  if (!action?.agent) {
    throw new ApiError(ApiErrorType.NOT_IMPLEMENTED);
  }

  if (action.tool?.type !== 'http') {
    throw new ApiError(ApiErrorType.NOT_IMPLEMENTED);
  }

  const t = HttpToolSchema.parse(action.tool);
  t.config.withApproval = false;

  const toolResult = await createHttpToolHandler(t)(
    action.payload as HttpToolPayload
  );

  // {role: "user",      content: "How's the weather this week?"}
  // {role: "assistant", tool_calls: [{type: "function", function: {name: "getCurrentLocation", arguments: "{}"}, id: "123"}
  // {role: "tool",      name: "getCurrentLocation", content: "Boston", tool_call_id: "123"}
  // {role: "assistant", tool_calls: [{type: "function", function: {name: "getWeather", arguments: '{"location": "Boston"}'}, id: "1234"}]}
  // {role: "tool",      name: "getWeather", content: '{"temperature": "50degF", "preciptation": "high"}', tool_call_id: "1234"}
  // {role: "assistant", content: "It's looking cold and rainy - you might want to wear a jacket!"}
  //
  const model = new ChatModel();

  const formatedHttpTools = action.agent.tools
    .filter((each) => each.type === 'http')
    .map((each) => ({
      type: 'function',
      function: {
        ...httpToolToJsonSchema(HttpToolSchema.parse(each)),
        parse: JSON.parse,
        function: createHttpToolHandler(HttpToolSchema.parse(each)),
      },
    })) as ChatCompletionTool[];

  const { answer, usage } = await model.call({
    model: ModelConfig[action.agent.modelName].name,
    messages: [
      ...(action?.agent?.systemPrompt
        ? [{ role: 'system', content: action.agent.systemPrompt }]
        : []),
      ...(action?.message?.input
        ? [
            {
              role: 'user',
              content: action?.agent?.userPrompt
                ? promptInject({
                    query: action?.message?.input?.text,
                    template: action?.agent?.userPrompt,
                  })
                : action?.message?.input?.text,
            },
          ]
        : []),
      {
        role: 'assistant',
        tool_calls: [
          {
            type: 'function',
            function: { name: t.id, arguments: JSON.stringify(action.payload) },
            id: t.id,
          },
        ],
      },
      {
        role: 'tool',
        name: t.id,
        content: JSON.stringify(toolResult),
        tool_call_id: t.id,
      },
    ] as ChatCompletionMessageParam[],
    temperature: action.agent.temperature,
    tools: formatedHttpTools,
  });

  await prisma.$transaction([
    prisma.message.update({
      where: {
        id: action.messageId!,
      },
      data: {
        text: answer,
        usage: {
          ...usage,
        },
      },
    }),
    prisma.actionApproval.delete({
      where: {
        id,
      },
    }),
  ]);

  return {
    answer,
  };
};

handler.post(
  pipe(
    validate({
      handler: respond(approve),
    })
  )
);

export default handler;
