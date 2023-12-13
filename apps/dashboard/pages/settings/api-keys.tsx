import AddIcon from '@mui/icons-material/Add';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import Alert from '@mui/joy/Alert';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR from 'swr';

import SettingsLayout from '@app/components/SettingsLayout';
import SettingCard from '@app/components/ui/SettingCard';
import useStateReducer from '@app/hooks/useStateReducer';
import { getApiKeys } from '@app/pages/api/accounts/api-keys';

import accountConfig from '@chaindesk/lib/account-config';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { withAuth } from '@chaindesk/lib/withAuth';
import { Prisma, SubscriptionPlan } from '@chaindesk/prisma';

export default function ApiKeysPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [state, setState] = useStateReducer({
    isLoadingCreateApiKey: false,
    isLoadingDeleteApiKey: false,
  });

  const getApiKeysQuery = useSWR<Prisma.PromiseReturnType<typeof getApiKeys>>(
    '/api/accounts/api-keys',
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  const handleCreatApiKey = async () => {
    try {
      setState({
        isLoadingCreateApiKey: true,
      });

      await axios.post(`/api/accounts/api-keys`);

      getApiKeysQuery.mutate();
    } catch (err) {
      console.log(err);
    } finally {
      setState({
        isLoadingCreateApiKey: false,
      });
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    try {
      if (getApiKeysQuery?.data?.length === 1) {
        return alert('You must have at least one api key');
      }

      if (window.confirm('Are you sure you want to delete this api key?')) {
        setState({
          isLoadingDeleteApiKey: true,
        });

        await axios.delete(`/api/accounts/api-keys`, {
          data: {
            apiKeyId: id,
          },
        });

        getApiKeysQuery.mutate();
      }
    } catch (err) {
      const message = (err as any)?.response?.data?.error || err;
      console.log(message);
      alert(message);
    } finally {
      setState({
        isLoadingDeleteApiKey: false,
      });
    }
  };

  if (!session?.organization) {
    return null;
  }

  return (
    <Stack>
      <Box id="api-keys">
        <SettingCard
          title="API Keys"
          description="Use the api key to access the Chaindesk API"
          cardProps={{
            sx: { maxWidth: 'md', mx: 'auto' },
          }}
          disableSubmitButton
        >
          <Stack direction={'column'} gap={2} mt={2}>
            <Alert
              color="neutral"
              startDecorator={<HelpOutlineRoundedIcon />}
              endDecorator={
                <Link href="https://docs.chaindesk.ai" target="_blank">
                  <Button
                    variant="plain"
                    size="sm"
                    endDecorator={<ArrowForwardRoundedIcon />}
                  >
                    Documentation
                  </Button>
                </Link>
              }
            >
              Learn more about the Datatberry API
            </Alert>
            {getApiKeysQuery?.data?.map((each) => (
              <>
                <Stack
                  key={each.id}
                  direction={'row'}
                  gap={2}
                  onClick={() => {
                    navigator.clipboard.writeText(each.key);
                    toast.success('Copied!', {
                      position: 'bottom-center',
                    });
                  }}
                >
                  <Alert
                    color="neutral"
                    sx={{
                      width: '100%',
                      cursor: 'copy',
                    }}
                  >
                    {each.key}
                  </Alert>

                  <IconButton
                    color="danger"
                    variant="outlined"
                    onClick={() => handleDeleteApiKey(each.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </>
            ))}
          </Stack>

          <Stack>
            <Button
              startDecorator={<AddIcon />}
              sx={{ mt: 3, ml: 'auto' }}
              variant="outlined"
              onClick={handleCreatApiKey}
            >
              Create API Key
            </Button>
          </Stack>
        </SettingCard>
      </Box>
    </Stack>
  );
}

ApiKeysPage.getLayout = function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

// export const getServerSideProps = withAuth(
//   async (ctx: GetServerSidePropsContext) => {
//     return {
//       props: {},
//     };
//   }
// );
