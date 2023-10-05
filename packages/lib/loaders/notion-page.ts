import { NotionToolset } from '@chaindesk/lib/notion-helpers';
import { DatasourceExtended } from '@chaindesk/lib/task-load-datasource';
import { AppDocument } from '@chaindesk/lib/types/document';

import { DatasourceLoaderBase } from './base';

export class NotionPageLoader extends DatasourceLoaderBase {
  private notebookId: string;

  constructor(datasource: DatasourceExtended) {
    super(datasource);
    const accessToken = datasource?.serviceProvider?.accessToken;
    if (!accessToken) {
      throw new Error('Notion accessToken must be provided');
    }

    this.notebookId = (this.datasource as any)?.config?.notebookId;
  }

  async getSize(text: string) {
    return 0;
  }

  async load() {
    try {
      const notionToolset = new NotionToolset(
        this.datasource.serviceProvider?.accessToken!
      );
      const pageContent = await notionToolset.getNotebookContent({
        notebookId: this.notebookId,
      });

      const source_url =
        (await notionToolset.getNotebookUrl(this.notebookId)) || '';

      return [
        new AppDocument({
          pageContent: pageContent || '',
          metadata: {
            datastore_id: this.datasource.datastoreId!,
            datasource_id: this.datasource.id,
            datasource_name: this.datasource.name,
            datasource_type: this.datasource.type,
            source_url,
            tags: [],
          },
        }),
      ];
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
