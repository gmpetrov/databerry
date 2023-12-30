import Stack from '@mui/joy/Stack';
import { SpecialZoomLevel, Viewer, Worker } from '@react-pdf-viewer/core';
import {
  defaultLayoutPlugin,
  ToolbarProps,
  ToolbarSlot,
} from '@react-pdf-viewer/default-layout';
import { searchPlugin } from '@react-pdf-viewer/search';
import mime from 'mime-types';
import { useRouter } from 'next/router';
import React, { ReactElement, useEffect, useRef } from 'react';
import useSWR from 'swr';

import { getDatasource } from '@app/pages/api/datasources/[id]';

import getS3RootDomain from '@chaindesk/lib/get-s3-root-domain';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { DatasourceType, Prisma } from '@chaindesk/prisma';

type Props = {
  datasourceId: string;
  search?: string;
  pageNumber?: number;
};

/*
  ☢️ important: once the pdf  is fully rendered the plugin onTextLayerRender callback wont be called
  this behaviour imply that a selection of a different answer with the same datasource (and different chunkId) will not  trigger a new highiligh
  the highlight function can be used to highlight in combination with a useEffect to highlight new  lines if needed
 */

type HighlightFn = ReturnType<typeof searchPlugin>['highlight'];

class CustomHighlightPlugin {
  cb: HighlightFn;
  searchRef: React.MutableRefObject<string | undefined>;

  constructor(
    cb: HighlightFn,
    searchRef: React.MutableRefObject<string | undefined>
  ) {
    this.cb = cb;
    this.searchRef = searchRef;
  }

  onTextLayerRender({ ele }: { ele: HTMLElement }) {
    this.highlight(ele);
  }

  highlight(ele?: HTMLElement) {
    if (this.searchRef.current !== undefined) {
      const lineCollection = (ele || document).querySelectorAll(
        '.rpv-core__text-layer-text'
      );
      const lines = Array.from(lineCollection || []);

      const linesToHighlight = lines.reduce((result, child) => {
        const childText: string = (child as any)?.innerText.trim();
        if (
          this.searchRef.current?.includes(childText) &&
          childText !== '' &&
          childText.length > 20
        ) {
          result.push(childText);
        }
        return result;
      }, [] as string[]);

      this.cb(linesToHighlight);
    }
  }
}

function DatasourceViewer({ datasourceId, search, pageNumber }: Props) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [],
    renderToolbar: (Toolbar: (props: ToolbarProps) => ReactElement) => (
      <Toolbar>
        {(slots: ToolbarSlot) => {
          const {
            CurrentPageInput,
            Download,
            EnterFullScreen,
            GoToNextPage,
            GoToPreviousPage,
            NumberOfPages,
            Print,
            ShowSearchPopover,
            Zoom,
            ZoomIn,
            ZoomOut,
          } = slots;
          return (
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                width: '100%',
              }}
            >
              <div style={{ padding: '0px 2px' }}>
                <ShowSearchPopover />
              </div>

              <div style={{ padding: '0px 2px' }}>
                <GoToPreviousPage />
              </div>
              <div style={{ padding: '0px 2px', width: '4rem' }}>
                <CurrentPageInput />
              </div>
              <div style={{ padding: '0px 2px' }}>
                / <NumberOfPages />
              </div>
              <div style={{ padding: '0px 2px' }}>
                <GoToNextPage />
              </div>
              <div style={{ padding: '0px 2px', marginLeft: 'auto' }}>
                <ZoomOut />
              </div>
              <div style={{ padding: '0px 2px' }}>
                <Zoom />
              </div>
              <div style={{ padding: '0px 2px', marginRight: 'auto' }}>
                <ZoomIn />
              </div>
              <div style={{ padding: '0px 2px' }}>
                <EnterFullScreen />
              </div>
              <div style={{ padding: '0px 2px' }}>
                <Download />
              </div>
              <div style={{ padding: '0px 2px' }}>
                <Print />
              </div>
            </div>
          );
        }}
      </Toolbar>
    ),
  });
  const pageIndex = React.useMemo(
    () => (pageNumber ? pageNumber - 1 : 0),
    [pageNumber]
  );

  const getDatasourceQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatasource>
  >(datasourceId ? `/api/datasources/${datasourceId}` : null, fetcher);

  const datastoreId = getDatasourceQuery?.data?.datastoreId;
  const mimeType = (getDatasourceQuery as any)?.data?.config
    ?.mime_type as string;
  const datasourceType = getDatasourceQuery?.data?.type;

  const searchPluginInstance = searchPlugin();
  const { highlight } = searchPluginInstance;
  const {
    toolbarPluginInstance: {
      pageNavigationPluginInstance: { jumpToPage },
    },
  } = defaultLayoutPluginInstance;

  const fileUrl = React.useMemo(() => {
    if (
      datasourceId &&
      datastoreId &&
      datasourceType === DatasourceType.file &&
      mimeType === 'application/pdf'
    ) {
      return `${getS3RootDomain()}/datastores/${datastoreId}/${datasourceId}/${datasourceId}.${mime.extension(
        mimeType
      )}`;
    }
    return null;
  }, [datasourceId, datastoreId, datasourceType, mimeType]);

  const searchRef = useRef(search);

  const customHighlightPlugin = new CustomHighlightPlugin(highlight, searchRef);

  useEffect(() => {
    if (search) {
      searchRef.current = search;
      customHighlightPlugin.highlight();
    }
  }, [search]);

  if (!fileUrl) {
    return null;
  }

  return (
    <Stack
      sx={(theme) => ({
        width: '100%',
        height: '100%',
        '.rpv-default-layout__container': {
          border: 'none',
        },
        borderLeft: 1,
        borderColor: theme.palette.divider,
      })}
    >
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
        <Viewer
          defaultScale={SpecialZoomLevel.PageWidth}
          fileUrl={fileUrl}
          plugins={[
            searchPluginInstance,
            defaultLayoutPluginInstance,
            customHighlightPlugin,
          ]}
          enableSmoothScroll
          onDocumentLoad={(e) => {
            if (pageNumber) {
              jumpToPage(pageIndex);
            }
          }}
        />
      </Worker>
    </Stack>
  );
}

export default DatasourceViewer;
