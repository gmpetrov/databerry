/* eslint-disable jsx-a11y/anchor-is-valid */
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import { Tooltip } from '@mui/joy';
import Chip from '@mui/joy/Chip';
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import { ColorPaletteProp } from '@mui/joy/styles';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import { Agent, Datastore } from '@prisma/client';
import Link from 'next/link';
import * as React from 'react';

import { RouteNames } from '@app/types';

export default function AgentTable({ items }: { items: Agent[] }) {
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
              <th style={{ width: 120, padding: 12 }}>Name</th>
              <th style={{ width: 120, padding: 12 }}>Description</th>
              <th style={{ width: 220, padding: 12 }}>Visibility</th>
              {/* <th style={{ width: 120, padding: 12 }}>Subscription</th> */}
              <th style={{ width: 160, padding: 12 }}> </th>
            </tr>
          </thead>
          <tbody>
            {items.map((agent) => (
              <tr key={agent.id}>
                <td>
                  <div className="flex flex-col">
                    <Link href={`${RouteNames.AGENTS}/${agent.id}`}>
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
                        {agent.name}
                      </Typography>
                    </Link>
                  </div>
                </td>
                <td>
                  <Typography
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {agent.description}
                  </Typography>
                </td>

                <td>
                  <Chip
                    variant="soft"
                    size="sm"
                    color={
                      {
                        public: 'success',
                        private: 'neutral',
                      }[agent.visibility] as ColorPaletteProp
                    }
                  >
                    {agent.visibility}
                  </Chip>
                </td>
                <td>
                  <Stack direction="row" spacing={1}>
                    <Link href={`${RouteNames.AGENTS}/${agent.id}/?tab=chat`}>
                      <Tooltip title="Chat with Agent">
                        <IconButton color="neutral" size="sm">
                          <MessageRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </Link>

                    <Link
                      href={`${RouteNames.AGENTS}/${agent.id}/?tab=settings`}
                    >
                      <Tooltip title="Agent Settings">
                        <IconButton color="neutral" size="sm">
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                    </Link>
                  </Stack>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>
    </React.Fragment>
  );
}
