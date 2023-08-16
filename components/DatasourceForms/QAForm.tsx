import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { FormHelperText } from '@mui/joy';
import Alert from '@mui/joy/Alert';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Textarea from '@mui/joy/Textarea';
import { DatasourceType } from '@prisma/client';
// import countTokens from '@app/utils/count-tokens';
import { encodingForModel, getEncoding } from 'js-tiktoken';
import React, { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';
import { UpsertDatasourceSchema } from '@app/types/models';
import config from '@app/utils/config';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps & {};

const enc = getEncoding('cl100k_base');
const countTokens = (text?: string) => {
  return enc?.encode(text || '').length;
};

const QAConfig = z.object({
  question: z.string().min(1).trim(),
  answer: z.string().min(1).trim(),
  source_url: z.union([z.string().url().nullish(), z.literal('')]),
  nbTokens: z.number().optional(),
});

export type QAConfig = z.infer<typeof QAConfig>;

export const QASourceSchema = UpsertDatasourceSchema.extend({
  config: QAConfig.refine(
    (v) => {
      const count = countTokens(v.question) + countTokens(v.answer);
      return count <= config.defaultDatasourceChunkSize;
    },
    {
      message: `Tokens count must be less or equal to ${config.defaultDatasourceChunkSize}`,
      path: ['nbTokens'],
    }
  ).optional(),
});

function Nested() {
  const { control, register, watch, trigger, formState, setValue } =
    useFormContext<z.infer<typeof QASourceSchema>>();

  const question = watch('config.question');
  const answer = watch('config.answer');

  const count = useMemo(() => {
    return countTokens(question) + countTokens(answer);
  }, [question, answer]);

  const errors = formState.errors;

  useEffect(() => {
    if (formState.isDirty) {
      trigger();
    }
  }, [count, formState.isDirty]);

  useEffect(() => {
    let name = question?.trim();
    if (name?.length > 25) {
      name = `${(question || '').slice(0, 25)}...`;
    }
    setValue('name', name);
  }, [question]);

  return (
    <>
      <Alert startDecorator={<InfoRoundedIcon />}>
        The Q&A datasource can help Agents to answer explicit questions
      </Alert>

      <Input
        label="Source URL (optional)"
        control={control as any}
        placeholder="https://news.ycombinator.com"
        {...register('config.source_url')}
      />

      <FormControl
        error={
          !!errors?.config?.nbTokens?.message ||
          !!errors?.config?.question?.message
        }
      >
        <FormLabel>Question</FormLabel>
        <Textarea maxRows={12} minRows={2} {...register('config.question')} />

        {errors?.config?.question?.message && (
          <FormHelperText>{errors?.config?.question?.message}</FormHelperText>
        )}
      </FormControl>

      <FormControl
        error={
          !!errors?.config?.nbTokens?.message ||
          !!errors?.config?.answer?.message
        }
      >
        <FormLabel>Answer</FormLabel>
        <Textarea maxRows={21} minRows={4} {...register('config.answer')} />
        {errors?.config?.answer?.message && (
          <FormHelperText>{errors?.config?.answer?.message}</FormHelperText>
        )}
      </FormControl>

      <FormControl error={!!errors?.config?.nbTokens?.message}>
        <FormLabel>
          Tokens: {count}/{config.defaultDatasourceChunkSize}{' '}
        </FormLabel>
        {!!errors?.config?.nbTokens?.message && (
          <FormHelperText>{errors?.config?.nbTokens?.message}</FormHelperText>
        )}
      </FormControl>
    </>
  );
}

export default function QAForm(props: Props) {
  const { defaultValues, ...rest } = props;

  return (
    <Base
      schema={QASourceSchema}
      mode="onChange"
      {...rest}
      hideName
      hideText
      defaultValues={{
        ...props.defaultValues!,
        type: DatasourceType.qa,
      }}
    >
      <Nested />
    </Base>
  );
}
