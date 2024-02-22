import Box from '@mui/joy/Box';
import FormControl from '@mui/joy/FormControl';
import React, { memo } from 'react';
import { useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/htmlbars';
import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/vs2015';

type Props = {};

if (typeof window !== 'undefined') {
  SyntaxHighlighter.registerLanguage('htmlbars', html);
}

const CodeEditor = memo(({ code }: { code: string }) => {
  return (
    <SyntaxHighlighter
      language="css"
      style={docco}
      customStyle={{
        borderRadius: 10,
        maxWidth: '100%',
        flex: '1',
        background: 'transparent',
        minHeight: '100px',
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
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
