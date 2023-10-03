import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import ManageSearchTwoToneIcon from '@mui/icons-material/ManageSearchTwoTone';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import Alert from '@mui/joy/Alert';
import Badge from '@mui/joy/Badge';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Link from 'next/link';
import React from 'react';

import { RouteNames } from '@chaindesk/lib/types';

type Props = {
  handlePromptClick?: (prompt: string) => any;
};

const features = [
  {
    title: 'Retrieve information spread across all your organization',
    icon: <ManageSearchTwoToneIcon />,
    prompts: ["What's the onboarding process for new employees"],
  },
  {
    title: 'Analyze a specific document',
    icon: <PictureAsPdfRoundedIcon />,
    prompts: [
      'Summarize this document',
      'What are the key points of this document?',
    ],
  },
  {
    title: 'Generate content from your data',
    icon: <CreateRoundedIcon />,
    prompts: ['Generate a response letter to this document'],
  },
];

function EmptyMainChatCard(props: Props) {
  return (
    <Stack>
      <Card
        variant="outlined"
        color="neutral"
        sx={{ boxShadow: 'none', maxWidth: 'sm', mx: 'auto' }}
      >
        <CardContent sx={{ textAlign: 'center' }}>
          <Badge
            badgeContent="beta"
            sx={{ textAlign: 'center', mx: 'auto' }}
            color="warning"
            variant="soft"
            badgeInset={'-5px 0px'}
            // anchorOrigin={{
            //   vertical: 'top',
            //   horizontal: 'left',
            // }}
          >
            <Typography level="title-lg" color="primary" sx={{ mx: 'auto' }}>
              Welcome to the new Chat by Chaindesk
            </Typography>
          </Badge>
          <Typography level="body-sm">
            The place where you can to talk to your data, and more!
          </Typography>

          <Alert sx={{ mt: 4 }} color="neutral" variant="outlined">
            <Stack
              className="list-decimal list-inside"
              sx={{
                textAlign: 'left',
                'p::marker': {
                  fontWeight: 'xl',
                },
              }}
            >
              <Typography className="list-item" level="body-sm">
                {'Select a "Chain" type. e.g: Q&A'}
              </Typography>
              <Typography className="list-item" level="body-sm">
                Restrict knowledge to a specific Datastore or Datasource
              </Typography>
              <Typography className="list-item" level="body-sm">
                Try a prompt from the below examples
              </Typography>
              <Typography className="list-item" level="body-sm">
                If the generated answer contains Sources click on it to open it.
                Special treatment for PDF files 😉
              </Typography>
            </Stack>
          </Alert>

          <Stack sx={{ mt: 6, pl: 4 }} gap={4}>
            {features.map((feature, idx) => (
              <Stack key={idx} sx={{ textAlign: 'left' }}>
                <Stack direction={'row'} gap={2}>
                  <IconButton disabled color="neutral" sx={{ mb: 'auto' }}>
                    {feature.icon}
                  </IconButton>
                  <Stack>
                    <Typography level="body-md">{feature.title}</Typography>
                    <Stack>
                      {feature.prompts.map((prompt, idx) => (
                        <Typography
                          key={idx}
                          level="body-sm"
                          onClick={() => {
                            props.handlePromptClick?.(prompt);
                          }}
                          sx={(theme) => ({
                            '&:hover': {
                              cursor: 'pointer',
                              color: theme.palette.primary.main,
                            },
                          })}
                        >{`"${prompt}"`}</Typography>
                      ))}
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            ))}
          </Stack>

          <Link href={RouteNames.DATASTORES}>
            <Button
              sx={{ mt: 8 }}
              startDecorator={<AddRoundedIcon />}
              variant="soft"
            >
              Add Your Data
            </Button>
          </Link>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default EmptyMainChatCard;
