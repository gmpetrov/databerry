// import type { LoadingButtonProps } from '@mui/lab/LoadingButton';
import type { UpsertDatasourceSchema } from '@chaindesk/lib/types/models';
import type { AppDatasource as Datasource } from '@chaindesk/prisma';

export type DatasourceFormProps = {
  defaultValues?: UpsertDatasourceSchema;
  customSubmitButton?: any;
  submitButtonText?: string;
  submitButtonProps?: any;
  onSubmitSuccess?: (datasource: Partial<Datasource>) => any;
};
