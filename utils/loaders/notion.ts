import axios from 'axios';
import { z } from 'zod';

import { NotionBlock, NotionMainPage } from '@app/types/notion-models';
import type { Document } from '@app/utils/datastores/base';

import { DatasourceLoaderBase } from './base';

const getNotionBasePages = async () => {
    const searchUrl = `${process.env.NOTION_BASE_URL}/search`
    const basePages = await axios.post(searchUrl,{
        headers: {
            'Notion Version': process.env.NOTION_VERSION,
            'Authorization': `Bearer :${process.env.NOTION_API_KEY}`
        },
    })
    return basePages.data
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
    // const url: string = (
    //   this.datasource.config as z.infer<typeof NotionBlock>['config']
    // )['source'];
    return {
        
    } as Document
    }
}
