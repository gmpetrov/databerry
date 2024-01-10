import axios from 'axios';
import pMap from 'p-map';
import React, { useCallback } from 'react';
import useSWRMutation from 'swr/mutation';

import { generateActionFetcher, HTTP_METHOD } from '@chaindesk/lib/swr-fetcher';
import {
  GenerateManyUploadLinksResponseSchema,
  GenerateManyUploadLinksSchema,
} from '@chaindesk/lib/types/dtos';

type FileToUpload = {
  case: 'chatUpload' | 'agentIcon' | 'organizationIcon' | 'userIcon';
  file: File;
  agentId?: string;
  conversationId?: string;
};

function useFileUpload() {
  const [isUploading, setIsUploading] = React.useState(false);
  const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL;

  const generateLinkMutation = useSWRMutation<
    GenerateManyUploadLinksResponseSchema,
    any,
    any,
    GenerateManyUploadLinksSchema
  >(() => {
    return `${API_URL}/api/generate-upload-links`;
  }, generateActionFetcher(HTTP_METHOD.POST));

  const upload = useCallback(
    async (items: FileToUpload[]) => {
      let urls = [] as string[];
      try {
        setIsUploading(true);

        const links =
          (await generateLinkMutation.trigger(
            items.map((each) => ({
              case: each.case as any,
              fileName: each.file.name,
              mimeType: each.file.type as any,
              agentId: each.agentId as any,
              conversationId: each.conversationId as any,
            }))
          )) || [];

        links.length > 0
          ? await pMap(
              links,
              async ({ signedUrl }, index) => {
                return axios.put(signedUrl, items[index].file, {
                  headers: {
                    'Content-Type': items[index]?.file?.type,
                  },
                });
              },
              {
                concurrency: links.length,
              }
            )
          : [];

        setIsUploading(false);

        urls = links.map((each) => each.fileUrl);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
        return urls;
      }
    },
    [generateLinkMutation.trigger]
  );

  return {
    generateLinkMutation,
    upload,
    isUploading,
  };
}

export default useFileUpload;
