import axios from 'axios';
import { z } from 'zod';

import {
  AgentModelName,
  AgentVisibility,
  Conversation,
  ConversationChannel,
  ConversationPriority,
  ConversationStatus,
  FormType,
  Message,
  MessageEval,
  Prisma,
  PromptType,
  ServiceProviderType,
  ToolType,
} from '@chaindesk/prisma';

import {
  AcceptedAudioMimeTypes,
  AcceptedDocumentMimeTypes,
  AcceptedImageMimeTypes,
  AcceptedVideoMimeTypes,
} from '../accepted-mime-types';
import { YOUTUBE_VIDEO_URL_RE } from '../youtube-api/lib';

import { AIStatus } from './crisp';
import {
  BaseDocumentMetadataSchema,
  FileMetadataSchema,
  Source,
} from './document';
import { AgentInterfaceConfig, DatastoreSchema } from './models';
import { ChainType } from '.';

export const agentInclude: Prisma.AgentInclude = {
  organization: {
    select: {
      id: true,
      subscriptions: {
        select: {
          id: true,
          plan: true,
        },
        where: {
          status: {
            in: ['active'],
          },
        },
      },
    },
  },
  tools: {
    include: {
      datastore: {
        include: {
          _count: {
            select: {
              datasources: {
                where: {
                  status: {
                    in: ['running', 'pending'],
                  },
                },
              },
            },
          },
        },
      },
      form: true,
    },
  },
};

export type agentInclude = typeof agentInclude;

export type GetAgentResponse = Prisma.AgentGetPayload<{
  include: agentInclude;
}>;

export const CreateDatastoreRequestSchema = DatastoreSchema.extend({
  id: z.string().trim().cuid().optional(),
});
export type CreateDatastoreRequestSchema = z.infer<
  typeof CreateDatastoreRequestSchema
>;

export const UpdateDatastoreRequestSchema =
  CreateDatastoreRequestSchema.partial();
export type UpdateDatastoreRequestSchema = z.infer<
  typeof UpdateDatastoreRequestSchema
>;

export const UpsertDatasourceRequestSchema = z.object({
  id: z.string().trim().cuid().optional(),
  datasourceText: z.string().optional(),
  config: z.object({}),
});

export const TaskLoadDatasourceRequestSchema = z.object({
  datasourceId: z.string().min(1),
  isUpdateText: z.boolean().optional().default(false),
});
export type TaskLoadDatasourceRequestSchema = z.infer<
  typeof TaskLoadDatasourceRequestSchema
>;

export const TaskRemoveDatasourceRequestSchema = z.object({
  datastoreId: z.string().min(1),
  datasourceId: z.string().min(1),
});
export type TaskRemoveDatasourceRequestSchema = z.infer<
  typeof TaskRemoveDatasourceRequestSchema
>;
export const TaskRemoveDatastoreSchema = z.object({
  datastoreId: z.string().min(1),
});
export type TaskRemoveDatastoreSchema = z.infer<
  typeof TaskRemoveDatasourceRequestSchema
>;

export const FiltersSchema = z.object({
  datastore_ids: z.array(z.string().cuid()).optional(),
  datasource_ids: z.array(z.string().cuid()).optional(),
  custom_ids: z.array(z.string()).optional(),
});

export const SearchRequestSchema = z.object({
  query: z.string(),
  topK: z.number().default(5).optional(),
  tags: z.array(z.string()).optional(),
  filters: FiltersSchema.optional(),
});

export type SearchRequestSchema = z.infer<typeof SearchRequestSchema>;

export const SearchManyRequestSchema = z.object({
  queries: z.array(SearchRequestSchema),
});

export type SearchManyRequestSchema = z.infer<typeof SearchManyRequestSchema>;

const SearchResultsSchema = z.array(
  z.object({
    text: z.string(),
    score: z.number(),
    source_url: z.string().optional(),
  })
);

export const SearchSimpleResponseSchema = SearchResultsSchema;

export type SearchSimpleResponseSchema = z.infer<
  typeof SearchSimpleResponseSchema
>;

export const SearchResponseSchema = z.array(
  z.object({
    query: z.string(),
    results: SearchResultsSchema,
  })
);
export type SearchResponseSchema = z.infer<typeof SearchResponseSchema>;

export const UpsertDocumentSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  text: z.string().min(1),
  metadata: z
    .union([BaseDocumentMetadataSchema, FileMetadataSchema])
    .optional(),
});

