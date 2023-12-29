import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { Checkbox, CircularProgress, Link } from '@mui/joy';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import * as React from 'react';

import usePaginatedQuery from '@app/hooks/usePaginatedQuery';
import { getWorkflow } from '@app/pages/api/workflows/[id]';

import pagination from '@chaindesk/lib/pagination';
import { RouteNames } from '@chaindesk/lib/types';
import { JobStatus } from '@chaindesk/prisma';

export default function JobsTable({
  handleBulkDelete,
  isDeleting,
  revalidationRef,
}: {
  handleBulkDelete: (ids: string[]) => any;
  isDeleting: boolean;
  revalidationRef?: number;
}) {
  const router = useRouter();

  const {
    getPagniatedQuery: getJobsQuery,
    offset,
    limit,
    filterValues,
  } = usePaginatedQuery<typeof getWorkflow>({
    swrConfig: {
      refreshInterval: 5000,
    },
    baseEndpoint: '/api/workflows',
    path: ['workflowId'],
    filters: ['status'],
    tableType: 'workflowTable',
  });

  const { status } = filterValues;

  const [selected, setSelected] = React.useState<string[]>([]);

  const total = getJobsQuery?.data?._count.jobs || 0;
  const jobs = getJobsQuery?.data?.jobs || [];
  const nbPages = Math.ceil(total / limit) || 1;

  const offsetIndexes =
    React.useMemo(() => {
      return pagination(offset, nbPages).map((each) => `${each}`);
    }, [offset, nbPages]) || [];

  React.useEffect(() => {
    router.query.limit = `${limit}`;
    router.query.offset = `${offset}`;
    router.replace(router, undefined, { shallow: true });
  }, [router.isReady]);

  React.useEffect(() => {
    getJobsQuery.mutate();
    setSelected([]);
  }, [revalidationRef]);

  if (!getJobsQuery.data) {
    return (
      <Stack sx={{ height: '100%' }}>
        <CircularProgress size="sm" sx={{ m: 'auto' }} />
      </Stack>
    );
  }
  return (
    <React.Fragment>
      {selected?.length > 0 && (
        <Button
          loading={isDeleting}
          onClick={() => handleBulkDelete(selected)}
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
        <Stack width="100%" direction="row-reverse" gap={2}>
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
              {Object.keys(JobStatus).map((each) => (
                <Option key={each} value={each}>
                  {each}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <Sheet
        className="DatasourceTableContainer"
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
                  disabled={isDeleting}
                  checked={selected.length === jobs.length}
                  onChange={(event) => {
                    setSelected(
                      event.target.checked ? jobs.map((job) => job.id) : []
                    );
                  }}
                  sx={{ verticalAlign: 'text-bottom' }}
                />
              </th>
              <th style={{ width: 220, padding: 12 }}>Job Id</th>
              <th style={{ width: 120, padding: 12 }}>Last Run</th>
              <th style={{ width: 120, padding: 12 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              return (
                <tr key={job.id}>
                  <td>
                    <div className="flex justify-center ">
                      <Checkbox
                        disabled={isDeleting}
                        checked={selected.includes(job.id)}
                        onChange={(e) => {
                          setSelected((ids) =>
                            e.target.checked
                              ? ids.concat(job.id)
                              : ids.filter((jobId) => jobId !== job.id)
                          );
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <Link
                        href={`${RouteNames.WORKFLOWS}/${job.workflowId}/${job.id}`}
                      >
                        <Typography
                          className="truncate hover:underline"
                          fontWeight={'bold'}
                          color="primary"
                        >
                          {job.id}
                        </Typography>
                      </Link>
                    </div>
                  </td>
                  <td>{dayjs(job.updatedAt).format('DD/MM/YYYY')}</td>
                  <td>
                    <Chip
                      color={
                        {
                          QUEUED: 'warning',
                          DONE: 'success',
                          ERROR: 'danger',
                          RUNNING: 'primary',
                        }[job.status] as
                          | 'warning'
                          | 'success'
                          | 'danger'
                          | 'primary'
                      }
                      size="sm"
                      variant="soft"
                    >
                      {job.status}
                    </Chip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Sheet>

      {/* Pagination Navigation */}
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
    </React.Fragment>
  );
}
