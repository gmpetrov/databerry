// import type { LoadingButtonProps } from '@mui/lab/LoadingButton';
import type { DatasourceSchema } from '@chaindesk/lib/types/models';
import type { AppDatasource as Datasource } from '@chaindesk/prisma';

export type DatasourceFormProps<T extends {} = DatasourceSchema> = {
  defaultValues?: T;
  customSubmitButton?: any;
  submitButtonText?: string;
  submitButtonProps?: any;
  onSubmitSuccess?: (datasource: Partial<Datasource>) => any;
};