export const UpsertRequestSchema = z.object({
  documents: z.array(UpsertDocumentSchema),
});

export type UpsertRequestSchema = z.infer<typeof UpsertRequestSchema>;

export const UpsertResponseSchema = z.object({
  ids: z.array(z.string()),
});

export type UpsertResponseSchema = z.infer<typeof UpsertResponseSchema>;

export const UpdateRequestSchema = UpsertDocumentSchema.extend({
  id: z.string().min(1),
});

export type UpdateRequestSchema = z.infer<typeof UpdateRequestSchema>;

export const UpdateResponseSchema = z.object({
  id: z.string(),
});

export type UpdateResponseSchema = z.infer<typeof UpdateResponseSchema>;

export const ChatModelConfigSchema = z.object({
  temperature: z.number().min(0.0).max(1.0).optional(),
  maxTokens: z.number().optional(),
  presencePenalty: z.number().optional(),
  frequencyPenalty: z.number().optional(),
  topP: z.number().optional(),
});

export type ChatModelConfigSchema = z.infer<typeof ChatModelConfigSchema>;

export const CreateAttachmentSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  size: z.number(),
  mimeType: z.string(),
});

export type CreateAttachmentSchema = z.infer<typeof CreateAttachmentSchema>;

export const CreateContactSchema = z.object({
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  conversationId: z.string().cuid().optional(),
  userId: z.string().optional(),
});

export type CreateContactSchema = z.infer<typeof CreateContactSchema>;

export const UpdateContactSchema = CreateContactSchema;

export type UpdateContactSchema = z.infer<typeof UpdateContactSchema>;

export const ChatRequest = ChatModelConfigSchema.extend({
  isDraft: z.boolean().optional().default(false),
  query: z.string(),
  streaming: z.boolean().optional().default(false),
  visitorId: z.union([z.string().cuid().nullish(), z.literal('')]),
  contactId: z.union([z.string().cuid().nullish(), z.literal('')]),
  conversationId: z.union([z.string().cuid().nullish(), z.literal('')]),
  channel: z.nativeEnum(ConversationChannel).default('dashboard'),
  truncateQuery: z.boolean().optional(),
  context: z.string().optional(),

  systemPrompt: z.string().optional(),
  userPrompt: z.string().optional(),

  modelName: z.nativeEnum(AgentModelName).optional(),

  filters: FiltersSchema.optional(),

  toolsConfig: z.record(z.string().cuid(), z.any()).optional(),

  formId: z.union([z.string().cuid().nullish(), z.literal('')]),

  attachments: z.array(CreateAttachmentSchema).optional(),

  contact: CreateContactSchema.optional(),
  attachmentsForAI: z.array(z.string().cuid()).optional(),

  images: z.array(z.string().url()).optional(),

  //  DEPRECATED
  promptTemplate: z.string().optional(),
  promptType: z.nativeEnum(PromptType).optional(),
});

export type ChatRequest = z.infer<typeof ChatRequest>;
export const RunChainRequest = ChatRequest.extend({
  chainType: z.nativeEnum(ChainType),
});

export type RunChainRequest = z.infer<typeof RunChainRequest>;

const ServiceProviderBaseSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
});

export const ServiceProviderZendeskSchema = ServiceProviderBaseSchema.extend({
  type: z.literal(ServiceProviderType.zendesk),
  config: z.object({
    email: z.string().email(),
    domain: z.string().min(1),
    apiToken: z.string().min(1),
  }),
});

export const ServiceProvideTelegramSchema = ServiceProviderBaseSchema.extend({
  type: z.literal(ServiceProviderType.telegram),
  config: z.object({
    http_token: z.string().superRefine(async (arg, ctx) => {
      const invalidTokenFormatIssue = {
        code: 'custom',
        message: 'Invalid Token Format',
      } as const;
      const unRecognizedTokenIssue = {
        code: 'custom',
        message: 'Http token is not a recognized  telegram token.',
      } as const;

      // /^\d+:[\w-]+$/: numeric-part:alphanumeric-part
      if (!/^\d+:[\w-]+$/.test(arg)) {
        return ctx.addIssue(invalidTokenFormatIssue);
      }

      try {
        const { data: response } = await axios.post(
          `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/tools/http-tool/validator`,
          {
            url: `https://api.telegram.org/bot${arg}/getMe`,
            method: 'POST',
          }
        );
        if (!response.data.ok) {
          return ctx.addIssue(unRecognizedTokenIssue);
        }
      } catch {
        return ctx.addIssue(unRecognizedTokenIssue);
      }
    }),
    secret_key: z.string().cuid().optional(), // set by chaindesk, to validate webhook calls.
  }),
});

