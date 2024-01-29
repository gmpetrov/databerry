import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutorenewRounded from '@mui/icons-material/AutorenewRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import PlayArrow from '@mui/icons-material/PlayArrow';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SourceRoundedIcon from '@mui/icons-material/SourceRounded';
import { Badge, Checkbox, Drawer } from '@mui/joy';
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
import Link from 'next/link';
import { useRouter } from 'next/router';
import pDebounce from 'p-debounce';
import * as React from 'react';
import useSWR from 'swr';

import useContactsQuery from '@app/hooks/useGetContactsQuery';
import useGetDatastoreQuery from '@app/hooks/useGetDatastoreQuery';
import useStateReducer from '@app/hooks/useStateReducer';

import formatPhoneNumber from '@chaindesk/lib/format-phone-number';
import pagination from '@chaindesk/lib/pagination';
import relativeDate from '@chaindesk/lib/relative-date';
import { RouteNames } from '@chaindesk/lib/types';
import {
  AppDatasource as Datasource,
  DatasourceStatus,
  DatasourceType,
  Prisma,
} from '@chaindesk/prisma';

import ContactSettings from './ContactSettings';

export default function ContactsTable({}: // handleSynch,
// handleBulkDelete,
{
  // items: Datasource[];
  // handleBulkDelete: (ids: string[]) => any;
  // handleSynch: (datasourceId: string) => Promise<any>;
}) {
  const router = useRouter();

  const { contactsQuery, offset, limit, search } = useContactsQuery({
    swrConfig: {
      refreshInterval: 5000,
    },
  });

  const [selected, setSelected] = React.useState<string[]>([]);
  const [state, setState] = useStateReducer({
    isBulkDeleting: false,
    isContactDrawerOpen: false,
    currentContactId: '',
  });

  // const onClikBulkDelete = async (ids: string[]) => {
  //   try {
  //     setState({ isBulkDeleting: true });
  //     await handleBulkDelete(ids);
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setState({ isBulkDeleting: false });
  //     setSelected([]);
  //   }
  // };

  const total = contactsQuery?.data?.count || 0;
  const items = contactsQuery?.data?.contacts || [];
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
      {/* {selected?.length > 0 && (
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
      )} */}

      {/* {groupId && (
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
      )} */}

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
              <FormLabel>Search for contacts (email)</FormLabel>
              <Typography level="body-sm" color="primary">{`${total} result${
                total > 1 ? 's' : ''
              }`}</Typography>
            </Stack>
            <Input
              autoFocus
              defaultValue={search}
              placeholder="Search"
              startDecorator={<SearchRoundedIcon />}
              endDecorator={
                contactsQuery?.isLoading ? (
                  <Button variant="plain" size="sm" loading />
                ) : null
              }
              onChange={(e) => {
                const value = e?.currentTarget?.value || '';

                handleSearch(value);
              }}
            />
          </FormControl>
          {/* 
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
          </FormControl> */}

          {/* <FormControl size="sm">
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
          </FormControl> */}
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
        className="ContactsTableContainer"
        variant="outlined"
        sx={{
          width: '100%',
          borderRadius: 'md',
          overflow: 'auto',
          minHeight: 0,
        }}
      >
        <Table
          aria-labelledby="tableTitle"
          stickyHeader
          hoverRow
          sx={(t) => ({
            '--TableCell-headBackground': (theme) =>
              theme.vars.palette.background.level1,
            '--Table-headerUnderlineThickness': '1px',
            '--TableRow-hoverBackground': (theme) =>
              theme.vars.palette.background.level1,
            'tr:hover': {
              cursor: 'pointer',
            },
          })}
        >
          <thead>
            <tr>
              {/* <th style={{ width: 48, textAlign: 'center', padding: 12 }}>
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
              </th> */}
              <th style={{}}>Email</th>
              <th style={{}}>Phone Number</th>
              <th style={{}}>Name</th>
              {/* <th style={{ width: 120, padding: 12 }}>Type</th> */}
              {/* <th style={{ width: 120, padding: 12 }}>Size</th> */}
              {/* <th style={{ width: 120, padding: 12 }}>Last Sync</th> */}
              {/* <th style={{ width: 120, padding: 12 }}>Status</th> */}
              {/* <th style={{ width: 120, padding: 12 }}>Subscription</th> */}
              <th style={{}}> Created At</th>
            </tr>
          </thead>
          <tbody>
            {items.map((contact) => {
              return (
                <tr
                  key={contact.id}
                  onClick={() => {
                    setState({
                      isContactDrawerOpen: true,
                      currentContactId: contact.id,
                    });
                  }}
                >
                  <td>{contact.email}</td>
                  <td>
                    {formatPhoneNumber({ phoneNumber: contact?.phoneNumber! })}
                  </td>
                  <td>{contact?.firstName}</td>
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

                  <td>{(contact as any).createdAt}</td>

                  {/* <td>
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
                  </td> */}
                  {/* <td>
                    {datasource?._count?.children <= 0 && (
                      <Typography>{`${(
                        (datasource.nbTokens || 0) / 1000
                      ).toFixed(1)}K tokens / ${
                        datasource.nbChunks
                      } chunks`}</Typography>
                    )}
                  </td> */}
                  {/* <td>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar size="sm">{row.customer.initial}</Avatar>
                    <div>
                      <Typography
                        fontWeight="lg"
                        level="body-xs"
                        textColor="text.primary"
                      >
                        {row.customer.name}
                      </Typography>
                      <Typography level="body-xs">
                        {row.customer.email}
                      </Typography>
                    </div>
                  </Box>
                </td> */}
                  {/* <td>{row.subscription}</td> */}
                  {/* <td>
                    <Typography className="truncate">
                      {datasource?.lastSynch &&
                        relativeDate(new Date(datasource.lastSynch))}
                    </Typography>
                  </td> */}
                  {/* <td>
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
                      startDecorator={
                        isRunning ? (
                          <CircularProgress
                            color="warning"
                            size="sm"
                            sx={{
                              '--_root-size': '9px',
                            }}
                          />
                        ) : null
                      }
                      sx={{
                        textTransform: 'capitalize2',
                      }}
                      color={
                        {
                          unsynched: 'neutral',
                          pending: 'primary',
                          running: 'neutral',
                          synched: 'success',
                          error: 'danger',
                          usage_limit_reached: 'warning',
                        }[
                          isRunning
                            ? DatasourceStatus.running
                            : datasource.status
                        ] as ColorPaletteProp
                      }
                    >
                      {isRunning ? DatasourceStatus.running : datasource.status}
                    </Chip>
                  </td> */}
                  {/* <td className="space-x-2">
                    
                  </td> */}
                </tr>
              );
            })}
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
        <Typography level="body-sm" mx="auto">
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

      {/* <Drawer
        open={state.isContactDrawerOpen}
        onClose={() => setState({ isContactDrawerOpen: false })}
        anchor="right"
      >
        {state.currentContactId && (
          <ContactSettings id={state.currentContactId} />
        )}
      </Drawer> */}
    </React.Fragment>
  );
}
