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
    // Files are converted to text in the browser.
    // Just adding this type for typescript to be happy as there is a field 'file' in the DatasourceType enum
    [DatasourceType.file]: TextLoader,
  };

  constructor(datasource: Datasource) {
    this.datasource = datasource;
    this.manager = new this.loadersMap[this.datasource.type](this.datasource);
  }

  load(file?: any) {
    return this.manager.load(file);
  }

  getSize(param?: any) {
    return this.manager.getSize(param);
  }
}
