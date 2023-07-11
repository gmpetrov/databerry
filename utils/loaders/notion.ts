import { DatasourceType } from '@prisma/client';
import axios, { AxiosHeaders, AxiosRequestConfig } from 'axios';
import { z } from 'zod';

import { NotionBlock, NotionKeyConfig } from '@app/types/notion-models';
import type { Document } from '@app/utils/datastores/base';
import prisma from '@app/utils/prisma-client';

import cuid from '../cuid';
import logger from '../logger';
import triggerTaskLoadDatasource from '../trigger-task-load-datasource';

import { DatasourceExtended, DatasourceLoaderBase } from './base';

const pageIds: Array<string> = []

const getNotionBasePages = async(datasource: DatasourceExtended) => {
    const key = (datasource.config as z.infer<typeof NotionKeyConfig>['config'])['integrationKey']
    const notionHeader = {
        headers:{
            'Authorization': `Bearer ${key}`,
            'Notion-Version': process.env.NOTION_VERSION
        }
    }
    
    const searchUrl = `${process.env.NOTION_BASE_URL}/search/`
    const basePages: Array<any> = (await axios.post(searchUrl,{},notionHeader)).data.results
    const filteredBasePages = basePages.filter(val => val.parent.type === 'workspace')
    filteredBasePages.map(async (page) => {
        const ids = cuid()
        pageIds.push(ids)
        await prisma.appDatasource.create({
            data: {
                id: ids,
                name: page.properties.title.title[0].plain_text,
                type: DatasourceType.notion_page,
                config: {
                    pageId: page.id
                },
                ownerId: datasource.ownerId,
                datastoreId: datasource.datastoreId,
                groupId: datasource.id
            },
        })
    })
   
}
// const flattenChildBlocks = async (blocks: Array<any>): Promise<Array<any>> => {
//     const container: Array<any> = []
//     let childContainer: Array<any> = []
//     return Promise.all(blocks.map(async (block)=>{
//         const childBlocks = await getNotionBlocks(block.id)
//         childBlocks.map((block)=>{
//             container.push(block)
//         })
//     }))
//     .then(async() => {
//          container.forEach((val)=> {
//             if(val.has_children){
//                 childContainer.push(val)
//             }
//         })
//         return new Promise<Array<any>>(async(resolve) => {
//             if(childContainer.length > 0) {
//                 await flattenChildBlocks(childContainer)
//                 .then((newContainer) => {
//                     newContainer.forEach((val) => {
//                         container.push(val)
//                     })
//                     childContainer = []
//                     resolve(container)
//                 })
//             } else {
//                 resolve(container)
//             }
//         })
//         .then((container) => {
//             return container
//         })
//     })
// }

// const getNotionBlocks = async (id: string) => { 
//     const blockUrl = `${process.env.NOTION_BASE_URL}/blocks/${id}/children/`
//     const blocks: Array<any> = (await axios.get(blockUrl,notionHeader)).data.results
//     return blocks
// }

// const getBlockContents = (block: any) => {
//     const blockSentences: Array<string> = []
//     const textContents : Array<any> = block[block.type].rich_text ?? []
//     if(textContents.length >= 1){
//         let sentence : string = ""
//         textContents.map((content) => {
//             sentence = sentence.concat(content.plain_text)
//         })
//         sentence = sentence.concat('\n')
//         blockSentences.push(sentence)
//     }
//     return blockSentences
// }



export class NotionLoader  extends DatasourceLoaderBase {
    isGroup = true;

    getSize = async () => {
        const url: string = (
          this.datasource.config as z.infer<typeof NotionBlock>['id']
        );
        const res = await axios.head(url);
        return (res?.headers['content-length'] as number) || 0;
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
        return {} as Document
    }
}