export type ServiceProvideTelegramSchema = z.infer<
  typeof ServiceProvideTelegramSchema
>;

export const ServiceProviderWhatsappSchema = ServiceProviderBaseSchema.extend({
  type: z.literal(ServiceProviderType.whatsapp),
  accessToken: z.string().min(1),
  config: z.object({
    appId: z.string().min(1),
    phoneNumberId: z.string().min(1),
    phoneNumber: z.string().min(1),
    webhookVerifyToken: z.string().optional(),
  }),
});

export type ServiceProviderWhatsappSchema = z.infer<
  typeof ServiceProviderWhatsappSchema
>;

export const ServiceProviderSchema = z.discriminatedUnion('type', [
  ServiceProviderZendeskSchema,
  ServiceProviderWhatsappSchema,
]);

export const AddServiceProviderTelegramSchema =
  ServiceProvideTelegramSchema.extend({
    agentId: z.string().cuid(),
  });

export type AddServiceProviderTelegramSchema = z.infer<
  typeof AddServiceProviderTelegramSchema
>;

export const AddServiceProviderWhatsappSchema =
  ServiceProviderWhatsappSchema.extend({
    agentId: z.string().cuid(),
  });

export type AddServiceProviderWhatsappSchema = z.infer<
  typeof AddServiceProviderWhatsappSchema
>;

export type ServiceProviderSchema = z.infer<typeof ServiceProviderSchema>;
export type ServiceProviderZendesk = Extract<
  ServiceProviderSchema,
  { type: 'zendesk' }
>;
export type ServiceProviderWhatsapp = Extract<
  ServiceProviderSchema,
  { type: 'whatsapp' }
>;

const ToolBaseSchema = z.object({
  id: z.string().cuid().optional(),
  type: z.nativeEnum(ToolType),
  serviceProviderId: z.string().cuid().optional().nullable(),
  serviceProvider: z.any().optional(),
  datastore: z.any().optional(),
  form: z.any().optional(),
});

// export const ToolSchema = z.object({
//   id: z.string().cuid().optional(),
//   type: z.nativeEnum(ToolType),
//   datastoreId: z.string().cuid().optional(),
//   name: z.string().trim().optional(),
//   description: z.string().trim().optional().nullable(),
//   config: z.object({}).optional(),
// });

const ToolKeyValueField = z
  .object({
    key: z.string().min(1),
    value: z.string().optional(),
    isUserProvided: z.boolean().optional(),
    description: z.string().optional(),
    acceptedValues: z.array(z.string().optional()).optional(),
  })
  .refine(
    (val) => {
      if (!val.isUserProvided && !val.value) {
        return false;
      }
      return true;
    },
    {
      message: 'Value is required',
      path: ['value'],
    }
  );

