import { AppDatasource as Datasource, Prisma } from '@chaindesk/prisma';

import { AppDocument } from '../types/document';
import { DatasourceSchema } from '../types/models';

const datasourceExtended = Prisma.validator<Prisma.AppDatasourceArgs>()({
  include: {
    datastore: true,
    serviceProvider: true,
    organization: {
      include: {
        usage: true,
        subscriptions: {
          where: {
            status: {
              in: ['active', 'trialing'],
            },
          },
        },
      },
    },
  },
});

type DatasourceExtended<T extends {} = DatasourceSchema> =
  Prisma.AppDatasourceGetPayload<typeof datasourceExtended> & T;

export abstract class DatasourceLoaderBase<T extends {} = DatasourceSchema> {
  isGroup?: boolean;
  datasource: DatasourceExtended<T>;

  constructor(datasource: DatasourceExtended<T>) {
    this.datasource = datasource;
  }

  async importLoaders() {
    return await import('langchain/document_loaders/base');
  }

  abstract getSize(param?: any): Promise<number>;
  abstract load(file?: any): Promise<AppDocument[] | undefined>;
}
