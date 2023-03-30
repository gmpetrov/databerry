import { AppDatasource as Datasource } from '@prisma/client';

import { Document } from '@app/utils/datastores/base';

export abstract class DatasourceLoaderBase {
  datasource: Datasource;

  constructor(datasource: Datasource) {
    this.datasource = datasource;
  }

  async importLoaders() {
    return await import('langchain/document_loaders');
  }

  abstract getSize(param?: any): Promise<number>;
  abstract load(file?: any): Promise<Document>;
}