export const HttpToolSchema = ToolBaseSchema.extend({
  type: z.literal(ToolType.http),
  config: z.object({
    url: z.string().url(),
    name: z.string().optional(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
    description: z.string().min(3),
    withApproval: z.boolean().optional(),
    headers: z.array(ToolKeyValueField).optional(),
    body: z.array(ToolKeyValueField).optional(),
    queryParameters: z.array(ToolKeyValueField).optional(),
    pathVariables: z.array(ToolKeyValueField).optional(),
  }),
});

export const LeadCaptureToolchema = ToolBaseSchema.extend({
  type: z.literal(ToolType.lead_capture),
  config: z.object({
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    phoneNumberExtension: z.string().optional(),
    isRequired: z.boolean().optional(),
    isEmailEnabled: z.boolean().optional(),
    isPhoneNumberEnabled: z.boolean().optional(),
  }),
});

export const ToolSchema = z.discriminatedUnion('type', [
  HttpToolSchema,
  LeadCaptureToolchema,
  ToolBaseSchema.extend({
    type: z.literal(ToolType.datastore),
    datastoreId: z.string().cuid().optional(),
  }),
  ToolBaseSchema.extend({
    type: z.literal(ToolType.connector),
    config: z.any({}),
  }),
  ToolBaseSchema.extend({
    type: z.literal(ToolType.agent),
    config: z.any({}),
  }),
  ToolBaseSchema.extend({
    type: z.literal(ToolType.form),
    formId: z.string().cuid(),
    config: z.any({}).optional(),
  }),
  ToolBaseSchema.extend({
    type: z.literal(ToolType.mark_as_resolved),
  }),
  ToolBaseSchema.extend({
    type: z.literal(ToolType.request_human),
  }),
]);

export type ToolSchema = z.infer<typeof ToolSchema>;

export type HttpToolSchema = Extract<ToolSchema, { type: 'http' }>;
export type LeadCaptureToolchema = Extract<
  ToolSchema,
  { type: 'lead_capture' }
>;
export type FormToolSchema = Extract<ToolSchema, { type: 'form' }>;
export type MarkAsResolvedToolSchema = Extract<
  ToolSchema,
  { type: 'mark_as_resolved' }
>;
export type RequestHumanToolSchema = Extract<
  ToolSchema,
  { type: 'request_human' }
>;
export type LeadCaptureToolSchema = Extract<
  ToolSchema,
  { type: 'lead_capture' }
>;

export const CreateAgentSchema = z.object({
  id: z.string().trim().cuid().optional(),
  name: z.string().trim().optional(),
  description: z.string().trim().min(1),
  prompt: z.string().trim().optional().nullable(),
  systemPrompt: z.string().trim().optional().nullable(),
  userPrompt: z.string().trim().optional().nullable(),
  modelName: z
    .nativeEnum(AgentModelName)
    .default(AgentModelName.gpt_3_5_turbo)
    .optional(),
  temperature: z.number().default(0.0),
  iconUrl: z.string().trim().optional().nullable(),
  promptType: z.nativeEnum(PromptType).default('customer_support'),
  visibility: z.nativeEnum(AgentVisibility).default('private'),
  interfaceConfig: AgentInterfaceConfig.optional().nullable(),
  includeSources: z.boolean().optional().nullable(),
  restrictKnowledge: z.boolean().optional().nullable(),
  useMarkdown: z.boolean().optional().nullable(),
  useLanguageDetection: z.boolean().optional().nullable(),
  tools: z.array(ToolSchema).optional(),
  // .max(1),
  handle: z
    .string()
    .trim()
    .max(15)
    .refine((val) => (!!val && val.length >= 4 ? true : false), {
      message: 'String must contain at least 4 character(s)',
    })
    .refine((val) => /^[a-zA-Z0-9_]+$/.test(val), {
      message: 'Must not contain special characters except for underscore _',
    })
    .refine((val) => !val.startsWith('_'), {
      message: 'Cannot start with _',
    })
    .refine((val) => !val.endsWith('_'), {
      message: 'Cannot end with _',
    })
    .transform((val) => val.toLowerCase())
    .optional()
    .nullable(),
});

export type CreateAgentSchema = z.infer<typeof CreateAgentSchema>;

export const UpdateAgentSchema = CreateAgentSchema.partial();
export type UpdateAgentSchema = z.infer<typeof UpdateAgentSchema>;

export const AcceptedDatasourceMimeTypes = [
  'text/csv',
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/json',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.presentation',
  // 'application/vnd.google-apps.spreadsheet',
] as const;

export const GenerateUploadLinkRequest = z.object({
  fileName: z.string(),
  type: z.enum(AcceptedDatasourceMimeTypes),
});

export type GenerateUploadLinkRequest = z.infer<
  typeof GenerateUploadLinkRequest
>;

export const EvalAnswer = z.object({
  messageId: z.string().cuid(),
  visitorId: z.string().optional(),
  eval: z.nativeEnum(MessageEval),
});

export const EvalSchema = z.union([z.literal('bad'), z.literal('good')]);
export type EvalSchema = z.infer<typeof EvalSchema>;

export type EvalAnswer = z.infer<typeof EvalAnswer>;

export type ConversationWithMessages = Conversation & {
  messages: Message[];
};

export const UpdateOrgSchema = z.object({
  name: z.string().trim().min(1).max(50),
  iconUrl: z.union([z.string().url().nullish(), z.literal('')]),
});

export type UpdateOrgSchema = z.infer<typeof UpdateOrgSchema>;

export const OrganizationInviteSchema = z.object({
  email: z.string().email(),
});
export type OrganizationInviteSchema = z.infer<typeof OrganizationInviteSchema>;

export const UpdateUserProfileSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(50),
  customPicture: z.union([z.string().url().nullish(), z.literal('')]),
  // iconUrl: z.union([
  //   z
  //     .string()
  //     .url()
  //     .nullish(),
  //   z.literal(''),
  // ]),
});

