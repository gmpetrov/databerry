import { DatasourceStatus, DatasourceType } from '@prisma/client';

import { AppDocument } from '@app/types/document';

import prisma from '../prisma-client';
import { DatasourceExtended } from '../task-load-datasource';
import triggerTaskLoadDatasource from '../trigger-task-load-datasource';

import { DatasourceLoaderBase } from './base';

export class NotionLoader extends DatasourceLoaderBase {
    isGroup = true
    private notebooks: { id: string, title: string }[];

    constructor(datasource: DatasourceExtended) {
        super(datasource);
        const accessToken = datasource?.serviceProvider?.accessToken;
        if (!accessToken) {
            throw new Error('Notion accessToken must be provided');
        }
        this.notebooks = (this.datasource as any)?.config?.notebooks
    }

    async getSize(text: string) {
        return 0
    }

    async load() {
        try {
            await prisma.appDatasource.createMany({
                data: this.notebooks.map((notebook) => ({
                    id: `${this.datasource.id}-${notebook.id}`,
                    type: DatasourceType.notion_page,
                    name: notebook.title,
                    config: {
                        notebookId: notebook.id,
                        title: notebook.title
                    },
                    organizationId: this.datasource?.organizationId!,
                    datastoreId: this.datasource?.datastoreId,
                    groupId: this.datasource?.id,
                    serviceProviderId: this.datasource?.serviceProviderId,
                })),
                skipDuplicates: true,
            });

            await triggerTaskLoadDatasource(
                this.notebooks.map((notebook) => ({
                    organizationId: this.datasource?.organizationId!,
                    datasourceId: `${this.datasource.id}-${notebook.id}`,
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
            return [] as AppDocument[]
        } catch (e) {
            console.error(e)
            throw e
        }
    }
}