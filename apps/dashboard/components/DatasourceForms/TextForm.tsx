import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Textarea from '@mui/joy/Textarea';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';

import { DatasourceSchema } from '@chaindesk/lib/types/models';
import { DatasourceType } from '@chaindesk/prisma';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type DatasourceText = Extract<DatasourceSchema, { type: 'text' }>;

type Props = DatasourceFormProps<DatasourceText> & {};

function Nested() {
  const { control, register } = useFormContext<DatasourceText>();

  return (
    <>
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
      schema={DatasourceSchema}
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