export type UpdateUserProfileSchema = z.infer<typeof UpdateUserProfileSchema>;

export const CrispSchema = z.object({
  website_id: z.string().min(1),
  session_id: z.string().min(1),
  token: z.string().min(1),
  locale: z.string().optional(),
});

export const CrispUpdateMetadataSchema = CrispSchema.extend({
  aiStatus: z.nativeEnum(AIStatus),
});

// TODO: move to -> createConversationSchema.partial()
export const ConversationUpdateSchema = z.object({
  status: z.nativeEnum(ConversationStatus).optional(),
  isAiEnabled: z.boolean().optional(),
  metadata: z.object({ isFormSubmitted: z.boolean() }).optional(),
});

export const YoutubeSummarySchema = z.object({
  url: z.string().refine(
    (url) => {
      return YOUTUBE_VIDEO_URL_RE.test(url);
    },
    {
      message: 'Invalid YouTube video URL',
    }
  ),
  date: z.string().optional(),
});

export const WebPageSummarySchema = z.object({
  url: z.string().url(),
  date: z.string().optional(),
});

export const ChatResponse = z.object({
  answer: z.string(),
  sources: z.array(Source).optional(),
  conversationId: z.string().cuid(),
  visitorId: z.string().optional(),
  messageId: z.string().cuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  usage: z
    .object({
      completionTokens: z.number(),
      promptTokens: z.number(),
      totalTokens: z.number(),
      cost: z.number(),
    })
    .optional(),
  approvals: z.array(
    z.object({
      tool: ToolSchema,
      payload: z.unknown(),
    })
  ),
});

export type ChatResponse = z.infer<typeof ChatResponse>;

export const ConversationMetadataCrisp = z.object({
  sessionId: z.string(),
});

export type ConversationMetadataCrisp = z.infer<
  typeof ConversationMetadataCrisp
>;
export const ConversationMetadataSlack = z.object({
  user_id: z.string(),
});

export type ConversationMetadataSlack = z.infer<
  typeof ConversationMetadataSlack
>;
export const FormFieldBaseSchema = z.object({
  id: z.string(),
  required: z.boolean().default(true),
  name: z.string().toLowerCase().trim().min(3),
});

export const FormFieldSchema = z.discriminatedUnion('type', [
  FormFieldBaseSchema.extend({
    type: z.literal('text'),
    placeholder: z.string().optional(),
  }),
  FormFieldBaseSchema.extend({
    type: z.literal('number'),
    placeholder: z.string().optional(),
    min: z.coerce.number().default(0).optional(),
    max: z.coerce.number().default(42).optional(),
  }),
  FormFieldBaseSchema.extend({
    type: z.literal('multiple_choice'),
    choices: z.array(z.string().min(1)).min(1),
  }),
  FormFieldBaseSchema.extend({
    type: z.literal('file'),
    fileUrl: z.string().optional(),
    placeholder: z.string().optional(),
  }),
  FormFieldBaseSchema.extend({
    type: z.literal('email'),
    placeholder: z.string().optional(),
    shouldCreateContact: z.boolean().default(true).optional(),
  }),
  FormFieldBaseSchema.extend({
    type: z.literal('phoneNumber'),
    placeholder: z.string().optional(),
    defaultCountryCode: z.string().optional(),
    shouldCreateContact: z.boolean().default(true).optional(),
  }),
  FormFieldBaseSchema.extend({
    type: z.literal('textArea'),
    placeholder: z.string().optional(),
  }),
  FormFieldBaseSchema.extend({
    type: z.literal('select'),
    options: z.array(z.string().min(1)).min(1),
    placeholder: z.string().optional(),
  }),
]);

export type FormFieldSchema = z.infer<typeof FormFieldSchema>;

// keep sync with FormFieldSchema.
export type TextField = Exclude<
  FormFieldSchema,
  { type: 'multiple_choice' } | { type: 'file' } | { type: 'select' }
>;

