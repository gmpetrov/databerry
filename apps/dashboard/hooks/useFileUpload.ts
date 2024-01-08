import axios from 'axios';
import pMap from 'p-map';
import React, { useCallback } from 'react';
import useSWRMutation from 'swr/mutation';

import { generateActionFetcher, HTTP_METHOD } from '@chaindesk/lib/swr-fetcher';
import {
  GenerateManyUploadLinksSchema,
  GenerateUploadLinkRequestSchema,
} from '@chaindesk/lib/types/dtos';
import { Prisma } from '@chaindesk/prisma';

import type { generateUploadLinks } from './../pages/api/generate-upload-links';

type FileToUpload = {
  case: 'agentIcon' | 'organizationIcon' | 'userIcon' | 'chatUpload';
  file: File;
};

function useFileUpload() {
  const [isUploading, setIsUploading] = React.useState(false);
  const generateLinkMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof generateUploadLinks>,
    any,
    any,
    GenerateManyUploadLinksSchema
  >(() => {
    return `/api/generate-upload-links`;
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
            }))
          )) || [];

        await pMap(
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
        );

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
