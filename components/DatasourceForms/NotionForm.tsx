import { DatasourceType } from '@prisma/client';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';
import { UpsertDatasourceSchema } from '@app/types/models';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps & {};

export const NotionSourceSchema = UpsertDatasourceSchema.extend({
    config: z.object({
        source: z.string().trim().url(),
      }),
});

function Nested() {
  const { control, register } =
    useFormContext<z.infer<typeof NotionSourceSchema>>();

  return (
    <>
      <Input
        label="Source (optional)"
        control={control as any}
        placeholder="https://news.ycombinator.com"
        {...register('config.source')}
      />
    </>
  );
}

export default function NotionForm(props: Props) {
  const { defaultValues, ...rest } = props;

  return (
    <Base
      schema={NotionSourceSchema}
      {...rest}
      defaultValues={{
        ...props.defaultValues!,
        type: DatasourceType.notion,
      }}
    >
      {!defaultValues?.id && <Nested />}
    </Base>
  );
}
