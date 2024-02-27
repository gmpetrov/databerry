import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Box, Button, Link, Stack, Typography } from '@mui/joy';

import ColorSchemeToggle from './Layout/ColorSchemeToggle';
import Header from './Layout/Header';
import Logo from './Logo';
type Props = {
  href?: string;
};
export default function TopBar(props: Props) {
  return (
    <>
      <Header>
        <Link href={props.href}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Logo className="w-10" />
            <Typography component="h1" fontWeight="xl">
              Chaindesk
            </Typography>
          </Box>
        </Link>

        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
          <ColorSchemeToggle />
        </Box>
      </Header>
      <Box
        sx={(t) => ({
          mx: 'auto',
          background: t.palette.primary.softBg,
          width: '100%',
          justifyContent: 'center',
          display: 'flex',
        })}
        color="warning"
      >
        <Stack direction={'row'} sx={{ alignItems: 'center', p: 0.5 }} gap={2}>
          <Typography
            level="body-md"
            sx={(t) => ({ color: t.palette.text.secondary })}
          >
            <Typography color="primary" sx={{ fontStyle: 'italic' }}>
              <strong>NEW</strong>
            </Typography>{' '}
            Train a custom GPT Chatbot on YouTube videos
          </Typography>
          <Link
            target="_blank"
            href={`https://app.chaindesk.ai/agents?utm_source=landing_page&utm_medium=tool&utm_campaign=youtube_summarizer`}
          >
            <Button
              size="sm"
              sx={{ borderRadius: '100px' }}
              variant="solid"
              endDecorator={<ArrowForwardRoundedIcon />}
            >
              Try Now
            </Button>
          </Link>
        </Stack>
      </Box>
    </>
  );
}
