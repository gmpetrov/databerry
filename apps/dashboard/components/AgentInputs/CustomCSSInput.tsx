import Box from '@mui/joy/Box';
import FormControl from '@mui/joy/FormControl';
import dynamic from 'next/dynamic';
import React from 'react';
import { useFormContext } from 'react-hook-form';

type Props = {};

const CodeEditor = dynamic(() => import('../CodeEditor'), {
  ssr: false,
});

export default function SuggestionsInput(props: Props) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const { watch, setValue } = useFormContext();

  const config = watch('interfaceConfig');

  return (
    <FormControl>
      <details>
        <summary>Custom CSS</summary>

        <Box
          component="div"
          role="button"
          tabIndex={0}
          onKeyDown={() => textareaRef.current?.focus()}
          onClick={() => textareaRef.current?.focus()}
          className="relative flex"
          sx={(theme) => ({
            position: 'relative',
            display: 'flex',
            background: '#1E1E1E',
            borderRadius: theme.radius.md,
          })}
        >
          <textarea
            className="absolute inset-0 p-2 font-mono text-transparent bg-transparent outline-none resize-none caret-white"
            rows={4}
            defaultValue={config?.customCSS}
            onChange={(e) => {
              setValue('interfaceConfig.customCSS', e.target.value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            ref={textareaRef}
          />
          <CodeEditor code={config?.customCSS || ''} />
        </Box>
      </details>
    </FormControl>
  );
}
