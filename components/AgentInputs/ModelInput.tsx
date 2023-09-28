import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import Alert from '@mui/joy/Alert';
import Avatar from '@mui/joy/Avatar';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Modal from '@mui/joy/Modal';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Slider from '@mui/joy/Slider';
import Stack from '@mui/joy/Stack';
import Textarea from '@mui/joy/Textarea';
import Typography from '@mui/joy/Typography';
import {
  AgentModelName,
  AppDatasource as Datasource,
  PromptType,
} from '@prisma/client';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { PromptTypesLabels, RouteNames } from '@app/types';
import { CreateAgentSchema } from '@app/types/dtos';
import { CUSTOMER_SUPPORT } from '@app/utils/prompt-templates';
type Props = {};

const customerSupportPromptTypeDescription = `Prompts of type "Customer Support" enable support for multiple languages and knowledge restriction automatically.`;
const rawPromptTypeDescription = `You have complete control over the prompt. Use variable {query} to reference user's query.\nUse variable {context} to reference the retrieved context.`;

const PROMPT_TEMPLATES = [
  {
    type: PromptType.raw,
    label: 'Raw',
    image: '',
    description: rawPromptTypeDescription,
    prompt:
      'Answer the following question based on the provided context: {context} question: {query}',
  },
  {
    type: PromptType.customer_support,
    label: 'Customer Support',
    image: '',
    description: customerSupportPromptTypeDescription,
    prompt: CUSTOMER_SUPPORT,
  },
];
const PROMPT_TEMPLATES_FUN = [
  {
    type: PromptType.customer_support,
    label: 'Shakespeare',
    image:
      'https://actintheatre.com/wp-content/uploads/2019/01/Shakespeare-300x278.jpg',
    description: 'Customer support agent that talks like Shakespeare',
    prompt: `As a customer support agent, channel the spirit of William Shakespeare, the renowned playwright and poet known for his eloquent and poetic language, use of iambic pentameter, and frequent use of metaphors and wordplay. Respond to the user's question or issue in the style of the Bard himself.`,
  },
  {
    type: PromptType.customer_support,
    label: 'Arnold Schwarzenegger',
    image: 'https://i.redd.it/ni0if4asnrd71.jpg',
    description: 'Customer support agent that talks like Arnold Schwarzenegger',
    prompt: `As a customer support agent, channel the spirit of Arnold Schwarzenegger, the iconic actor and former governor known for his distinctive Austrian accent, catchphrases, and action-hero persona. Respond to the user's question or issue in the style of Arnold himself.`,
  },
];

