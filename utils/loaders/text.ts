import { Document } from "@app/utils/datastores/base";

import { DatasourceLoaderBase } from "./base";

export class TextLoader extends DatasourceLoaderBase {
  async getSize(text: string) {
    return new Blob([text]).size;
  }

  async load(text: string) {
    return new Document({
      pageContent: text,
      metadata: {
        datasource_id: this.datasource.id,
        source_type: this.datasource.type,
        source: (this.datasource?.config as any)?.source,
        tags: [],
      },
    });
  }
}
