import cuid from 'cuid';

import { NotionToolset } from '@chaindesk/lib/notion-helpers';
import { DatasourceExtended } from '@chaindesk/lib/task-load-datasource';
import { AppDocument } from '@chaindesk/lib/types/document';
import { DatasourceStatus, DatasourceType } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

import bulkDeleteDatasources from '../bulk-delete-datasources';
import triggerTaskLoadDatasource from '../trigger-task-load-datasource';
import { DatasourceNotion } from '../types/models';

import { DatasourceLoaderBase } from './base';

export class NotionLoader extends DatasourceLoaderBase<DatasourceNotion> {
  isGroup = true;
  private notebooks: { id: string; title: string }[];

  constructor(datasource: DatasourceExtended<DatasourceNotion>) {
    super(datasource);
    const accessToken = datasource?.serviceProvider?.accessToken;
    if (!accessToken) {
      throw new Error('Notion accessToken must be provided');
    }
    this.notebooks = this.datasource?.config?.notebooks;
  }

  async getSize(text: string) {
    return 0;
  }

  async load() {
    try {
      const notionToolset = new NotionToolset(
        this.datasource.serviceProvider?.accessToken!
      );
      const allPagesFromSelection =
        await notionToolset.getAllPagesFromSelection({
          selectedNotebooks: this.notebooks,
        });

      const existingDatasources = await prisma.appDatasource.findMany({
        where: {
          groupId: this.datasource.id,
        },
        select: {
          id: true,
          config: true,
        },
      });

      await prisma.$transaction(async (tx) => {
        let ids: string[] = [];

        if (existingDatasources.length > 0) {
          const fetchedPagesIds = allPagesFromSelection.map((each) => each.id);

          // Find datasource id that don't have a notebookId in the fetched pages
          const datasourceToRemove = existingDatasources.filter(
            (each) =>
              !fetchedPagesIds.find(
                (notebookId) => notebookId === (each?.config as any)?.notebookId
              )
          );

          const datasourceIdsToRemove = datasourceToRemove.map(
            (each) => each.id
          );
          const notebookIdsToRemove = datasourceToRemove.map(
            (each) => (each?.config as any)?.notebookId
          );

          console.log('datasourceIdsToRemove', datasourceIdsToRemove);
          console.log('notebookIdsToRemove', notebookIdsToRemove);

          if (datasourceIdsToRemove?.length > 0) {
            await bulkDeleteDatasources({
              datastoreId: this.datasource.datastoreId!,
              datasourceIds: datasourceIdsToRemove,
            });

            await tx.appDatasource.update({
              where: {
                id: this.datasource.id,
              },
              data: {
                config: {
                  notebooks: this.notebooks.filter(
                    (notebook) => !notebookIdsToRemove.includes(notebook.id)
                  ),
                },
              },
            });
          }

          ids = allPagesFromSelection.map((notebook) => {
            // Find existing datasource id for the notebook
            const id = existingDatasources.find(
              (one) => (one.config as any).notebookId === notebook?.id
            )?.id;

            if (id) {
              return id;
            }
            return cuid();
          });
        } else {
          ids = allPagesFromSelection.map(() => cuid());
        }

        await tx.appDatasource.createMany({
          data: allPagesFromSelection.map((notebook, index) => ({
            id: ids[index],
            type: DatasourceType.notion_page,
            name: `${notebook?.title}`,
            config: {
              notebookId: notebook?.id,
              title: notebook?.title,
              tags: this.datasource?.config?.tags || [],
            },
            organizationId: this.datasource?.organizationId!,
            datastoreId: this.datasource?.datastoreId,
            groupId: this.datasource?.id,
            serviceProviderId: this.datasource?.serviceProviderId,
          })),
          skipDuplicates: true,
        });

        await tx.appDatasource.update({
          where: {
            id: this.datasource.id,
          },
          data: {
            status: DatasourceStatus.synched,
          },
        });

        await triggerTaskLoadDatasource(
          allPagesFromSelection.map((_, index) => ({
            organizationId: this.datasource?.organizationId!,
            datasourceId: ids[index],
            priority: 10,
          }))
        );
      });

      return [] as AppDocument[];
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
