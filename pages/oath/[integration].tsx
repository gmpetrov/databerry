import axios from 'axios';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

function Callback() {
  const router = useRouter();
  const { integration, code } = router.query;
  const { data: session, status } = useSession();

  const save = useCallback(async () => {
    try {
      await toast.promise(
        axios.post(`/api/integrations/${integration}/callback`, {
          code,
          userId: session?.user?.id,
        }),
        {
          loading: 'Updating...',
          success: 'Updated!',
          error: 'Something went wrong',
        }
      );
      window.close();
    } catch (e) {
      console.error(e);
    } finally {
    }
  }, [code, integration, session?.user?.id]);
  useEffect(() => {
    if (status == 'loading') return;
    save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1>Saving Your {integration} Integration...</h1>
      </div>
    </div>
  );
}

export default Callback;
