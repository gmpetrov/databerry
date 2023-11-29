import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import ModalDialog from '@mui/joy/ModalDialog';
import React, { ComponentProps } from 'react';

import SettingCard from './SettingCard';

type Props = {
  title?: string;
  description?: string;
  disableClose?: boolean;

  children?: React.ReactNode;
  modalProps?: Partial<ComponentProps<typeof Modal>>;
  dialogProps?: ComponentProps<typeof ModalDialog>;
};

export default React.forwardRef(function AppModal(
  {
    title,
    description,
    disableClose,
    dialogProps,
    modalProps,
    children,
  }: Props,
  ref
) {
  return (
    <Modal
      {...modalProps}
      ref={ref as any}
      open={!!modalProps?.open}
      onClose={modalProps?.onClose}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
        height: '100vh',

        ...modalProps?.sx,
      }}
    >
      <ModalDialog
        {...dialogProps}
        sx={{
          width: '100%',
          height: '100%',
          p: 0,
          border: 0,
          ...dialogProps?.sx,
        }}
      >
        <SettingCard
          title={title}
          description={description}
          disableSubmitButton
          cardProps={{
            sx: {
              height: '100%',
              overflowY: 'auto',
              width: '100%',
            },
          }}
        >
          {!disableClose && <ModalClose variant="plain" />}

          {children}
        </SettingCard>
      </ModalDialog>
    </Modal>
  );
});