export const FormConfigSchema = z.object({
  overview: z.string().max(750).optional().nullable(),
  fields: z.array(FormFieldSchema).superRefine((vals, ctx) => {
    const unique = new Set();
    for (const [i, val] of vals.entries()) {
      if (unique.has(val?.name?.toLowerCase?.())) {
        ctx.addIssue({
          code: 'custom',
          message: 'Field names must be unique',
          path: [`${i}`, 'name'],
        });
      }
      unique.add(val?.name?.toLowerCase?.());
    }
  }),
  startScreen: z
    .object({
      title: z.string().max(50),
      description: z.string().max(250),
      cta: z
        .object({
          label: z.string(),
        })
        .optional(),
    })
    .optional(),
  endScreen: z
    .object({
      cta: z.object({
        label: z.string().max(50),
        url: z.union([z.string().url().nullish(), z.literal('')]),
        target: z.string().optional(),
      }),
      successMessage: z.string().optional(),
    })
    .optional(),
  webhook: z
    .object({
      url: z.union([z.string().url().nullish(), z.literal('')]),
    })
    .optional(),
  schema: z.any(),
});
export type FormConfigSchema = z.infer<typeof FormConfigSchema>;

export const CreateFormSchema = z.object({
  id: z.string().optional(),
  type: z.nativeEnum(FormType).optional(),
  name: z.string().optional(),
  datastoreId: z.string().optional().nullable(),
  draftConfig: FormConfigSchema,
  publishedConfig: FormConfigSchema.optional().nullable(),
});
export type CreateFormSchema = z.infer<typeof CreateFormSchema>;

export const UpdateFormSchema = CreateFormSchema.partial();
export type UpdateFormSchema = z.infer<typeof UpdateFormSchema>;

export const ToolResponseSchema = z.object({
  data: z.any(),
  messageId: z.string().cuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  approvalRequired: z.boolean().optional(),
  error: z.string().optional(),
});

export type ToolResponseSchema = z.infer<typeof ToolResponseSchema>;

export const UpdateStatusAllConversationsSchema = z.object({
  status: z.nativeEnum(ConversationStatus),
});
export type UpdateStatusAllConversationsSchema = z.infer<
  typeof UpdateStatusAllConversationsSchema
>;

export const AcceptedImageMimeTypesSchema = z.enum(AcceptedImageMimeTypes);
export type AcceptedImageMimeTypesSchema = z.infer<
  typeof AcceptedImageMimeTypesSchema
>;

export const AcceptedVideoMimeTypesSchema = z.enum(AcceptedVideoMimeTypes);

export const AcceptedAudioMimeTypesSchema = z.enum(AcceptedAudioMimeTypes);

export const AcceptedDocumentMimeTypesSchema = z.enum(
  AcceptedDocumentMimeTypes
);

export const GenerateUploadLinkRequestSchema = z.discriminatedUnion('case', [
  z.object({
    case: z.literal('agentIcon'),
    fileName: z.string(),
    mimeType: AcceptedImageMimeTypesSchema,
    agentId: z.string().cuid(),
  }),
  z.object({
    case: z.literal('organizationIcon'),
    fileName: z.string(),
    mimeType: AcceptedImageMimeTypesSchema,
  }),
  z.object({
    case: z.literal('userIcon'),
    fileName: z.string(),
    mimeType: AcceptedImageMimeTypesSchema,
  }),
  z.object({
    case: z.literal('chatUpload'),
    conversationId: z.string().cuid(),
    agentId: z.string().cuid().optional(),
    fileName: z.string(),
    mimeType: AcceptedDocumentMimeTypesSchema.or(AcceptedAudioMimeTypesSchema)
      .or(AcceptedVideoMimeTypesSchema)
      .or(AcceptedImageMimeTypesSchema),
  }),
  z.object({
    case: z.literal('formUpload'),
    formId: z.string().cuid(),
    conversationId: z.string().cuid().optional(),
    fileName: z.string(),
    mimeType: AcceptedDocumentMimeTypesSchema.or(AcceptedAudioMimeTypesSchema)
      .or(AcceptedVideoMimeTypesSchema)
      .or(AcceptedImageMimeTypesSchema),
  }),
]);

export type GenerateUploadLinkRequestSchema = z.infer<
  typeof GenerateUploadLinkRequestSchema
>;

export const GenerateManyUploadLinksSchema = z
  .array(GenerateUploadLinkRequestSchema)
  .min(1)
  .max(10);

