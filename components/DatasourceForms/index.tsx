import { DatasourceType } from '@prisma/client';
import dynamic from 'next/dynamic';
import React from 'react';

const TextForm = dynamic(() => import('./TextForm'), {
  ssr: false,
});

const WebPageForm = dynamic(() => import('./WebPageForm'), {
  ssr: false,
});

const WebSiteForm = dynamic(() => import('./WebSiteForm'), {
  ssr: false,
});

const FileForm = dynamic(() => import('./FileForm'), {
  ssr: false,
});

const GoogleDriveForm = dynamic(() => import('./GoogleDriveForm'), {
  ssr: false,
});

const QAForm = dynamic(() => import('./QAForm'), {
  ssr: false,
});

const DatasourceFormsMap = {
  [DatasourceType.web_page]: WebPageForm,
  [DatasourceType.text]: TextForm,
  [DatasourceType.file]: FileForm,
  [DatasourceType.web_site]: WebSiteForm,
  [DatasourceType.google_drive_file]: GoogleDriveForm,
  [DatasourceType.google_drive_folder]: GoogleDriveForm,
  [DatasourceType.qa]: QAForm,
  [DatasourceType.notion]: undefined as any,
};

type Props = {
  type: DatasourceType;
  onSubmitSuccess?: any;
  defaultValues?: any;
  submitButtonText?: string;
  submitButtonProps?: any;
  customSubmitButton?: any;
};

export default function DatasourceForm(props: Props) {
  return React.createElement(DatasourceFormsMap?.[props.type], {
    onSubmitSuccess: props.onSubmitSuccess,
    defaultValues: props.defaultValues,
    submitButtonText: props.submitButtonText,
    submitButtonProps: props.submitButtonProps,
    customSubmitButton: props.customSubmitButton,
  });
}
