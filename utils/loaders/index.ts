import { AppDatasource as Datasource, DatasourceType } from '@prisma/client';

import { DatasourceLoaderBase } from './base';
import { TextLoader } from './text';
import { WebPageLoader } from './web-page';

export class DatasourceLoader {
  datasource: Datasource;
  manager: DatasourceLoaderBase;

  loadersMap = {
    [DatasourceType.web_page]: WebPageLoader,
    [DatasourceType.text]: TextLoader,
    // [DatasourceType.pdf]: PdfLoader,
  };

  constructor(datasource: Datasource) {
    this.datasource = datasource;
    this.manager = new this.loadersMap[this.datasource.type](this.datasource);
  }

  load(file?: any) {
    return this.manager.load(file);
  }
}
