// import type { LoadingButtonProps } from '@mui/lab/LoadingButton';
import type { AppDatasource as Datasource } from '@prisma/client';

import type { UpsertDatasourceSchema } from './Base';

export type DatasourceFormProps = {
  defaultValues?: UpsertDatasourceSchema;
  customSubmitButton?: any;
  submitButtonText?: string;
  submitButtonProps?: any;
  onSubmitSuccess?: (datasource: Partial<Datasource>) => any;
};
