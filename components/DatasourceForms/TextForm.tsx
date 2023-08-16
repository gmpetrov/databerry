import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Textarea from '@mui/joy/Textarea';
import { DatasourceType } from '@prisma/client';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';
import { UpsertDatasourceSchema } from '@app/types/models';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps & {};

export const TextSourceSchema = UpsertDatasourceSchema.extend({
  config: z
    .object({
      source_url: z.string().trim().optional(),
    })
    .optional(),
});

function Nested() {
  const { control, register } =
    useFormContext<z.infer<typeof TextSourceSchema>>();

  return (
    <>
      <Input
        label="Source URL (optional)"
        control={control as any}
        placeholder="https://news.ycombinator.com"
        {...register('config.source_url')}
      />

      <FormControl>
        <FormLabel>Text</FormLabel>
        <Textarea maxRows={21} minRows={4} {...register('datasourceText')} />
      </FormControl>
    </>
  );
}

export default function TextForm(props: Props) {
  const { defaultValues, ...rest } = props;

  return (
    <Base
      schema={TextSourceSchema}
      {...rest}
      defaultValues={{
        ...props.defaultValues!,
        type: DatasourceType.text,
      }}
    >
      {!defaultValues?.id && <Nested />}
    </Base>
  );
}
