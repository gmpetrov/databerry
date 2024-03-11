import 'property-information'; // https://github.com/remarkjs/react-markdown/issues/747#issuecomment-1674799817

import clsx from 'clsx';
import { motion } from 'framer-motion';
import React, { memo, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
// import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { cn } from '@chaindesk/ui/utils/cn';

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
          className
        )}
        components={{
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
