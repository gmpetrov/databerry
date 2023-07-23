import { AppDatasource as Datasource, Prisma } from '@prisma/client';

import { AppDocument } from '@app/types/document';

const datasourceExtended = Prisma.validator<Prisma.AppDatasourceArgs>()({
  include: {
    datastore: true,
    serviceProvider: true,
    owner: {
      include: {
        usage: true,
        subscriptions: {
          where: {
            status: 'active',
          },
        },
      },
    },
  },
});

type DatasourceExtended = Prisma.AppDatasourceGetPayload<
  typeof datasourceExtended
>;

export abstract class DatasourceLoaderBase {
  isGroup?: boolean;
  datasource: DatasourceExtended;

  constructor(datasource: DatasourceExtended) {
    this.datasource = datasource;
  }

  async importLoaders() {
    return await import('langchain/document_loaders');
  }

  abstract getSize(param?: any): Promise<number>;
  abstract load(file?: any): Promise<AppDocument[] | undefined>;
}