export type GenerateManyUploadLinksSchema = z.infer<
  typeof GenerateManyUploadLinksSchema
>;

export const GenerateManyUploadLinksResponseSchema = z.array(
  z.object({
    signedUrl: z.string().url(),
    fileUrl: z.string().url(),
  })
);
export type GenerateManyUploadLinksResponseSchema = z.infer<
  typeof GenerateManyUploadLinksResponseSchema
>;

export const CreateMailInboxSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  alias: z.string().optional(),
});
export type CreateMailInboxSchema = z.infer<typeof CreateMailInboxSchema>;

export const EmailAliasSchema = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .transform((val) => val.toLocaleLowerCase())
  .refine(
    (val) => /^[a-z0-9]+(?:[-_.][a-z0-9]+)*$/.test(val),
    'Invalid email alias'
  );

export const UpdateMailInboxSchema = z.object({
  alias: EmailAliasSchema,
  customEmail: z.string().email().optional().nullable(),
  name: z.string().min(1).max(50).optional(),
  fromName: z.string().max(50).optional().nullable(),
  signature: z.string().optional().nullable(),
  showBranding: z.boolean().optional().nullable(),
});

export type UpdateMailInboxSchema = z.infer<typeof UpdateMailInboxSchema>;

export const CheckAliasAvailabilitySchema = z.object({
  alias: EmailAliasSchema,
});

export type CheckAliasAvailabilitySchema = z.infer<
  typeof CheckAliasAvailabilitySchema
>;

export const UpdateInboxConversationSchema = z.object({
  id: z.string().cuid().optional(),
  status: z.nativeEnum(ConversationStatus),
  priority: z.nativeEnum(ConversationPriority),
  assignees: z
    .array(z.string().cuid().optional().nullable())
    .transform((val) => val.filter((each) => !!each))
    .optional(),
  isAiEnabled: z.boolean().optional(),
});

export type UpdateInboxConversationSchema = z.infer<
  typeof UpdateInboxConversationSchema
>;

const AppEventBaseSchema = z.object({
  // organizationId: z.string().cuid(),
});

export const FormSubmitSchema = AppEventBaseSchema.extend({
  formId: z.string().cuid(),
  formValues: z.record(z.string(), z.unknown()),
  conversationId: z.string().cuid().optional(),
  messageId: z.string().cuid().optional(),
  submissionId: z.string().cuid().optional().nullable(),
});

export type FormSubmitSchema = z.infer<typeof FormSubmitSchema>;

export const AppEventSchema = z.discriminatedUnion('type', [
  AppEventBaseSchema.extend({
    type: z.literal('tool-approval-requested'),
    conversationId: z.string().cuid(),
    approvals: ChatResponse.shape.approvals,
    agentName: z.string(),
  }),
  AppEventBaseSchema.extend({
    type: z.literal('conversation-resolved'),
    agent: z.any(),
    conversation: z.any(),
    messages: z.array(z.any()),
    adminEmail: z.string(),
    customerEmail: z.string().optional(),
  }),
  AppEventBaseSchema.extend({
    type: z.literal('human-requested'),
    agent: z.any(),
    conversation: z.any(),
    messages: z.array(z.any()),
    adminEmail: z.string(),
    customerEmail: z.string().optional(),
  }),
  AppEventBaseSchema.extend({
    type: z.literal('lead-captured'),
    agent: z.any(),
    conversation: z.any(),
    messages: z.array(z.any()),
    adminEmail: z.string(),
    customerEmail: z.string().optional(),
  }),
]);
export type AppEventSchema = z.infer<typeof AppEventSchema>;

export const AppeEventHandlerSchema = z.object({
  event: AppEventSchema,
  token: z.string().min(1),
});

export type AppeEventHandlerSchema = z.infer<typeof AppeEventHandlerSchema>;

const WhatsAppActionSchema = z.object({
  buttons: z.array(
    z.object({
      type: z.literal('reply'),
      reply: z.object({ id: z.string(), title: z.string() }),
    })
  ),
});

const WhatsAppMediaSchema = z.object({
  link: z.string(),
});

const WhatsAppHeaderSchema = z
  .object({
    type: z.literal('image'),
    image: WhatsAppMediaSchema,
  })
  .or(
    z.object({
      type: z.literal('video'),
      video: WhatsAppMediaSchema,
    })
  )
  .or(
    z.object({
      type: z.literal('text'),
      text: z.string(),
    })
  );

