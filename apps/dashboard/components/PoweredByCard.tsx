import EastRoundedIcon from '@mui/icons-material/EastRounded';
import { Button, Card, CardProps, Typography } from '@mui/joy';
import Link from 'next/link';
import React from 'react';

type Props = CardProps & {};

function PoweredByCard({ sx, ...otherProps }: Props) {
  return (
    <Card
      {...otherProps}
      sx={{
        textAlign: 'center',
        ...sx,
      }}
    >
      <Typography level="h2">
        Powered By{' '}
        <Typography color="primary" fontStyle="italic">
          Chaindesk.ai
        </Typography>
      </Typography>
      <Typography level="body-lg">
        Chaindesk is the leading platform for building AI agents trained on your
        data.
      </Typography>

      <Link
        href="https://www.chaindesk.ai/?utm_source=landing_page&utm_medium=tool&utm_campaign=youtube_summarizer"
        target="_blank"
      >
        <Button
          size="lg"
          variant="outlined"
          sx={{ mx: 'auto', mt: 2, borderRadius: '20px' }}
          endDecorator={<EastRoundedIcon fontSize="md" />}
        >
          Build Your AI Agent Now
        </Button>
      </Link>
    </Card>
  );
}

export default PoweredByCard;
