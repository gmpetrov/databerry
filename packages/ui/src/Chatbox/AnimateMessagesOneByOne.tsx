import { ChatMessage } from '@chaindesk/lib/types';
import React from 'react';
import { useCallback, useState } from 'react';
import Message from './ChatMessage';

const AnimateMessagesOneByOnes = (props: { messages: ChatMessage[] }) => {
  const [counter, setCounter] = useState(0);
  const handleAnimationComplete = useCallback(() => {
    setCounter(counter + 1);
  }, [counter]);
  return (
    <React.Fragment>
      {props.messages.map((each, index) =>
        index <= counter ? (
          <React.Fragment key={index}>
            <Message
              message={each}
              withTextAnimation
              onTextAnimationComplete={handleAnimationComplete}
            />
          </React.Fragment>
        ) : null
      )}
    </React.Fragment>
  );
};
export default AnimateMessagesOneByOnes;