const WhatsAppBodySchema = z.object({
  text: z.string(),
});

const WhatsAppTemplateSchema = z.object({
  name: z.string(),
  language: z.object({
    code: z.string(),
  }),
});

const interactiveSchema = z.object({
  type: z.literal('button'),
  header: WhatsAppHeaderSchema.optional(),
  body: WhatsAppBodySchema.optional(),
  action: WhatsAppActionSchema,
});

const WhatsAppSendMessageBaseSchema = z.object({
  // id: z.string(),
  // from: z.string(),
  // timestamp: z.string(),
});

export const WhatsAppSendMessageSchema = z.discriminatedUnion('type', [
  WhatsAppSendMessageBaseSchema.extend({
    type: z.literal('text'),
    text: z.object({
      body: z.string(),
      preview_url: z.boolean().optional(),
    }),
    preview_url: z.boolean().optional(),
  }),
  WhatsAppSendMessageBaseSchema.extend({
    type: z.literal('image'),
    image: WhatsAppMediaSchema,
  }),
  WhatsAppSendMessageBaseSchema.extend({
    type: z.literal('audio'),
    audio: WhatsAppMediaSchema,
  }),
  WhatsAppSendMessageBaseSchema.extend({
    type: z.literal('video'),
    video: WhatsAppMediaSchema,
  }),
  WhatsAppSendMessageBaseSchema.extend({
    type: z.literal('document'),
    document: WhatsAppMediaSchema,
  }),
  WhatsAppSendMessageBaseSchema.extend({
    type: z.literal('interactive'),
    interactive: interactiveSchema,
  }),
  WhatsAppSendMessageBaseSchema.extend({
    type: z.literal('template'),
    template: WhatsAppTemplateSchema,
  }),
]);

export type WhatsAppSendMessageSchema = z.infer<
  typeof WhatsAppSendMessageSchema
>;
export type WhatsAppSendMessageTextSchema = Extract<
  WhatsAppSendMessageSchema,
  { type: 'text' }
>;

export type WhatsAppSendMessageMediaSchema = Extract<
  WhatsAppSendMessageSchema,
  { type: 'image' | 'audio' | 'video' | 'document' }
>;

const WhatsAppReceivedMessageBaseSchema = z.object({
  from: z.string(),
  id: z.string(),
  timestamp: z.string(),
});

const WhatsAppReceivedMediaSchema = z.object({
  caption: z.string().optional(),
  mime_type: z.string(),
  sha256: z.string(),
  id: z.string(),
});

export const WhatsAppReceivedMessageSchema = z.discriminatedUnion('type', [
  WhatsAppReceivedMessageBaseSchema.extend({
    type: z.literal('text'),
    text: z.object({
      body: z.string(),
    }),
  }),
  WhatsAppReceivedMessageBaseSchema.extend({
    type: z.literal('image'),
    image: WhatsAppReceivedMediaSchema,
  }),
  WhatsAppReceivedMessageBaseSchema.extend({
    type: z.literal('audio'),
    audio: WhatsAppReceivedMediaSchema,
  }),
  WhatsAppReceivedMessageBaseSchema.extend({
    type: z.literal('video'),
    video: WhatsAppReceivedMediaSchema,
  }),
  WhatsAppReceivedMessageBaseSchema.extend({
    type: z.literal('document'),
    document: WhatsAppReceivedMediaSchema,
  }),
  WhatsAppReceivedMessageBaseSchema.extend({
    type: z.literal('interactive'),
    interactive: interactiveSchema,
  }),
  WhatsAppReceivedMessageBaseSchema.extend({
    type: z.literal('template'),
    template: WhatsAppTemplateSchema,
  }),
]);

export type WhatsAppReceivedMessageSchema = z.infer<
  typeof WhatsAppReceivedMessageSchema
>;

export type WhatsAppReceivedMessageTextSchema = Extract<
  WhatsAppReceivedMessageSchema,
  { type: 'text' }
>;

export type WhatsAppReceivedMessageMediaSchema = Extract<
  WhatsAppReceivedMessageSchema,
  { type: 'image' | 'audio' | 'video' | 'document' }
>;

export const LeadFormSchema = z.object({
  email: z.string().email(),
  phoneNumber: z.string().min(1),
});
export type LeadFormSchema = z.infer<typeof LeadFormSchema>;