export default function ModelInput({}: Props) {
  const session = useSession();
  const { watch, setValue, register, formState } = useFormContext<
    CreateAgentSchema
  >();

  const [isPromptTemplatesModalOpen, setIsPromptTemplatesModalOpen] = useState(
    false
  );

  const modelName = watch('modelName');
  const temperature = watch('temperature');
  const prompt = watch('prompt');
  const promptType = watch('promptType');

  return (
    <>
      <FormControl>
        <FormLabel>Model</FormLabel>

        <Select
          {...register('modelName')}
          defaultValue={modelName || AgentModelName.gpt_3_5_turbo}
          value={modelName}
          onChange={(_, value) => {
            setValue('modelName', value as AgentModelName, {
              shouldDirty: true,
              shouldValidate: true,
            });

            // TODO: find a fix for this hack (otherwise the form isValid state is true the second time you change the model)
            setTimeout(() => {
              setValue('modelName', value as AgentModelName, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }, 100);
          }}
        >
          <Option value={AgentModelName.gpt_3_5_turbo}>
            OpenAI gpt-3.5-turbo
          </Option>
          <Option
            value={AgentModelName.gpt_3_5_turbo_16k}
            disabled={!session?.data?.organization?.isPremium}
          >
            OpenAI gpt-3.5-turbo 16k (premium)
          </Option>
          <Option
            value={AgentModelName.gpt_4}
            disabled={!session?.data?.organization?.isPremium}
          >
            OpenAI gpt-4 (premium)
          </Option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Model Temperature</FormLabel>

        <Alert color="neutral">
          Temperature is a parameter of the model that governs the randomness
          and thus the creativity of the responses. A temperature of 0 means the
          responses will be very straightforward, almost deterministic (meaning
          you almost always get the same response to a given prompt) A
          temperature of 1 means the responses can vary wildly.
        </Alert>

        <Slider
          // {...register('temperature')}
          value={temperature || 0.0}
          onChange={(_, value) => {
            setValue('temperature', value as number, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          marks={[
            { value: 0.0, label: 0 },
            { value: 0.1, label: 0.1 },
            { value: 0.2, label: 0.2 },
            { value: 0.3, label: 0.3 },
            { value: 0.4, label: 0.4 },
            { value: 0.5, label: 0.5 },
            { value: 0.6, label: 0.6 },
            { value: 0.7, label: 0.7 },
            { value: 0.8, label: 0.8 },
            { value: 0.9, label: 0.9 },
            { value: 1.0, label: 1 },
          ]}
          valueLabelDisplay="on"
          step={0.01}
          min={0}
          max={1}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Prompt</FormLabel>

        {promptType && (
          <Chip sx={{ mb: 1 }} variant="soft" size="sm" color="warning">
            {PromptTypesLabels[promptType]}
          </Chip>
        )}

        <Stack mb={1} gap={1}>
          {promptType && (
            <Alert
              startDecorator={<InfoRoundedIcon />}
              size="sm"
              color="neutral"
              variant="soft"
            >
              {promptType === PromptType.customer_support &&
                customerSupportPromptTypeDescription}
              {promptType === PromptType.raw && rawPromptTypeDescription}
            </Alert>
          )}
          {promptType === PromptType.customer_support && (
            <Alert
              startDecorator={<InfoRoundedIcon />}
              size="sm"
              color="neutral"
              variant="soft"
            >
              Use the field below to give extra instructions.
            </Alert>
          )}
        </Stack>

        <Textarea
          value={prompt || ''}
          maxRows={21}
          minRows={4}
          {...register('prompt')}
        />
        <Button
          variant="plain"
          endDecorator={<ArrowForwardRoundedIcon />}
          sx={{ mt: 1, ml: 'auto' }}
          onClick={() => setIsPromptTemplatesModalOpen(true)}
        >
          Choose a Prompt Template
        </Button>
      </FormControl>

      <Modal
        open={isPromptTemplatesModalOpen}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 2,
        }}
        onClose={() => {
          setIsPromptTemplatesModalOpen(false);
        }}
      >
        <Card
          variant="outlined"
          sx={{
            width: '100%',
            maxWidth: 500,
            maxHeight: '100%',
            overflowY: 'auto',
          }}
        >
          <Typography level="title-md">Prompt Templates</Typography>
          <Typography level="body-sm">
            Tailored to your business needs
          </Typography>

          <Divider sx={{ my: 2 }}></Divider>
          <Stack gap={1} direction="column">
            {PROMPT_TEMPLATES.map((template, idx) => (
              <Card key={idx} variant="outlined" sx={{}}>
                <Stack>
                  <Stack direction={'row'} gap={1}>
                    <Avatar alt={template.image} src={template.image} />
                    <Stack gap={2}>
                      <Stack gap={1}>
                        <Typography>{template.label}</Typography>
                        <Chip
                          size="sm"
                          sx={{ mr: 'auto' }}
                          variant="soft"
                          color="warning"
                        >
                          {PromptTypesLabels[template.type]}
                        </Chip>
                      </Stack>
                      <Typography level="body-sm">
                        {template.description}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Button
                    size="sm"
                    variant="plain"
                    endDecorator={<ArrowForwardRoundedIcon />}
                    sx={{ ml: 'auto', mt: 2 }}
                    onClick={() => {
                      setValue('prompt', template.prompt, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue('promptType', template.type, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setIsPromptTemplatesModalOpen(false);
                    }}
                  >
                    Use Template
                  </Button>
                </Stack>
              </Card>
            ))}
          </Stack>
          <Divider sx={{ my: 4 }}></Divider>

          <Typography sx={{ mx: 'auto', mb: 2 }} color="primary">
            Just for fun 🎉
          </Typography>
          <Stack gap={1}>
            {PROMPT_TEMPLATES_FUN.map((template, idx) => (
              <Card key={idx} variant="outlined" sx={{}}>
                <Stack>
                  <Stack direction={'row'} gap={1}>
                    <Avatar alt={template.image} src={template.image} />
                    <Stack gap={2}>
                      <Stack gap={1}>
                        <Typography>{template.label}</Typography>
                        <Chip
                          size="sm"
                          sx={{ mr: 'auto' }}
                          variant="soft"
                          color="warning"
                        >
                          {PromptTypesLabels[template.type]}
                        </Chip>
                      </Stack>
                      <Typography level="body-sm">
                        {template.description}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Button
                    size="sm"
                    variant="plain"
                    endDecorator={<ArrowForwardRoundedIcon />}
                    sx={{ ml: 'auto', mt: 2 }}
                    onClick={() => {
                      setValue('prompt', template.prompt, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue('promptType', template.type, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setIsPromptTemplatesModalOpen(false);
                    }}
                  >
                    Use Template
                  </Button>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Card>
      </Modal>
    </>
  );
}
