import 'property-information'; // https://github.com/remarkjs/react-markdown/issues/747#issuecomment-1674799817

import clsx from 'clsx';
import { motion } from 'framer-motion';
import React, { memo, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
// import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark as theme } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { cn } from '@chaindesk/ui/utils/cn';
import CopyButton from './CopyButton';
import Stack from '@mui/joy/Stack';

type Props = any & {
  animated?: boolean;
  onAnimateComplete?: (props?: any) => any;
};

function Markdown({
  children,
  className,
  animated,
  onAnimateComplete,
  ...otherProps
}: Props) {
  const Render = useMemo(() => {
    return (
      <ReactMarkdown
        {...otherProps}
        className={clsx(
          'prose-sm prose dark:prose-invert',
          'text-sm break-words prose-p:leading-relaxed prose-pre:p-0 prose-code:before:hidden prose-code:after:hidden prose-hr:my-4',
          'max-w-full',
          className
        )}
        components={{
          // https://github.com/remarkjs/react-markdown#use-custom-components-syntax-highlight
          code({ className, ...props }) {
            const lang = className?.replace?.('language-', '');

            const codeChunk = (props?.children as string) || '';

            return !!lang || (props as any)?.fromPre ? (
              <Stack
                sx={{
                  p: 0,
                }}
              >
                <Stack
                  direction={'row'}
                  sx={(t) => ({
                    alignItems: 'center',
                    background: t.colorSchemes.dark.palette.background.level1,
                    justifyContent: 'space-evenly',
                  })}
                >
                  <p
                    className="mx-auto"
                    style={{ opacity: 0.5, lineHeight: 0 }}
                  >
                    {lang || ''}
                  </p>
                  <CopyButton text={codeChunk} className="mr-2" />
                </Stack>
                <SyntaxHighlighter
                  style={theme}
                  language={lang || 'bash'}
                  PreTag="div"
                  className="w-full"
                  showLineNumbers={
                    (props as any)?.children?.includes('\n') ? true : false
                  }
                  useInlineStyles={true}
                  customStyle={{
                    lineHeight: '1.5',
                    fontSize: '1em',
                    borderTopRightRadius: '0px',
                    borderTopLeftRadius: '0px',
                    marginTop: '0px',
                  }}
                  codeTagProps={{
                    style: {
                      lineHeight: 'inherit',
                      fontSize: 'inherit',
                    },
                  }}
                >
                  {String(props.children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </Stack>
            ) : (
              <code
                className={clsx(
                  className,
                  'bg-purple-200 dark:bg-purple-900 py-0.5 px-1 rounded-md font-thin'
                )}
                {...props}
                style={{ width: '100%' }}
              />
            );
          },
          pre: ({ children, ...pre }) => {
            return (
              <Stack component="div" className="relative overflow-x-hidden">
                <pre {...pre} style={{ margin: 0 }}>
                  {React.cloneElement(children as any, {
                    fromPre: true,
                  })}
                </pre>
              </Stack>
            );
          },
          img: (props) => (
            <motion.img
              {...(props as any)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: { duration: 0.2, ease: 'easeInOut', bounce: 1 },
              }}
            ></motion.img>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          ...(animated
            ? {
                p: ({ children, ...props }) => {
                  const c =
                    typeof children === 'string'
                      ? children.split(' ')
                      : children;

                  return (
                    <motion.p
                      {...(props as any)}
                      variants={{
                        hidden: {},
                        visible: {
                          transition: {
                            staggerChildren: 0.08,
                            // staggerChildren: 2,
                            // delayChildren: 2,
                            // when: 'afterChildren',
                          },
                        },
                      }}
                      initial="hidden"
                      animate="visible"
                      onAnimationComplete={onAnimateComplete}
                    >
                      {Array.isArray(c)
                        ? c.map((each, index) => (
                            <motion.span
                              key={index}
                              variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                  opacity: 1,
                                  transition: {
                                    duration: 0.4,
                                  },
                                },
                              }}
                            >
                              {each}
                              {index < c.length - 1 ? ' ' : ''}
                            </motion.span>
                          ))
                        : children}
                    </motion.p>
                  );
                },
              }
            : {}),
        }}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {children}
      </ReactMarkdown>
    );
  }, [children, className, animated]);

  if (!children) {
    return null;
  }

  return Render;
}

export default Markdown;
