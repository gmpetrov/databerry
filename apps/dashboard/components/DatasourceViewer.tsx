import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import {
  Position,
  PrimaryButton,
  SpecialZoomLevel,
  Tooltip,
  Viewer,
  Worker,
} from '@react-pdf-viewer/core';
import {
  defaultLayoutPlugin,
  ToolbarProps,
  ToolbarSlot,
} from '@react-pdf-viewer/default-layout';
import { searchPlugin } from '@react-pdf-viewer/search';
import mime from 'mime-types';
import React, { ReactElement, useEffect } from 'react';
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

function splitToHighlightedText(longText: string, minLength = 20) {
  const sentenceDelimiter = /[.!?]/;
  const lineDelimiter = /\n/;
  const bulletPointDelimiter = /\s*•\s*/;

  let potentialChunks = longText.split(sentenceDelimiter);

  potentialChunks = potentialChunks
    .filter((chunk) => chunk.trim() !== '')
    .flatMap((chunk) => chunk.split(lineDelimiter));

  potentialChunks = potentialChunks.flatMap((chunk) =>
    chunk.split(bulletPointDelimiter)
  );

  const finalChunks = potentialChunks
    .filter((chunk) => chunk.trim() !== '' && chunk.trim().length >= minLength)
    .map((chunk) => chunk.trim());

  return finalChunks;
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
  const [isLoaded, setIsLoaded] = React.useState(false);

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

  //   console.log('fileURL', datasourceId, datastoreId, datasourceType, mimeType);

  const _search = `4. Proof-of-Work
    To implement a distributed timestamp server on a peer-to-peer basis, we will need to use a proof-
    of-work system similar to Adam Back's Hashcash [6], rather than newspaper or Usenet posts.
    The proof-of-work involves scanning for a value that when hashed, such as with SHA-256, the
    hash begins with a number of zero bits. The average work required is exponential in the number
    of zero bits required and can be verified by executing a single hash.
    For our timestamp network, we implement the proof-of-work by incrementing a nonce in the
    block until a value is found that gives the block's hash the required zero bits. Once the CPU
    effort has been expended to make it satisfy the proof-of-work, the block cannot be changed
    without redoing the work. As later blocks are chained after it, the work to change the block
    would include redoing all the blocks after it.
    The proof-of-work also solves the problem of determining representation in majority decision
    making. If the majority were based on one-IP-address-one-vote, it could be subverted by anyone
    able to allocate many IPs. Proof-of-work is essentially one-CPU-one-vote. The majority
    decision is represented by the longest chain, which has the greatest proof-of-work effort invested
    in it. If a majority of CPU power is controlled by honest nodes, the honest chain will grow the
    fastest and outpace any competing chains. To modify a past block, an attacker would have to
    redo the proof-of-work of the block and all blocks after it and then catch up with and surpass the
    work of the honest nodes. We will show later that the probability of a slower attacker catching up
    diminishes exponentially as subsequent blocks are added.
    To compensate for increasing hardware speed and varying interest in running nodes over time,
    the proof-of-work difficulty is determined by a moving average targeting an average number of
    blocks per hour. If they're generated too fast, the difficulty increases.
    5. Network
    The steps to run the network are as follows:
    1) New transactions are broadcast to all nodes.
    2) Each node collects new transactions into a block.`
    .split('\n')
    .map((each) => each.trim());

  const handleSearch = React.useCallback(
    async (search?: string) => {
      if (search) {
        const contentToHighlight = splitToHighlightedText(search);
        highlight(contentToHighlight);
      }
    },
    [highlight]
  );

  // "Given the following extracted parts of a long document and a question,
  // create a final answer in the language the question is asked.
  // If you don't know the answer, just say that you don't know. Don't try to make up an answer.
  // Always answer in the same language the question is asked in.\n\n
  // Content: ... Question: What are nodes?\n\n\nHelpful Answer:"

  // In case the search change but not the document (pdf-viewer will not load again)
  useEffect(() => {
    handleSearch(search);
  }, [search]);

  useEffect(() => {
    if (isLoaded && pageIndex !== 0) {
      jumpToPage(pageIndex);
    }
  }, [pageIndex, isLoaded]);

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
        {/* <Button
          onClick={() => {
            highlight(_search);
            // highlight({
            // keyword: search,

            // matchCase: false,
            // });
          }}
        >
          test
        </Button> */}
        <Viewer
          defaultScale={SpecialZoomLevel.PageWidth}
          fileUrl={fileUrl}
          plugins={[searchPluginInstance, defaultLayoutPluginInstance]}
          enableSmoothScroll
          onDocumentLoad={(e) => {
            setIsLoaded(true);
            if (search) {
              handleSearch(search);
            }

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
