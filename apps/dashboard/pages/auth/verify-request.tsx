import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';

import FeedbackCard from '@app/components/FeedbackCard';

function VerifyRequest() {
  return (
    <FeedbackCard
      Icon={<MarkEmailUnreadIcon />}
      header={'Check your email'}
      description={'A sign in link has been sent to your email address.'}
    />
  );
}
export default VerifyRequest;
