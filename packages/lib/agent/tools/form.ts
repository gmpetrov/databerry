import type { Schema as JSONSchema } from 'jsonschema';

import createToolParser from '@chaindesk/lib/create-tool-parser';
import { handleFormValid } from '@chaindesk/lib/forms';
import slugify from '@chaindesk/lib/slugify';
import {
  ChatRequest,
  FormConfigSchema,
  FormToolSchema,
} from '@chaindesk/lib/types/dtos';
import { Form } from '@chaindesk/prisma';

import { CreateToolHandler, ToolToJsonSchema } from './type';

export type FormToolPayload = Record<string, unknown>;

const getFormConfig = (tool: FormToolSchema, config: any) => {
  const form = tool.form as Form;
  const useDraftConfig = !!config?.toolConfig?.useDraftConfig;
  const formConfig = (
    useDraftConfig ? form?.draftConfig : form?.publishedConfig
  ) as FormConfigSchema;

  return formConfig;
};

export const toJsonSchema = ((tool: FormToolSchema, config) => {
  const form = tool.form as Form;
  const useDraftConfig = !!config?.toolConfig?.useDraftConfig;
  const formConfig = (
    useDraftConfig ? form?.draftConfig : form?.publishedConfig
  ) as FormConfigSchema;

  return {
    name: `isFormValid_${slugify(form.name)}`,
    description:
      'Trigger only when all the required field have been answered by the user. Each field is provided by the user not by the AI. Never fill a field if not provided by the user.',
    parameters: (formConfig as any)?.schema,
  };
}) as ToolToJsonSchema;

export const createHandler = ((tool: FormToolSchema, config) =>
  async (payload: FormToolPayload) => {
    const form = tool.form as Form;
    const useDraftConfig = !!config?.toolConfig?.useDraftConfig;
    const conversationId = config?.conversationId as string;
    const formConfig = (
      useDraftConfig ? form?.draftConfig : form?.publishedConfig
    ) as FormConfigSchema;

    await handleFormValid({
      conversationId,
      formId: tool.formId,
      values: payload,
      webhookUrl: formConfig?.webhook?.url!,
    });

    return {
      data: 'Form submitted successfully',
    };
  }) as CreateToolHandler;

export const createParser =
  (tool: FormToolSchema, config: any) => (payload: string) => {
    const form = tool.form as Form;
    const useDraftConfig = !!config?.toolConfig?.useDraftConfig;
    const formConfig = (
      useDraftConfig ? form?.draftConfig : form?.publishedConfig
    ) as FormConfigSchema;
    const schema = formConfig?.schema as JSONSchema;

    return createToolParser(schema)(payload);
  };

// export const toJsonSchemaTest = ((tool: FormToolSchema, config) => {
//   const form = tool.form as Form;
//   const useDraftConfig = !!config?.toolConfig?.useDraftConfig;
//   const formConfig = (
//     useDraftConfig ? form?.draftConfig : form?.publishedConfig
//   ) as FormConfigSchema;

//   return {
//     name: `form_state_${slugify(form.name)}`,
//     description: `Always use this tool while in the process of filling the form ${slugify(
//       form.name
//     )} in order to track its current state`,
//     parameters: {
//       type: 'object',
//       properties: {
//         currentFieldName: {
//           type: 'string',
//           description: 'The name of the field that is going to be asked',
//         },
//       },
//       required: ['currentFieldName'],
//     } as JSONSchema,
//   };
// }) as ToolToJsonSchema;

// export const createHandlerTest = ((tool: FormToolSchema, config) =>
//   async (payload: FormToolPayload) => {
//     console.log('CALLED -_______-------->', payload);

//     const form = tool.form as Form;
//     const useDraftConfig = !!config?.toolConfig?.useDraftConfig;
//     const formConfig = (
//       useDraftConfig ? form?.draftConfig : form?.publishedConfig
//     ) as FormConfigSchema;

//     let metadata: any = undefined;

//     const currentFieldName = payload.currentFieldName as string;

//     const field = formConfig.fields.find(
//       (one) => currentFieldName === slugify(one.name)
//     );

//     if (field) {
//       if (field.type === 'multiple_choice') {
//         metadata = {
//           ui: {
//             type: 'multiple_choice',
//             choices: field?.choices,
//           },
//         };
//       }
//     }

//     return {
//       data: 'ok',
//       metadata,
//     };
//   }) as CreateToolHandler;

// export const createParserTest =
//   (tool: FormToolSchema, config: any) => (payload: string) => {
//     const schema = toJsonSchemaTest(tool, config)?.parameters;

//     return createToolParser(schema)(payload);
//   };
