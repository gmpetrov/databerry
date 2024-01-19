import axios from 'axios';
import cuid from 'cuid';
import pMap from 'p-map';

import { DatasourceExtended } from '@chaindesk/lib/task-load-datasource';
import { AppDocument } from '@chaindesk/lib/types/document';
import { DatasourceStatus, DatasourceType } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

import triggerTaskLoadDatasource from '../trigger-task-load-datasource';
import { DatasourceShopify } from '../types/models';

import { DatasourceLoaderBase } from './base';

export class ShopifyLoader extends DatasourceLoaderBase<DatasourceShopify> {
  isGroup = true;
  private collections: { id: number; name: string }[];
  private shop: string;

  constructor(datasource: DatasourceExtended<DatasourceShopify>) {
    super(datasource);

    this.collections = this.datasource?.config?.collections;
    this.shop = this.datasource?.config?.shop;
  }

  async getSize(text: string) {
    return 0;
  }

  async load() {
    try {
      const existingDatasources = await prisma.appDatasource.findMany({
        where: {
          groupId: this.datasource.id,
        },
        select: {
          id: true,
          config: true,
        },
      });

      await prisma.$transaction(async (tx) => {
        let ids = this.collections.map(() => cuid());

        await tx.appDatasource.createMany({
          data: this.collections.map((collection, index) => ({
            id: ids[index],
            type: DatasourceType.shopify_collection,
            name: collection.name,
            config: {
              shop: this.shop,
              collectionId: collection.id,
            },
            organizationId: this.datasource?.organizationId!,
            datastoreId: this.datasource?.datastoreId,
            groupId: this.datasource?.id,
            serviceProviderId: this.datasource?.serviceProviderId,
          })),
          skipDuplicates: true,
        });

        await tx.appDatasource.update({
          where: {
            id: this.datasource.id,
          },
          data: {
            status: DatasourceStatus.synched,
          },
        });

        await triggerTaskLoadDatasource(
          this.collections.map((_, index) => ({
            organizationId: this.datasource?.organizationId!,
            datasourceId: ids[index],
            priority: 10,
          }))
        );
      });

      return [] as AppDocument[];
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
