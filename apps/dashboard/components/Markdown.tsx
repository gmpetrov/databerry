import 'property-information'; // https://github.com/remarkjs/react-markdown/issues/747#issuecomment-1674799817

import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
// import ReactMarkdown from 'react-markdown';
import { useRemark } from 'react-remark';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import extractUniqueRootLinks from '@chaindesk/lib/extract-unique-links';

import LinkPreviewer from './LinkPreviewer';

type Props = any & {};

function Markdown({ children, className, ...otherProps }: Props) {
  if (!children) {
    return null;
  }

  const links =
    otherProps.from === 'agent' ? extractUniqueRootLinks(children) : [];

  return (
    <>
      <ReactMarkdown
        {...otherProps}
        className={clsx(
          'prose-sm prose dark:prose-invert',
          'prose-p:leading-relaxed prose-pre:p-0 break-words text-sm',
          className
        )}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {children}
      </ReactMarkdown>
      {links?.map((link, i) => (
        <LinkPreviewer key={i} href={link} />
      ))}
    </>
  );
}

export default Markdown;
