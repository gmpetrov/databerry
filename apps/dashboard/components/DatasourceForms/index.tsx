import dynamic from 'next/dynamic';
import React, { ReactNode } from 'react';

import { DatasourceType } from '@chaindesk/prisma';

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

const NotionForm = dynamic(() => import('./NotionForm'), {
  ssr: false,
});

const YoutubeForm = dynamic(() => import('./YoutubeForm'), {
  ssr: false,
});

const ShopifyForm = dynamic(() => import('./ShopifyForm'), {
  ssr: false,
});

const ShopifyProductForm = dynamic(() => import('./ShopifyProductForm'), {
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
  [DatasourceType.notion]: NotionForm,
  [DatasourceType.notion_page]: NotionForm,
  [DatasourceType.youtube_video]: YoutubeForm,
  [DatasourceType.youtube_bulk]: YoutubeForm,
  [DatasourceType.shopify]: ShopifyForm,
  [DatasourceType.shopify_product]: ShopifyProductForm,
} as Record<DatasourceType, any>;

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
