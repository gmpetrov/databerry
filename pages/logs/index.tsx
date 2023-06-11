import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import Alert from "@mui/joy/Alert";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import CircularProgress from "@mui/joy/CircularProgress";
import Divider from "@mui/joy/Divider";
import List from "@mui/joy/List";
import ListItemContent from "@mui/joy/ListItemContent";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import ListItem from "@mui/material/ListItem";
import { Prisma } from "@prisma/client";
import { useVirtualizer } from "@tanstack/react-virtual";
import { GetServerSidePropsContext } from "next/types";
import { useTranslations } from "next-intl";
import { ReactElement } from "react";
import React from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

import ChatBox from "@app/components/ChatBox";
import Layout from "@app/components/Layout";
import useStateReducer from "@app/hooks/useStateReducer";
import relativeDate from "@app/utils/relative-date";
import { fetcher } from "@app/utils/swr-fetcher";
import { withAuth } from "@app/utils/withAuth";

import { getLogs } from "../api/logs";
import { getMessages } from "../api/logs/[id]";

const LIMIT = 20;

export default function LogsPage() {
  const parentRef = React.useRef();
  const [state, setState] = useStateReducer({
    currentConversationId: undefined as string | undefined,
    hasReachedEnd: false,
  });
  const t = useTranslations("logs");

  const getConversationsQuery = useSWRInfinite<
    Prisma.PromiseReturnType<typeof getLogs>
  >((pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.length) {
      setState({
        hasReachedEnd: true,
      });
      return null; // reached the end
    }
    return `/api/logs?page=${pageIndex}&limit=${LIMIT}`;
  }, fetcher);
  const getMessagesQuery = useSWR<Prisma.PromiseReturnType<typeof getMessages>>(
    state.currentConversationId
      ? `/api/logs/${state.currentConversationId}`
      : null,
    fetcher
  );

  const allRows = getConversationsQuery?.data?.flatMap((d) => d) || [];

  const rowVirtualizer = useVirtualizer({
    count: Number(allRows?.length),
    getScrollElement: () => parentRef.current as any,
    estimateSize: () => 93,
    // overscan: 5,
  });

  React.useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    // const cursor = allRows?.[allRows.length - 1]?.id;

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= allRows.length - 1 &&
      !state.hasReachedEnd &&
      !getConversationsQuery.isLoading &&
      !getConversationsQuery.isValidating
    ) {
      getConversationsQuery.setSize(getConversationsQuery.size + 1);
    }
  }, [
    // hasNextPage,
    // fetchNextPage,
    allRows.length,
    getConversationsQuery.isLoading,
    getConversationsQuery.isValidating,
    getConversationsQuery.size,
    state.hasReachedEnd,
    rowVirtualizer.getVirtualItems(),
  ]);

  if (!getConversationsQuery.isLoading && allRows?.length === 0) {
    return (
      <Alert
        variant="outlined"
        sx={{
          textAlign: "center",
          justifyContent: "center",
          maxWidth: "sm",
          mx: "auto",
        }}
      >
        <Stack justifyContent={"center"} alignItems={"center"} gap={1}>
          <Typography level="h4" color="primary">
            <InboxRoundedIcon />
          </Typography>
          <Stack>
            <Typography level="body1">{t(`no_data`)}</Typography>
            <Typography level="body2">
              {t(`no_data_description`)}
            </Typography>
          </Stack>
        </Stack>
      </Alert>
    );
  }

  return (
    <Sheet
      variant="outlined"
      sx={(theme) => ({
        height: "100%",
        borderRadius: 10,
      })}
    >
      <Stack direction={"row"} sx={{ height: "100%" }}>
        <List
          // aria-labelledby="ellipsis-list-demo"
          // sx={{ '--ListItemDecorator-size': '56px' }}
          ref={parentRef as any}
          sx={{
            width: "sm",
            maxWidth: "30%",
            height: "100%",
            overflowY: "auto",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((row) => {
            if (!row) {
              return null;
            }

            const isLoaderRow = row.index > allRows?.length - 1;
            const each = allRows[row.index];

            return (
              <React.Fragment key={row.key}>
                <ListItem
                  sx={(theme) => ({
                    py: 1,
                    "&:hover": {
                      cursor: "pointer",
                      backgroundColor: theme.palette.action.hover,
                    },
                    ...(state.currentConversationId === each.id && {
                      backgroundColor: theme.palette.action.hover,
                    }),
                    borderBottomWidth: 0.2,
                    borderBottomColor: theme.palette.divider,
                  })}
                  onClick={() => {
                    setState({
                      currentConversationId: each.id,
                    });
                  }}
                >
                  {/* <ListItemDecorator sx={{ alignSelf: 'flex-start' }}>
    <Avatar src="/static/images/avatar/1.jpg" />
  </ListItemDecorator> */}
                  <ListItemContent>
                    <Stack>
                      <Stack direction="row" justifyContent={"space-between"}>
                        <Typography>{each?.agent?.name}</Typography>

                        <Typography level="body3">
                          {relativeDate(each?.updatedAt)}
                        </Typography>
                      </Stack>
                      <Stack
                        direction="row"
                        justifyContent={"space-between"}
                        alignItems={"start"}
                        gap={1}
                      >
                        <Typography level="body2" noWrap>
                          {each?.messages?.[0]?.text}
                        </Typography>

                        {each?._count?.messages > 0 && (
                          <Chip
                            // variant="soft"
                            color="danger"
                            size="sm"
                            sx={{
                              borderRadius: "100%",
                              // p: 1,
                            }}
                          >
                            <Typography textColor={"common.white"}>
                              {each?._count?.messages}
                            </Typography>
                          </Chip>
                        )}
                      </Stack>
                      <Chip
                        size="sm"
                        color="neutral"
                        variant="outlined"
                        sx={{
                          mr: "auto",
                          mt: 1,
                        }}
                      >
                        {each?.channel}
                      </Chip>
                    </Stack>
                  </ListItemContent>
                </ListItem>
                {/* <ListDivider /> */}

                {getConversationsQuery.isLoading && (
                  <CircularProgress size="sm" sx={{ mx: "auto", my: 2 }} />
                )}
              </React.Fragment>
            );
          })}
        </List>
        <Divider orientation="vertical" />
        <Box sx={{ width: "100%", paddingX: 2 }}>
          <ChatBox
            messages={
              getMessagesQuery?.data?.map((each) => ({
                id: each.id,
                from: each.from,
                message: each.text,
                createdAt: each.createdAt,
              })) || []
            }
            onSubmit={async () => {}}
            readOnly={true}
          />
        </Box>
      </Stack>
    </Sheet>
  );
}

LogsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    const { locale } = ctx;
    return {
      props: {
        ...require(`../../public/locales/logs/${locale}.json`),
                ...require(`../../public/locales/navbar/${locale}.json`),
      },
    };
  }
);
