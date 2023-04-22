import { zodResolver } from '@hookform/resolvers/zod';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import {
  Box,
  Card,
  CircularProgress,
  IconButton,
  Input,
  Stack,
} from '@mui/joy';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type Message = { from: 'human' | 'agent'; message: string };

type Props = {
  messages: Message[];
  onSubmit: (message: string) => Promise<any>;
};

const Schema = z.object({ query: z.string().min(1) });

function ChatBox({ messages, onSubmit }: Props) {
  const scrollableRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {},
  });

  const submit = async ({ query }: z.infer<typeof Schema>) => {
    try {
      setIsLoading(true);
      methods.reset();
      await onSubmit(query);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!scrollableRef.current) {
      return;
    }

    scrollableRef.current.scrollTo(0, scrollableRef.current.scrollHeight);
  }, [messages?.length]);

  return (
    <Stack
      direction={'column'}
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        mx: 'auto',
      }}
    >
      <Stack
        direction={'column'}
        sx={{
          height: '100%',
          maxHeight: '100%',
          // overflowY: 'auto',
          display: 'flex',
          pb: 8,
          pt: 2,
        }}
      >
        <Stack
          ref={scrollableRef}
          direction={'column'}
          gap={2}
          sx={{
            maxWidth: '100%',
            width: '700px',
            mx: 'auto',
            maxHeight: '100%',
            overflowY: 'auto',
          }}
        >
          {messages.map((each, index) => (
            <Card
              key={index}
              variant={'outlined'}
              color={each.from === 'agent' ? 'primary' : 'neutral'}
              sx={{
                mr: each.from === 'agent' ? 'auto' : 'none',
                ml: each.from === 'human' ? 'auto' : 'none',
                whiteSpace: 'pre-wrap',
              }}
            >
              {each.message}
            </Card>
          ))}

          {isLoading && (
            <CircularProgress
              variant="soft"
              color="neutral"
              size="sm"
              sx={{ mx: 'auto', my: 2 }}
            />
          )}
        </Stack>
      </Stack>

      <Box
        sx={{
          mt: 'auto',
          left: 0,
          maxWidth: '100%',
          width: '100%',
          overflow: 'visible',
          background: 'none',
          position: 'absolute',
          display: 'flex',
          justifyContent: 'center',
          bottom: 4,
          paddingLeft: 'inherit',
          paddingRight: 'inherit',
        }}
      >
        {/* <div className="w-full h-12 -translate-y-1/2 pointer-events-none backdrop-blur-lg"></div> */}
        <form
          style={{
            maxWidth: '100%',
            width: '700px',
          }}
          onSubmit={methods.handleSubmit(submit)}
        >
          <Input
            // disabled={!state.currentDatastoreId || state.loading}
            variant="outlined"
            endDecorator={
              <IconButton type="submit" disabled={isLoading}>
                <SendRoundedIcon />
              </IconButton>
            }
            {...methods.register('query')}
          />
        </form>
      </Box>
    </Stack>
  );
}

export default ChatBox;
