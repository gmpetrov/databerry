import clsx from 'clsx';
import React, { useEffect } from 'react';
// import ReactMarkdown from 'react-markdown';
import { useRemark } from 'react-remark';
import remarkGfm from 'remark-gfm';

type Props = any & {};

function Markdown({ children, className, ...otherProps }: Props) {
  // Using useRemark hook as a workaround for the Shadow dom bug with <ReactMarkdown /> component
  const [reactContent, setMarkdownSource] = useRemark({
    remarkPlugins: [],
  });

  useEffect(() => {
    setMarkdownSource(children);
  }, [children]);

  return (
    // <ReactMarkdown
    //   className={clsx('prose-sm prose dark:prose-invert', className)}
    //   remarkPlugins={[remarkGfm]}
    //   // linkTarget={'_blank'}
    //   {...otherProps}
    //   sourc
    // >
    //   {children}
    //   {/* ![image](https://i.giphy.com/media/d8L0LCmpEG1aTILGVL/giphy.gif) */}
    // </ReactMarkdown>

    <div
      className={clsx(
        'prose-sm prose dark:prose-invert',
        'prose-p:leading-relaxed prose-pre:p-0 break-words text-sm',
        className
      )}
    >
      {reactContent}
    </div>
  );
}

export default Markdown;
