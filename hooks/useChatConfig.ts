import React, { useCallback, useEffect } from 'react';

import useStateReducer from '@app/hooks/useStateReducer';

export type ChatConfigProps = {
  visitorId?: string;
  conversationId?: string;
};

const useChatConfig = (props?: ChatConfigProps) => {
  const [state, setState] = useStateReducer({
    visitorId: props?.visitorId || '',
    conversationId: props?.conversationId || '',
  });

  const setChatConfig = useCallback(
    ({ visitorId, conversationId }: ChatConfigProps) => {
      if (visitorId) {
        localStorage.setItem('visitorId', visitorId);
      }

      if (conversationId) {
        localStorage.setItem('conversationId', conversationId);
      }

      setState({
        visitorId,
        conversationId,
      });
    },
    [setState]
  );

  useEffect(() => {
    (async () => {
      if (typeof window !== 'undefined') {
        let vId = localStorage.getItem('visitorId') || props?.visitorId;
        let convId =
          localStorage.getItem('conversationId') || props?.conversationId;

        setState({
          visitorId: vId,
          conversationId: convId,
        });
      }
    })();
  }, [props?.conversationId, props?.visitorId]);

  return {
    ...state,
    setChatConfig,
  };
};

export default useChatConfig;
