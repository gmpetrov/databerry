import { DatasourceType } from '@prisma/client';
import axios from 'axios';
import { z } from 'zod';

import { NotionBlock } from '@app/types/notion-models';
import type { Document } from '@app/utils/datastores/base';

import { DatasourceExtended, DatasourceLoaderBase } from './base';


const flattenChildBlocks = async (code:string,blocks: Array<any>): Promise<Array<any>> => {
    const container: Array<any> = []
    let childContainer: Array<any> = []
    return Promise.all(blocks.map(async (block)=>{
        const childBlocks = await getNotionBlocks(code,block.id)
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
                await flattenChildBlocks(code,childContainer)
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

const getNotionBlocks = async (code:string, id: string) => { 
    const notionHeader = {
        headers:{
            'Authorization': `Bearer ${code}`,
            'Notion-Version': process.env.NOTION_VERSION
        }
    }
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

const getNotionPageContent = async (datasource: DatasourceExtended) => {
    const pageId: string = (
        datasource.config as z.infer<typeof NotionBlock>['config']
      )['pageId'];
      const key = (
        datasource.config as z.infer<typeof NotionBlock>['config']
      )['integrationKey'];

    const childBlocks: Array<any> = []
    const blocksList: Array<any> = []
    let sentencesList: Array<string> = []
    let finalString = ""

    return await new Promise<Array<any>>(async(resolve) => {
        const notionBlocks = await getNotionBlocks(key,pageId)
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
            await flattenChildBlocks(key,blocks)
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

        const resp = await getNotionPageContent(this.datasource)
        return {
            pageContent: resp,
            metadata: {
                datasource_id: this.datasource.id,
                source_type: this.datasource.type,
                tags: [],
            },
        } as Document
    }
}
