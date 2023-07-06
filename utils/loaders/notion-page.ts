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
            pageContent: resp,
            metadata: {
                source: 'notion',
                datasource_id: this.datasource.id,
                source_type: this.datasource.type,
                tags: [],
            },
        } as Document
    }
}
