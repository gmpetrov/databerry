import axios from 'axios';
import pMap from 'p-map';
import React, { useCallback, useEffect, useState } from 'react';
import useSWRMutation from 'swr/mutation';

import { generateActionFetcher, HTTP_METHOD } from '@chaindesk/lib/swr-fetcher';
import {
  GenerateManyUploadLinksResponseSchema,
  GenerateManyUploadLinksSchema,
} from '@chaindesk/lib/types/dtos';

export type FileToUpload = {
  case:
    | 'chatUpload'
    | 'agentIcon'
    | 'organizationIcon'
    | 'userIcon'
    | 'formUpload';
  file: File;
  fileName?: string;
  agentId?: string;
  formId?: string;
  conversationId?: string;
};

type Props = {
  ref?: React.RefObject<HTMLDivElement>;
  changeCallback?: (files: File[]) => any;
};

function useFileUpload(props: Props = {}) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([] as File[]);
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
              fileName: each?.fileName || each.file.name,
              mimeType: each.file.type as any,
              agentId: each.agentId as any,
              formId: each.formId as any,
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

  const handleChange = useCallback(
    async (
      // e
      _files: HTMLInputElement['files']
    ) => {
      const maxFileSize = 10000000; // 10MB

      const filtered = Array.from(_files!).filter(
        (one) => !files.find((existing) => existing.name === one.name)
      );

      const found = filtered.find((one) => one.size > maxFileSize);

      if (found) {
        // if (hiddenInputRef.current) {
        //   hiddenInputRef.current.value = '';
        // }
        return alert('File size is limited to 10MB');
      } else {
        const f = [...files, ...filtered];
        await props?.changeCallback?.(f);
        setFiles(f);
      }
    },
    [props?.changeCallback, files]
  );

  const handleDragOver = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault();
      setDragOver(true);
    },
    []
  );

  const handleDragLeave = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault();
      setDragOver(false);
    },
    []
  );

  const handleDrop = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault();
      setDragOver(false);
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        handleChange(event.dataTransfer.files);
        event.dataTransfer.clearData();
      }
    },
    [handleChange]
  );

  useEffect(() => {
    if (props?.ref?.current) {
      props?.ref?.current.addEventListener('dragover', handleDragOver as any);
      props?.ref?.current.addEventListener('dragleave', handleDragLeave as any);
      props?.ref?.current.addEventListener('drop', handleDrop as any);
    }

    return () => {
      if (props?.ref?.current) {
        props?.ref?.current.removeEventListener(
          'dragover',
          handleDragOver as any
        );
        props?.ref?.current.removeEventListener(
          'dragleave',
          handleDragLeave as any
        );
        props?.ref?.current.removeEventListener('drop', handleDrop as any);
      }
    };
  }),
    [props?.ref?.current, handleDragOver, handleDragLeave, handleDrop];

  return {
    generateLinkMutation,
    upload,
    isUploading,
    isDragOver,
  };
}

export default useFileUpload;
