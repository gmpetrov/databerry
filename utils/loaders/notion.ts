import axios, { AxiosHeaders, AxiosRequestConfig } from 'axios';
import { map } from 'cheerio/lib/api/traversing';
import { resolve } from 'path';
import { z } from 'zod';

import { NotionBlock, NotionMainPage } from '@app/types/notion-models';
import type { Document } from '@app/utils/datastores/base';

import { DatasourceLoaderBase } from './base';


let parentsId : Array<string> = []

const notionHeader = {
    headers:{
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': process.env.NOTION_VERSION
    }
}
const getNotionBasePages = async () => {
    const searchUrl = `${process.env.NOTION_BASE_URL}/search/`
    const basePages: Array<any> = (await axios.post(searchUrl,{},notionHeader)).data.results
    const filteredBasePages = (basePages).filter(val => val.parent.type === 'workspace')
    let sentencesList: Array<string> = []
    const blocks: Array<any> = []
   
    await new Promise<Array<any>>((resolve) => {
        filteredBasePages.map(async (page) => {
            const childBlocks: Array<any> = []
            const notionBlocks = await getNotionBlocks(page.id)
            notionBlocks.map((block) => {
                if(block.has_children) {
                    childBlocks.push(block)
                }
                blocks.push(block)
            })
            resolve(childBlocks)
        })
    }
    )
    .then(async (blocks) => {
        await flattenChildBlocks(blocks)
        .then((flattens) => {
            
        })
    });
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
                    newContainer.forEach((val)=>{
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
        const resp = await getNotionBasePages()
    // const url: string = (
    //   this.datasource.config as z.infer<typeof NotionBlock>['config']
    // )['source'];
    return {

    } as Document
    }
}
