import toast from 'react-hot-toast';

const writeClipboard = ({
  content,
  toastMessage,
  toastConfig,
}: {
  content: string;
  toastMessage?: string;
  toastConfig?: Parameters<typeof toast.success>[1];
}) => {
  navigator.clipboard.writeText(content);
  toast.success(toastMessage || 'Copied!', {
    position: 'bottom-center',
    ...toastConfig,
  });
};

export default writeClipboard;
