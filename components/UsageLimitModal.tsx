import Modal from '@mui/joy/Modal';
import Typography from '@mui/joy/Typography';
import React from 'react';

type Props = {};

function UsageLimitModal({}: Props) {
  return (
    <Modal open={true}>
      <Typography>test</Typography>
    </Modal>
  );
}

export default UsageLimitModal;
