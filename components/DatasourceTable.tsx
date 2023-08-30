import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutorenewRounded from '@mui/icons-material/AutorenewRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import PlayArrow from '@mui/icons-material/PlayArrow';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SourceRoundedIcon from '@mui/icons-material/SourceRounded';
import { Badge, Checkbox } from '@mui/joy';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import CircularProgress from '@mui/joy/CircularProgress';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import { ColorPaletteProp } from '@mui/joy/styles';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import {
  AppDatasource as Datasource,
  DatasourceStatus,
  DatasourceType,
  Prisma,
} from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import pDebounce from 'p-debounce';
import * as React from 'react';
import useSWR from 'swr';

import useGetDatastoreQuery from '@app/hooks/useGetDatastoreQuery';
import useStateReducer from '@app/hooks/useStateReducer';
import { RouteNames } from '@app/types';
import pagination from '@app/utils/pagination';
import relativeDate from '@app/utils/relative-date';

const SynchButton = ({
  datasource,
  onClick,
}: {
  datasource: Datasource;
  onClick: any;
}) => {
  const [state, setState] = useStateReducer({
    loading: false,
    buttonText: 'Synch',
    color: 'info',
  });

  const handleClick = React.useCallback(
    async (e: any) => {
      setState({ loading: true });
      await onClick?.(e);
    },
    [setState, onClick]
  );

  React.useEffect(() => {
    let loading = false;
    let buttonText = 'Synch';
    let color = 'neutral';

    if (
      datasource.status === DatasourceStatus.running ||
      datasource.status === DatasourceStatus.pending ||
      !!(datasource as any)?.children?.[0]
    ) {
      loading = true;
    }

    switch (datasource.status) {
      case DatasourceStatus.running:
        buttonText = 'Running';
        break;
      case DatasourceStatus.pending:
        buttonText = 'Pending';
        break;
      case DatasourceStatus.error:
        buttonText = 'Synch';
        color = 'error';
        break;
      case DatasourceStatus.unsynched:
      case DatasourceStatus.synched:
        buttonText = 'Synch';
        break;
      default:
        break;
    }

    setState({
      loading,
      buttonText,
      color,
    });
  }, [datasource?.status]);

  if (
    ![
      DatasourceType.web_page,
      DatasourceType.web_site,
      DatasourceType.google_drive_folder,
      DatasourceType.google_drive_file,
    ].includes(datasource.type as any)
  ) {
    return null;
  }

  return (
    <Button
      {...(state.loading
        ? {
            loading: true,
            startDecorator: <PlayArrow />,
            loadingPosition: 'start',
          }
        : {
            startDecorator: <PlayArrow />,
          })}
      onClick={handleClick}
      size="sm"
      variant="outlined"
      color={state.color as any}
      className="mr-auto rounded-full"
      startDecorator={<AutorenewRounded />}
    >
      <span>{state.buttonText}</span>
    </Button>
  );
};

