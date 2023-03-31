import { DatasourceType } from '@prisma/client';

import FileForm from './FileForm';
import TextForm from './TextForm';
import WebPageForm from './WebPageForm';

export const DatasourceFormsMap = {
  [DatasourceType.web_page]: WebPageForm,
  [DatasourceType.text]: TextForm,
  [DatasourceType.file]: FileForm,
};
