export type ProductType = 'chaindesk' | 'cs' | 'chat' | 'blablaform';
import React, { useContext, useEffect } from 'react';
import { createContext } from 'react';

export const ProductContext = createContext('chaindesk' as ProductType);

export const getProductFromHostname = (hostname?: string): ProductType => {
  if (!hostname) {
    return 'chaindesk';
  }

  if (
    ['cs.chaindesk.ai', 'cs.localhost', 'cs.localhost:3000'].includes(hostname)
  ) {
    return 'cs';
  } else if (
    ['chat.chaindesk.ai', 'chat.localhost', 'chat.localhost:3000'].includes(
      hostname
    )
  ) {
    return 'chat';
  }
  // ['agents.localhost', 'localhost'].includes(window.location.hostname)
  else {
    return 'chaindesk';
  }
};

const useProduct = () => {
  const product = useContext(ProductContext);

  return {
    product,
  };
};

export default useProduct;
