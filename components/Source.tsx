import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import { Box, Sheet, Stack, Typography, TypographyProps } from '@mui/joy';
import Chip from '@mui/joy/Chip';
// Breaks chat-bubble-widget build
// import { DatasourceType } from '@prisma/client';
import React, { useCallback } from 'react';

import { Source } from '@app/types/document';

type Props = {
  source: Source;
  onClick?: (source: Source) => any;
};

function SourceComponent({ source, onClick }: Props) {
  let icon = null;
  let scoreColor: TypographyProps['color'] = 'neutral';

  switch (source.datasource_type as 'web_page' | 'file') {
    case 'web_page':
      icon = <LanguageRoundedIcon />;
      break;
    case 'file':
      icon = <DescriptionRoundedIcon />;
      break;
    default:
      break;
  }

  if (source.score! >= 0.8) {
    scoreColor = 'success';
  } else if (source.score! >= 0.7) {
    scoreColor = 'neutral';
  } else if (source.score! >= 0.5) {
    scoreColor = 'warning';
  } else if (source.score! < 0.5) {
    scoreColor = 'danger';
  }

  const handleClick = useCallback(() => {
    onClick?.(source);
  }, [source]);

  return (
    <Chip
      key={source.chunk_id}
      variant="outlined"
      color="neutral"
      size="sm"
      className="truncate"
      sx={{ maxWidth: '450px', marginRight: 'auto' }}
      startDecorator={
        <Stack direction={'row'} gap={1}>
          {icon}
        </Stack>
      }
      endDecorator={
        <Typography
          level="body4"
          variant="soft"
          color={scoreColor}
          sx={{ borderRadius: 100, ml: 1 }}
          // sx={{ px: 0.5, py: 0, m: 0 }}
        >
          {source.score?.toFixed(2)}
        </Typography>
      }
      onClick={onClick ? handleClick : undefined}
    >
      {source.source_url && !onClick ? (
        <a href={source.source_url || '#'} target="_blank">
          {source.datasource_name || source.source_url}
        </a>
      ) : (
        source.datasource_name || source.source_url
      )}
    </Chip>
  );
}

export default SourceComponent;
