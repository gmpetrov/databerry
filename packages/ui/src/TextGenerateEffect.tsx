import { useEffect } from 'react';
import { motion, stagger, useAnimate } from 'framer-motion';
import { cn } from './utils/cn';

export const TextGenerateEffect = ({
  words,
  className,
}: {
  words: string;
  className?: string;
}) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(' ');
  useEffect(() => {
    animate(
      'span',
      {
        opacity: 1,
      },
      {
        duration: 2,
        delay: stagger(0.2),
      }
    );
  }, [scope.current]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className="text-black opacity-0 dark:text-white"
            >
              {word}{' '}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div
      className={cn(
        'font-bold tracking-wide leading-snug text-black dark:text-white',
        className
      )}
    >
      {renderWords()}
    </div>
  );
};
