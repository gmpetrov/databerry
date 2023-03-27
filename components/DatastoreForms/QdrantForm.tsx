import { DatastoreType, Prisma } from '@prisma/client';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import Base, { UpsertDatastoreSchema } from './Base';
import { DatastoreFormProps } from './types';

type Props = DatastoreFormProps & {};

export const QdrantSchema = UpsertDatastoreSchema.extend({
  config: z.object({}).optional(),
});

function Nested() {
  const { control, register } = useFormContext<z.infer<typeof QdrantSchema>>();

  return null;
}

export default function QdrantForm(props: Props) {
  const { defaultValues, ...rest } = props;

  return (
    <Base
      schema={QdrantSchema}
      {...rest}
      defaultValues={{
        ...props.defaultValues!,
        type: DatastoreType.qdrant,
      }}
    >
      <Nested />
    </Base>
  );
}
