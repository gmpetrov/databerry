import { DatasourceType } from '@prisma/client';
import axios from 'axios';
import { z } from 'zod';

import { NotionBlock } from '@app/types/notion-models';
import type { Document } from '@app/utils/datastores/base';

import { DatasourceLoaderBase } from './base';


const notionHeader = {
    headers:{
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': process.env.NOTION_VERSION
    }
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

const getNotionPageContent = async (pageId: string) => {
    const childBlocks: Array<any> = []
    const blocksList: Array<any> = []
    let sentencesList: Array<string> = []
    let finalString = ""


    return await new Promise<Array<any>>(async(resolve) => {
        const notionBlocks = await getNotionBlocks(pageId)
        notionBlocks.map((block) => {
            if(block.has_children) {
                childBlocks.push(block)
            }
            blocksList.push(block)
        })
        resolve(childBlocks)
    })
    .then(async (blocks) => {
        return new Promise<string>(async(resolve) => {
            await flattenChildBlocks(blocks)
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
        })
    })
    .then((str)=>{
        return str
    })
}

export class NotionPageLoader  extends DatasourceLoaderBase {
    getSize = async () => {
        return 0;
    };
    async load() {
        const url: string = (
            this.datasource.config as z.infer<typeof NotionBlock>['id']
          );
        const pageId: string = (
            this.datasource.config as z.infer<typeof NotionBlock>['config']
          )['pageId'];
        const resp = await getNotionPageContent(pageId)
        return {
            pageContent: resp,
            metadata: {
                source: url,
                datasource_id: this.datasource.id,
                source_type: this.datasource.type,
                tags: [],
            },
        } as Document
    }
}