export default function DatasourceTable({
  handleSynch,
  handleBulkDelete,
}: {
  // items: Datasource[];
  handleBulkDelete: (ids: string[]) => any;
  handleSynch: (datasourceId: string) => Promise<any>;
}) {
  const router = useRouter();

  const { getDatastoreQuery, offset, limit, search, status, type, groupId } =
    useGetDatastoreQuery({
      swrConfig: {
        refreshInterval: 5000,
      },
    });

  const [selected, setSelected] = React.useState<string[]>([]);
  const [state, setState] = useStateReducer({
    isBulkDeleting: false,
  });

  const onClikBulkDelete = async (ids: string[]) => {
    try {
      setState({ isBulkDeleting: true });
      await handleBulkDelete(ids);
    } catch (error) {
      console.log(error);
    } finally {
      setState({ isBulkDeleting: false });
      setSelected([]);
    }
  };

  const total = getDatastoreQuery?.data?._count?.datasources || 0;
  const items = getDatastoreQuery?.data?.datasources || [];
  const nbPages = Math.ceil(total / limit) || 1;

  const offsetIndexes =
    React.useMemo(() => {
      return pagination(offset, nbPages).map((each) => `${each}`);
    }, [offset, nbPages]) || [];

  React.useEffect(() => {
    router.query.limit = `${limit}`;
    router.query.offset = `${offset}`;
    router.replace(router, undefined, { shallow: true });
  }, []);

  const handleSearch = React.useCallback(
    pDebounce(async (query?: string) => {
      router.query.search = query || '';
      router.replace(router, undefined, { shallow: true });
    }, 1000),
    [router]
  );

  return (
    <React.Fragment>
      {selected?.length > 0 && (
        <Button
          loading={state.isBulkDeleting}
          onClick={() => onClikBulkDelete(selected)}
          variant="soft"
          color="danger"
          size="sm"
          startDecorator={<DeleteRoundedIcon />}
          sx={{
            mr: 'auto',
            mb: 1,
          }}
        >
          Delete Selection
        </Button>
      )}

      {groupId && (
        <Button
          startDecorator={<CloseRounded />}
          variant="outlined"
          color="primary"
          size="sm"
          sx={{
            mr: 'auto',
            mb: 1,
          }}
          onClick={() => {
            router.query.groupId = undefined;
            router.replace(router, undefined, { shallow: true });
          }}
        >
          {router.query.groupName || groupId}
        </Button>
      )}

      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          borderRadius: 'sm',
          pb: 2,
          display: {
            xs: 'none',
            sm: 'flex',
          },
          flexWrap: 'wrap',
          gap: 1.5,
          '& > *': {
            minWidth: {
              xs: '120px',
              md: '160px',
            },
          },
        }}
      >
        <Stack width="100%" direction="row" gap={2}>
          <FormControl sx={{ flex: 1 }} size="sm">
            <Stack
              direction={'row'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <FormLabel>Search for datasource (name)</FormLabel>
              <Typography level="body2" color="primary">{`${total} result${
                total > 1 ? 's' : ''
              }`}</Typography>
            </Stack>
            <Input
              autoFocus
              defaultValue={search}
              placeholder="Search"
              startDecorator={<SearchRoundedIcon />}
              endDecorator={
                getDatastoreQuery?.isLoading ? (
                  <Button variant="plain" size="sm" loading />
                ) : null
              }
              onChange={(e) => {
                const value = e?.currentTarget?.value || '';

                handleSearch(value);
              }}
            />
          </FormControl>

          <FormControl size="sm">
            <FormLabel sx={{ ml: 'auto' }}>Type</FormLabel>
            <Select
              placeholder="Filter by type"
              value={type}
              slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
              onChange={(_, value) => {
                if (value) {
                  router.query.type = value as string;
                  router.replace(router, undefined, { shallow: true });
                }
              }}
              {...(type && {
                // display the button and remove select indicator
                // when user has selected a value
                endDecorator: (
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="neutral"
                    onMouseDown={(event) => {
                      // don't open the popup when clicking on this button
                      event.stopPropagation();
                    }}
                    onClick={() => {
                      router.query.type = '';
                      router.replace(router, undefined, { shallow: true });
                    }}
                  >
                    <CloseRounded />
                  </IconButton>
                ),
                indicator: null,
              })}
            >
              {Object.keys(DatasourceType).map((each) => (
                <Option key={each} value={each}>
                  {each}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl size="sm">
            <FormLabel sx={{ ml: 'auto' }}>Status</FormLabel>
            <Select
              placeholder="Filter by status"
              value={status}
              slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
              onChange={(_, value) => {
                if (value) {
                  router.query.status = value as string;
                  router.replace(router, undefined, { shallow: true });
                }
              }}
              {...(status && {
                // display the button and remove select indicator
                // when user has selected a value
                endDecorator: (
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="neutral"
                    onMouseDown={(event) => {
                      // don't open the popup when clicking on this button
                      event.stopPropagation();
                    }}
                    onClick={() => {
                      router.query.status = '';
                      router.replace(router, undefined, { shallow: true });
                    }}
                  >
                    <CloseRounded />
                  </IconButton>
                ),
                indicator: null,
              })}
            >
              {Object.keys(DatasourceStatus).map((each) => (
                <Option key={each} value={each}>
                  {each}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* <React.Fragment>


          <FormControl size="sm">
            <FormLabel>Category</FormLabel>
            <Select placeholder="All">
              <Option value="all">All</Option>
            </Select>
          </FormControl>

          <FormControl size="sm">
            <FormLabel>Customer</FormLabel>
            <Select placeholder="All">
              <Option value="all">All</Option>
            </Select>
          </FormControl>
        </React.Fragment> */}
      </Box>

      <Sheet
        className="DatasourceTableContainer"
        variant="outlined"
        sx={{
          width: '100%',
          borderRadius: 'md',
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
        }}
      >
        <Table
          aria-labelledby="tableTitle"
          stickyHeader
          hoverRow
          sx={{
            '--TableCell-headBackground': (theme) =>
              theme.vars.palette.background.level1,
            '--Table-headerUnderlineThickness': '1px',
            '--TableRow-hoverBackground': (theme) =>
              theme.vars.palette.background.level1,
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 48, textAlign: 'center', padding: 12 }}>
                <Checkbox
                  disabled={state.isBulkDeleting}
                  // indeterminate={
                  //   selected.length > 0 && selected.length !== rows.length
                  // }

                  checked={selected.length === items.length}
                  onChange={(event) => {
                    setSelected(
                      event.target.checked
                        ? items.map((datasource) => datasource.id)
                        : []
                    );
                  }}
                  sx={{ verticalAlign: 'text-bottom' }}
                />
              </th>
              <th style={{ width: 220, padding: 12 }}>Name</th>
              <th style={{ width: 120, padding: 12 }}>Type</th>
              <th style={{ width: 120, padding: 12 }}>Size</th>
              <th style={{ width: 120, padding: 12 }}>Last Synch</th>
              <th style={{ width: 120, padding: 12 }}>Status</th>
              {/* <th style={{ width: 120, padding: 12 }}>Subscription</th> */}
              <th style={{ width: 120, padding: 12 }}> </th>
            </tr>
          </thead>
          <tbody>
            {items.map((datasource) => (
              <tr key={datasource.id}>
                {/* <td style={{ textAlign: 'center' }}>
                  <Checkbox
                    checked={selected.includes(row.id)}
                    color={selected.includes(row.id) ? 'primary' : undefined}
                    onChange={(event) => {
                      setSelected((ids) =>
                        event.target.checked
                          ? ids.concat(row.id)
                          : ids.filter((itemId) => itemId !== row.id)
                      );
                    }}
                    slotProps={{ checkbox: { sx: { textAlign: 'left' } } }}
                    sx={{ verticalAlign: 'text-bottom' }}
                  />
                </td> */}
                {/* <td>
                  <Typography fontWeight="md">{row.id}</Typography>
                </td> */}
                <td>
                  <div className="flex justify-center ">
                    <Checkbox
                      disabled={state.isBulkDeleting}
                      checked={selected.includes(datasource.id)}
                      onChange={(e) => {
                        setSelected((ids) =>
                          e.target.checked
                            ? ids.concat(datasource.id)
                            : ids.filter((itemId) => itemId !== datasource.id)
                        );
                      }}
                    />
                  </div>
                </td>
                <td>
                  <div className="flex flex-col">
                    <Stack
                      direction="row"
                      alignItems={'center'}
                      spacing={2}
                      className="max-w-full"
                    >
                      {datasource?._count?.children > 0 && (
                        <Badge
                          badgeContent={datasource?._count?.children}
                          max={9999}
                          size="sm"
                          badgeInset={3}
                        >
                          <IconButton
                            size="sm"
                            variant="soft"
                            color="primary"
                            onClick={() => {
                              router.query.offset = '0';
                              router.query.groupId = datasource.id;
                              router.query.groupName = datasource.name;
                              router.replace(router, undefined, {
                                shallow: true,
                              });

                              setSelected([]);
                            }}
                          >
                            <ChevronRightIcon />
                          </IconButton>
                        </Badge>
                        // </Link>
                      )}
                      <Link
                        href={`${RouteNames.DATASTORES}/${datasource.datastoreId}/${datasource.id}`}
                        className="truncate hover:underline"
                      >
                        <Typography className="truncate" fontWeight={'bold'}>
                          {datasource.name}
                        </Typography>
                      </Link>
                    </Stack>
                    {/* <Typography color="neutral" className="truncate">
                      Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                      Iste sapiente aliquid ab iure laboriosam fuga! Magnam
                      quasi officiis sequi ea quis obcaecati quod consequatur,
                      fugiat tempore maiores perferendis doloribus natus!
                    </Typography> */}
                  </div>
                </td>

                <td>
                  <Chip
                    variant="soft"
                    size="sm"
                    // startDecorator={
                    //   {
                    //     Paid: <i data-feather="check" />,
                    //     Refunded: <i data-feather="corner-up-left" />,
                    //     Cancelled: <i data-feather="x" />,
                    //   }[row.status]
                    // }
                    // color={
                    //   {
                    //     public: 'success',
                    //     private: 'neutral',
                    //   }[datastore.visibility] as ColorPaletteProp
                    // }
                    color={'neutral'}
                  >
                    {datasource.type}
                  </Chip>
                </td>
                <td>
                  {datasource?._count?.children <= 0 && (
                    <Typography>{`${((datasource.textSize || 0) / 1024).toFixed(
                      1
                    )}kb / ${datasource.nbChunks} chunks`}</Typography>
                  )}
                </td>
                {/* <td>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar size="sm">{row.customer.initial}</Avatar>
                    <div>
                      <Typography
                        fontWeight="lg"
                        level="body3"
                        textColor="text.primary"
                      >
                        {row.customer.name}
                      </Typography>
                      <Typography level="body3">
                        {row.customer.email}
                      </Typography>
                    </div>
                  </Box>
                </td> */}
                {/* <td>{row.subscription}</td> */}
                <td>
                  <Typography className="truncate">
                    {datasource?.lastSynch &&
                      relativeDate(new Date(datasource.lastSynch))}
                  </Typography>
                </td>
                <td>
                  <Chip
                    variant="soft"
                    size="sm"
                    // startDecorator={
                    //   {
                    //     Paid: <i data-feather="check" />,
                    //     Refunded: <i data-feather="corner-up-left" />,
                    //     Cancelled: <i data-feather="x" />,
                    //   }[row.status]
                    // }
                    sx={{
                      textTransform: 'capitalize2',
                    }}
                    color={
                      {
                        unsynched: 'neutral',
                        pending: 'primary',
                        running: 'info',
                        synched: 'success',
                        error: 'danger',
                        usage_limit_reached: 'warning',
                      }[
                        datasource?.children?.[0]
                          ? DatasourceStatus.running
                          : datasource.status
                      ] as ColorPaletteProp
                    }
                  >
                    {datasource?.children?.[0]
                      ? DatasourceStatus.running
                      : datasource.status}
                  </Chip>
                </td>
                <td className="space-x-2">
                  {/* <Button size="sm" variant="outlined">
                    Synch
                  </Button> */}
                  <SynchButton
                    datasource={datasource}
                    onClick={() => handleSynch(datasource.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>

      <Box
        className="Pagination-mobile"
        sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}
      >
        <IconButton
          aria-label="previous page"
          variant="outlined"
          color="neutral"
          size="sm"
        >
          <i data-feather="arrow-left" />
        </IconButton>
        <Typography level="body2" mx="auto">
          Page 1 of 10
        </Typography>
        <IconButton
          aria-label="next page"
          variant="outlined"
          color="neutral"
          size="sm"
        >
          <i data-feather="arrow-right" />
        </IconButton>
      </Box>
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 4,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: '50%' },
          display: {
            xs: 'none',
            md: 'flex',
          },
        }}
      >
        <Button
          size="sm"
          variant="plain"
          color="neutral"
          startDecorator={<ArrowBackRoundedIcon />}
          onClick={() => {
            if (offset - 1 >= 0) {
              router.query.offset = `${offset - 1}`;
              router.replace(router, undefined, { shallow: true });
            }
          }}
        >
          Previous
        </Button>

        <Box sx={{ flex: 1 }} />
        {offsetIndexes.map((page) => (
          <IconButton
            key={page}
            size="sm"
            variant={Number(page) ? 'outlined' : 'plain'}
            color={
              Number(page) && Number(page) - 1 === offset
                ? 'primary'
                : 'neutral'
            }
            onClick={() => {
              const nb = Number(page);
              if (nb) {
                router.query.offset = `${nb - 1}`;
                router.replace(router, undefined, { shallow: true });
              }
            }}
          >
            {page}
          </IconButton>
        ))}
        <Box sx={{ flex: 1 }} />

        <Button
          size="sm"
          variant="plain"
          color="neutral"
          endDecorator={<ArrowForwardRoundedIcon />}
          onClick={() => {
            if (offset + 1 < nbPages) {
              router.query.offset = `${offset + 1}`;
              router.replace(router, undefined, { shallow: true });
            }
          }}
        >
          Next
        </Button>
      </Box>

      {/* <Box
        className="Pagination-mobile"
        sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}
      >
        <IconButton
          aria-label="previous page"
          variant="outlined"
          color="neutral"
          size="sm"
        >
          <i data-feather="arrow-left" />
        </IconButton>
        <Typography level="body2" mx="auto">
          Page 1 of 10
        </Typography>
        <IconButton
          aria-label="next page"
          variant="outlined"
          color="neutral"
          size="sm"
        >
          <i data-feather="arrow-right" />
        </IconButton>
      </Box>
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 4,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: '50%' },
          display: {
            xs: 'none',
            md: 'flex',
          },
        }}
      >
        <Button
          size="sm"
          variant="plain"
          color="neutral"
          startDecorator={<i data-feather="arrow-left" />}
        >
          Previous
        </Button>

        <Box sx={{ flex: 1 }} />
        {['1', '2', '3', '…', '8', '9', '10'].map((page) => (
          <IconButton
            key={page}
            size="sm"
            variant={Number(page) ? 'outlined' : 'plain'}
            color="neutral"
          >
            {page}
          </IconButton>
        ))}
        <Box sx={{ flex: 1 }} />

        <Button
          size="sm"
          variant="plain"
          color="neutral"
          endDecorator={<i data-feather="arrow-right" />}
        >
          Next
        </Button>
      </Box> */}
    </React.Fragment>
  );
}
