import { DatasourceStatus } from '@prisma/client';

import { AppDocument } from '@app/types/document';

import cuid from '../cuid'
import { createAndTriggerDatasources, getDatasourceIds, NotionToolset } from '../notion-helpers';
import prisma from '../prisma-client';
import { DatasourceExtended } from '../task-load-datasource';

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
            const notionToolset = new NotionToolset(this.datasource.serviceProvider?.accessToken!)
            const allPagesFromSelection = await notionToolset.getAllPagesFromSelection({ selectedNotebooks: this.notebooks })

            const existingDatasources = await prisma.appDatasource.findMany({
                where: {
                    groupId: this.datasource.id
                },
                select: {
                    id: true,
                    config: true
                }
            });

            if (existingDatasources.length > 0) {
                const { datasourceIdsToRemove, allDatasourceIds: ids } = await getDatasourceIds(existingDatasources, allPagesFromSelection)

                if (datasourceIdsToRemove.length > 0) {
                    await prisma.appDatasource.deleteMany({
                        where: {
                            id: {
                                in: datasourceIdsToRemove
                            }
                        }
                    });

                    await prisma.appDatasource.update({
                        where: {
                            id: this.datasource.id
                        },
                        data: {
                            config: {
                                notebooks: this.notebooks.filter((notebook) => datasourceIdsToRemove.includes(notebook.id))
                            }
                        }
                    })
                }

                await createAndTriggerDatasources(this.datasource, ids, allPagesFromSelection)
            }

            else {
                const ids = allPagesFromSelection.map(() => cuid())
                await createAndTriggerDatasources(this.datasource, ids, allPagesFromSelection)
            }
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