/* eslint-disable jsx-a11y/anchor-is-valid */

import Sheet from '@mui/joy/Sheet';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import Link from 'next/link';
import * as React from 'react';

import { RouteNames } from '@chaindesk/lib/types';
import { MailInbox } from '@chaindesk/prisma';

export default function EmailInboxesTable({
  items = [],
}: {
  items: MailInbox[];
}) {
  return (
    <React.Fragment>
      <Sheet
        className="DatastoreTableContainer"
        variant="outlined"
        sx={{
          width: '100%',
          borderRadius: 'md',
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
          my: 4,
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
              <th style={{ width: '80%' }} rowSpan={5}>
                Name
              </th>
              {/* <th style={{ width: 120,  }}>Description</th>
              <th style={{ width: 120,  }}>Model</th> */}
              {/* <th style={{}}>Submissions</th> */}
              {/* <th style={{ width: 160,  }}> </th> */}
            </tr>
          </thead>
          <tbody>
            {items.map((form) => (
              <tr key={form.id}>
                <td>
                  <div className="flex flex-col">
                    <Link href={`${RouteNames.EMAIL_INBOXES}/${form.id}`}>
                      <Typography
                        className="truncate hover:underline"
                        fontWeight={'bold'}
                        color="primary"
                        // fontSize={'md'}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {form.name}
                      </Typography>
                    </Link>
                  </div>
                </td>
                {/* <td>
                  <Typography
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {form.name}
                  </Typography>
                </td> */}

                {/* <td>
                  <Chip variant="soft" size="sm" color={'neutral'}>
                    {form.name}
                  </Chip>
                </td> */}
                {/* <td>
                  <Chip variant="soft" size="sm">
                    {(form as any)?._count?.submissions || 0}
                  </Chip>
                </td> */}
                {/* <td>
                  <Stack direction="row" spacing={1}>
                    <Link href={`${RouteNames.AGENTS}/${form.id}/?tab=chat`}>
                      <Tooltip title="Chat with Agent">
                        <IconButton color="neutral" size="sm">
                          <MessageRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </Link>

                    <Link
                      href={`${RouteNames.AGENTS}/${form.id}/?tab=settings`}
                    >
                      <Tooltip title="Agent Settings">
                        <IconButton color="neutral" size="sm">
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                    </Link>
                  </Stack>
                </td> */}
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>
    </React.Fragment>
  );
}
