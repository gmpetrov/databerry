import 'property-information'; // https://github.com/remarkjs/react-markdown/issues/747#issuecomment-1674799817

import clsx from 'clsx';
import { motion } from 'framer-motion';
import React, { memo, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
// import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { cn } from '@chaindesk/ui/utils/cn';
import CopyButton from './CopyButton';

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
          'text-sm break-words prose-p:leading-relaxed prose-pre:p-0',
          'max-w-full',
          className
        )}
        components={{
          // https://github.com/remarkjs/react-markdown#use-custom-components-syntax-highlight
          code({ className, ...props }) {
            const hasLang = /language-(\w+)/.exec(className || '');
            return hasLang ? (
              <SyntaxHighlighter
                style={oneDark}
                language={hasLang[1]}
                PreTag="div"
                className="w-full"
                showLineNumbers={true}
                useInlineStyles={true}
              >
                {String(props.children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code
                className={className}
                {...props}
                style={{ width: '100%' }}
              />
            );
          },
          pre: (pre) => {
            const codeChunk = (pre as any).node.children[0].children[0]
              .value as string;

            // eslint-disable-next-line react-hooks/rules-of-hooks
            // const [copyTip, setCopyTip] = React.useState('Copy code');

            // const language =
            //   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
            //   (pre as any).children[0]?.props.className.replace(
            //     /language-/g,
            //     ''
            //   ) as string;

            return (
              <div className="relative overflow-x-hidden">
                <CopyButton
                  text={codeChunk}
                  className="absolute z-40 top-5 right-2 tooltip tooltip-left"
                />
                {/* <span
                  style={{
                    bottom: 0,
                    right: 0,
                  }}
                  className="absolute z-40 p-1 mb-5 mr-1 text-xs uppercase rounded-lg bg-base-content/40 text-base-100 backdrop-blur-sm"
                >
                  {language}
                </span> */}
                <pre {...pre}></pre>
              </div>
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
