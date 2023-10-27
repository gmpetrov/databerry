import ErrorIcon from '@mui/icons-material/Error';
import Button from '@mui/joy/Button';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import FeedbackCard from '@app/components/FeedbackCard';

type UrlQueries = {
  error: string;
  [key: string]: unknown;
};

function AuthError() {
  const router = useRouter();
  const [errorType, setErrorType] = useState('');

  // watch router, query only available after hydration
  useEffect(() => {
    setErrorType((router.query as UrlQueries).error);
  }, [router.query]);

  function Cta() {
    return (
      <Link href="/signin">
        <Button>Sign in</Button>
      </Link>
    );
  }

  switch (errorType) {
    case 'Verification':
      return (
        <FeedbackCard
          Icon={<ErrorIcon />}
          header={'Unable to sign in'}
          description={
            'The sigin-in link have been used already or it may have expired.'
          }
          Cta={<Cta />}
        />
      );
    default:
      return (
        <FeedbackCard
          Icon={<ErrorIcon />}
          header={'An Error Occured!'}
          description={
            'An error occured during authentication, try sign-in again.'
          }
          Cta={<Cta />}
        />
      );
  }
}
export default AuthError;
