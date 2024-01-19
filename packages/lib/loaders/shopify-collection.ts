import axios from 'axios';
import cuid from 'cuid';

import { DatasourceExtended } from '@chaindesk/lib/task-load-datasource';
import { AppDocument } from '@chaindesk/lib/types/document';
import { DatasourceStatus, DatasourceType } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

import triggerTaskLoadDatasource from '../trigger-task-load-datasource';
import { DatasourceShopifyCollection } from '../types/models';

import { DatasourceLoaderBase } from './base';

interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string | null;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string;
  template_suffix: string | null;
  published_scope: string;
  tags: string;
  status: string;
  admin_graphql_api_id: string;
  options: Array<{
    id: number;
    product_id: number;
    name: string;
    position: number;
  }>;
}

export class ShopifyCollectionLoader extends DatasourceLoaderBase<DatasourceShopifyCollection> {
  isGroup = true;
  private collectionId: number;
  private shop: string;

  constructor(datasource: DatasourceExtended<DatasourceShopifyCollection>) {
    super(datasource);

    this.collectionId = this.datasource?.config?.collectionId;
    this.shop = this.datasource?.config?.shop;
  }

  async getSize(text: string) {
    return 0;
  }

  async load() {
    try {
      const response = await axios.get(
        `${process.env.SHOPIFY_HOST_URL}/api/integrations/shopify/collection?collectionId=${this.collectionId}&shop=${this.shop}`
      );

      const products = response.data.products as ShopifyProduct[];

      await prisma.$transaction(async (tx) => {
        let ids: string[] = [];

        ids = products.map(() => cuid());

        await tx.appDatasource.createMany({
          data: products.map((product, index) => ({
            id: ids[index],
            type: DatasourceType.shopify_product,
            name: product.title,
            config: {
              productId: product.id,
              title: product.title,
              description: product.body_html,
              tags: product?.tags?.split(',') || [],
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
          products.map((_, index) => ({
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
