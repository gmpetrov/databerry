import { DatasourceType } from '@prisma/client';
import axios, { AxiosHeaders, AxiosRequestConfig } from 'axios';
import { z } from 'zod';

import { NotionBlock, NotionMainPage } from '@app/types/notion-models';
import type { Document } from '@app/utils/datastores/base';

import cuid from '../cuid';
import logger from '../logger';
import prisma from '../prisma-client';

import { DatasourceExtended, DatasourceLoaderBase } from './base';


const notionHeader = {
    headers:{
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': process.env.NOTION_VERSION
    }
}


const getNotionBasePages = async(datasource: DatasourceExtended) => {
    const searchUrl = `${process.env.NOTION_BASE_URL}/search/`
    const basePages: Array<any> = (await axios.post(searchUrl,{},notionHeader)).data.results
    const filteredBasePages = basePages.filter(val => val.parent.type === 'workspace')

    let sentencesList: Array<string> = []
    const blocksList: Array<any> = []
    let finalString = ""
    let stackedPromises:Array<any> = []
    
    filteredBasePages.map(async (page) => {
        const childBlocks: Array<any> = []
        const groupId = cuid()
        // await prisma.appDatasource.create({
        //     data: {
        //         id: groupId,
        //         name: page.properties.title.title.text.content,
        //         type: DatasourceType.notion,
        //         config: {
        //             ...(datasource.config as any),
        //             page_id: page.id
        //         },
        //         datastoreId: datasource.datastoreId
        //     },
        // });
        stackedPromises.push(
            new Promise<any>(async(resolve) => {
                const notionBlocks = await getNotionBlocks(page.id)
                notionBlocks.map((block) => {
                    if(block.has_children) {
                        childBlocks.push(block)
                    }
                    blocksList.push(block)
                })
                resolve({id:groupId,data:childBlocks})
            })
        )
    })
    return await Promise.all(stackedPromises)
    .then(async (blocks) => {
        const promArr: Array<Promise<string>> = []
        const flattenBlocksArray: Array<any> = []
        const pageContent: Array<string> = []
        blocks.map((el) => {
            el.data.map((arr: any) => {
                flattenBlocksArray.push(arr)
            })
            promArr.push(new Promise(async(resolve) => {
                await flattenChildBlocks(flattenBlocksArray)
                .then((flattens) => {
                    flattens.map((block) => {
                        blocksList.push(block)
                    })
                    blocksList.map((block) => {
                        const sentences = getBlockContents(block)
                        sentences.map((line) =>{
                            sentencesList.push(line)
                        })
                    })
                    sentencesList.map((line) => {
                        finalString = finalString.concat(line)
                    })
                    resolve(finalString)
                })
            }))
        })
        return Promise.all(promArr)
        // return new Promise(async(resolve) => {
        //     await flattenChildBlocks(flattenBlocksArray)
        //     .then((flattens) => {
        //         flattens.map((block) => {
        //             blocksList.push(block)
        //         })
        //         blocksList.map((block) => {
        //             const sentences = getBlockContents(block)
        //             sentences.map((line) =>{
        //                 sentencesList.push(line)
        //             })
        //         })
        //         sentencesList.map((line) => {
        //             finalString = finalString.concat(line)
        //         })
        //         resolve(finalString)
        //     })
        // })
    })
    .then((str)=>{
        str.map(async()=>{
            await prisma.appDatasource.create({
                data: {
                id: groupId,
                name: page.properties.title.title.text.content,
                type: DatasourceType.notion,
                config: {
                    ...(datasource.config as any),
                    page_id: page.id
                },
                datastoreId: datasource.datastoreId
                },
            });
        })
        return(str)
    })
}
const flattenChildBlocks = async (blocks: Array<any>): Promise<Array<any>> => {
    const container: Array<any> = []
    let childContainer: Array<any> = []
    return Promise.all(blocks.map(async (block)=>{
        const childBlocks = await getNotionBlocks(block.id)
        childBlocks.map((block)=>{
            container.push(block)
        })
    }))
    .then(async() => {
         container.forEach((val)=> {
            if(val.has_children){
                childContainer.push(val)
            }
        })
        return new Promise<Array<any>>(async(resolve) => {
            if(childContainer.length > 0) {
                await flattenChildBlocks(childContainer)
                .then((newContainer) => {
                    newContainer.forEach((val) => {
                        container.push(val)
                    })
                    childContainer = []
                    resolve(container)
                })
            } else {
                resolve(container)
            }
        })
        .then((container) => {
            return container
        })
    })
}

const getNotionBlocks = async (id: string) => { 
    const blockUrl = `${process.env.NOTION_BASE_URL}/blocks/${id}/children/`
    const blocks: Array<any> = (await axios.get(blockUrl,notionHeader)).data.results
    return blocks
}

const getBlockContents = (block: any) => {
    const blockSentences: Array<string> = []
    const textContents : Array<any> = block[block.type].rich_text ?? []
    if(textContents.length >= 1){
        let sentence : string = ""
        textContents.map((content) => {
            sentence = sentence.concat(content.plain_text)
        })
        sentence = sentence.concat('\n')
        blockSentences.push(sentence)
    }
    return blockSentences
}



export class NotionLoader  extends DatasourceLoaderBase {
    getSize = async () => {
        const url: string = (
          this.datasource.config as z.infer<typeof NotionBlock>['id']
        );
        const res = await axios.head(url);
        return (res?.headers['content-length'] as number) || 0;
    };

    async load() {
        const resp = await getNotionBasePages(this.datasource)
        return {
            pageContent: resp[0],
            metadata: {
                source: 'notion',
                datasource_id: this.datasource.id,
                source_type: this.datasource.type,
                tags: [],
            },
        } as Document
    }

    async recurs() {

    }
}
