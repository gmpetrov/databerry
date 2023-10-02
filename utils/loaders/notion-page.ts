import { AppDocument } from '@app/types/document';

import { NotionToolset } from '../notion-helpers';
import prisma from '../prisma-client';
import { DatasourceExtended } from '../task-load-datasource';

import { DatasourceLoaderBase } from './base';


export class NotionPageLoader extends DatasourceLoaderBase {
    private notebookId: string;

    constructor(datasource: DatasourceExtended) {
        super(datasource);
        const accessToken = datasource?.serviceProvider?.accessToken;
        if (!accessToken) {
            throw new Error('Notion accessToken must be provided');
        }

        this.notebookId = (this.datasource as any)?.config?.notebookId
    }

    async getSize(text: string) {
        return 0;
    }

    async load() {
        try {
            const notionToolset = new NotionToolset(this.datasource.serviceProvider?.accessToken!)
            const pageContent = await notionToolset.getNotebookContent({ notebookId: this.notebookId })
            if (pageContent.trim() === '') {
                // delete if empty
                await prisma.appDatasource.delete({
                    where: {
                        id: this.datasource.id
                    }
                })
                return;
            }
            const source_url = await notionToolset.getNotebookUrl(this.notebookId) || ''
            return [new AppDocument({
                pageContent,
                metadata: {
                    datastore_id: this.datasource.datastoreId!,
                    datasource_id: this.datasource.id,
                    datasource_name: this.datasource.name,
                    datasource_type: this.datasource.type,
                    source_url,
                    tags: [],
                },
            })]
        } catch (e) {
            console.error(e)
            throw e
        }
    }
}