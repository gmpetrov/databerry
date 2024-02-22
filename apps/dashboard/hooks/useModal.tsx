import React, { ComponentProps, useCallback, useEffect, useMemo } from 'react';

import AppModal from '@app/components/ui/AppModal';
type Props = {
  disableClose?: boolean;
  onClose?(...args: any[]): any;
};

function useModal({ disableClose, onClose }: Props = {}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const close = useCallback(() => {
    onClose?.();
    setIsOpen(false);
  }, [setIsOpen]);

  const component = useMemo(() => {
    return (props: ComponentProps<typeof AppModal>) => (
      <AppModal
        {...props}
        disableClose={disableClose}
        modalProps={{
          open: isOpen,
          onClose: !!disableClose ? () => {} : close,
        }}
      />
    );
  }, [isOpen, close, disableClose]);

  return {
    isOpen,
    setIsOpen,
    open,
    close,
    component,
  };
}

export default useModal;
