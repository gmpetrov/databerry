import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';

import { WebPageSourceSchema } from '@chaindesk/lib/types/models';
import { DatasourceType } from '@chaindesk/prisma';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps & {};

function Nested() {
  const { control, register } =
    useFormContext<z.infer<typeof WebPageSourceSchema>>();

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
      schema={WebPageSourceSchema}
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
