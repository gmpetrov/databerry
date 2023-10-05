import React, { ComponentProps, useCallback, useEffect, useMemo } from 'react';

import AppModal from '@app/components/ui/AppModal';

function useModal() {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const component = useMemo(() => {
    return (props: ComponentProps<typeof AppModal>) => (
      <AppModal
        {...props}
        modalProps={{
          open: isOpen,
          onClose: close,
        }}
      />
    );
  }, [isOpen, close]);

  return {
    isOpen,
    setIsOpen,
    open,
    close,
    component,
  };
}

export default useModal;
