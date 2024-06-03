import { memo } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/htmlbars';
import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/vs2015';

if (typeof window !== 'undefined') {
  SyntaxHighlighter.registerLanguage('htmlbars', html);
}

const CodeEditor = memo(
  ({ code, language = 'css' }: { code: string; language?: string }) => {
    return (
      <SyntaxHighlighter
        language={language}
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
  }
);

export default CodeEditor;
