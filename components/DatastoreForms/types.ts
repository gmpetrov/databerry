// import type { LoadingButtonProps } from '@mui/lab/LoadingButton';
import type { Datastore } from '@prisma/client';

import type { CreateDatastoreRequestSchema } from '@app/types/dtos';

export type DatastoreFormProps = {
  defaultValues?: CreateDatastoreRequestSchema;
  customSubmitButton?: any;
  submitButtonText?: string;
  submitButtonProps?: any;
  onSubmitSuccess?: (datastore: Partial<Datastore>) => any;
};
