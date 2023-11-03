import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';

import { DatasourceSchema } from '@chaindesk/lib/types/models';
import { DatasourceType } from '@chaindesk/prisma';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type DatasourceWebpage = Extract<DatasourceSchema, { type: 'web_page' }>;

type Props = DatasourceFormProps<DatasourceWebpage> & {};

function Nested() {
  const { control, register } = useFormContext<DatasourceWebpage>();

  return (
    <Input
      label="Web Page URL"
      helperText="e.g.: https://en.wikipedia.org/wiki/Nuclear_fusion"
      control={control as any}
      {...register('config.source_url')}
    />
  );
}

export default function WebPageForm(props: Props) {
  const { defaultValues, ...rest } = props;

  return (
    <Base
      schema={DatasourceSchema}
      {...rest}
      defaultValues={{
        ...props.defaultValues!,
        type: DatasourceType.web_page,
      }}
    >
      <Nested />
    </Base>
  );
}
