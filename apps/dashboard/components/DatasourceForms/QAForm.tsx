import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { FormHelperText } from '@mui/joy';
import Alert from '@mui/joy/Alert';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Textarea from '@mui/joy/Textarea';
// import countTokens from '@chaindesk/lib/count-tokens';
import { encodingForModel, getEncoding } from 'js-tiktoken';
import React, { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';

import config from '@chaindesk/lib/config';
import {
  DatasourceBaseSchema,
  DatasourceQA,
} from '@chaindesk/lib/types/models';
import { QAConfig } from '@chaindesk/lib/types/models';
import { DatasourceType } from '@chaindesk/prisma';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps<DatasourceQA> & {};

const enc = getEncoding('cl100k_base');
const countTokens = (text?: string) => {
  return enc?.encode(text || '').length;
};

export const QASourceSchema = DatasourceBaseSchema.extend({
  type: z.literal(DatasourceType.qa),
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
    useFormContext<DatasourceQA>();

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
        placeholder="https://en.wikipedia.org/wiki/Nuclear_fusion"
        helperText='The URL to use for the "sources" section of an Agent answer'
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
