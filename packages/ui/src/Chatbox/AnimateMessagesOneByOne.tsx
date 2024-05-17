import { ChatMessage } from '@chaindesk/lib/types';
import React from 'react';
import { useCallback, useState } from 'react';
import Message from './ChatMessage';

const AnimateMessagesOneByOne = ({
  messages,
  shouldAnimate = true,
}: {
  messages: ChatMessage[];
  shouldAnimate?: boolean;
}) => {
  const [counter, setCounter] = useState(0);
  const handleAnimationComplete = useCallback(() => {
    setCounter(counter + 1);
  }, [counter]);
  return (
    <React.Fragment>
      {messages.map((each, index) =>
        index <= counter ? (
          <React.Fragment key={index}>
            <Message
              message={each}
              withTextAnimation
              onTextAnimationComplete={handleAnimationComplete}
              shouldAnimate={shouldAnimate}
            />
          </React.Fragment>
        ) : null
      )}
    </React.Fragment>
  );
};
export default AnimateMessagesOneByOne;
