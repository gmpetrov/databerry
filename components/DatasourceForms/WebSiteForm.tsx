import { DatasourceType } from '@prisma/client';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';
import { UpsertDatasourceSchema } from '@app/types/models';
import findDomainPages from '@app/utils/find-domain-pages';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps & {};

export const WebSiteSourceSchema = UpsertDatasourceSchema.extend({
  config: z.object({
    source: z.string().trim().url(),
  }),
});

function Nested() {
  const { control, register } =
    useFormContext<z.infer<typeof WebSiteSourceSchema>>();

  return (
    <>
      <Input
        label="Web Site URL"
        helperText="e.g.: https://example.com/"
        control={control as any}
        {...register('config.source')}
      />
    </>
  );
}

export default function WebSiteForm(props: Props) {
  const { defaultValues, ...rest } = props;

  return (
    <Base
      schema={WebSiteSourceSchema}
      {...rest}
      defaultValues={{
        ...props.defaultValues!,
        type: DatasourceType.web_site,
      }}
    >
      <Nested />
    </Base>
  );
}
