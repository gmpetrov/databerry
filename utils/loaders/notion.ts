import { DatasourceStatus, DatasourceType } from '@prisma/client';
import axios, { AxiosHeaders, AxiosRequestConfig } from 'axios';
import { z } from 'zod';

import { NotionSourceSchema } from '@app/components/DatasourceForms/NotionForm';
import type { Document } from '@app/utils/datastores/base';
import prisma from '@app/utils/prisma-client';

import cuid from '../cuid';
import triggerTaskLoadDatasource from '../trigger-task-load-datasource';

import { DatasourceExtended, DatasourceLoaderBase } from './base';
const pageIds: Array<string> = []

const getNotionBasePages = async(datasource: DatasourceExtended) => {
    let key = (
        datasource.config as z.infer<typeof NotionSourceSchema>['config']
      )['integrationKey']
    if(key === 'internal'){
        key = process.env.NOTION_API_KEY as string
    }
    const notionHeader = {
        headers:{
            'Authorization': `Bearer ${key}`,
            'Notion-Version': process.env.NOTION_VERSION
        }
    }

    const searchUrl = `${process.env.NOTION_BASE_URL}/search/`
    const basePages: Array<any> = (await axios.post(
        searchUrl,{},notionHeader)
    ).data.results
    const filteredBasePages = basePages.filter(val => (val.parent.type === 'workspace') && val.object === 'page')
    filteredBasePages.map(async (page) => {
        const ids = cuid()
        pageIds.push(ids)
        await prisma.appDatasource.create({
            data: {
                id: ids,
                name: page.properties.title.title[0].plain_text,
                type: DatasourceType.notion_page,
                config: {
                    integrationKey: key,
                    pageId: page.id
                },
                ownerId: datasource.ownerId,
                datastoreId: datasource.datastoreId,
                groupId: datasource.id
            },
        })
    })
   
}


export class NotionLoader  extends DatasourceLoaderBase {
    isGroup = true;

    getSize = async () => {
        return 0;
    };

    async load() {
        await getNotionBasePages(this.datasource)
        await triggerTaskLoadDatasource(
            [...pageIds].map((id) => ({
              userId: this.datasource?.ownerId!,
              datasourceId: id,
              priority: 10,
            }))
          );
        await prisma.appDatasource.update({
            where: {
                id: this.datasource.id,
            },
            data: {
                status: DatasourceStatus.synched,
            },
        });
        return {} as Document
    }
}
