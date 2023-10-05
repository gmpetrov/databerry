// import type { LoadingButtonProps } from '@mui/lab/LoadingButton';
import type { CreateDatastoreRequestSchema } from '@chaindesk/lib/types/dtos';
import type { Datastore } from '@chaindesk/prisma';

export type DatastoreFormProps = {
  defaultValues?: CreateDatastoreRequestSchema;
  customSubmitButton?: any;
  submitButtonText?: string;
  submitButtonProps?: any;
  onSubmitSuccess?: (datastore: Partial<Datastore>) => any;
};
