import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, Button, Card, Chip, Stack, Typography } from '@mui/joy';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import axios from 'axios';
import cuid from 'cuid';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { ReactElement } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import Layout from '@app/components/Layout';
import { getProductFromHostname } from '@app/hooks/useProduct';

import { generateActionFetcher, HTTP_METHOD } from '@chaindesk/lib/swr-fetcher';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { CreateFormSchema } from '@chaindesk/lib/types/dtos';
import { withAuth } from '@chaindesk/lib/withAuth';
import { Prisma } from '@chaindesk/prisma';

import { createForm, getForms } from '../api/forms';

export const isEmpty = (obj: any) => Object?.keys(obj || {}).length === 0;

export default function FormsPage() {
  const router = useRouter();
  const getFormsQuery = useSWR<Prisma.PromiseReturnType<typeof getForms>>(
    '/api/forms',
    fetcher
  );

  const formMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof createForm>
  >('api/forms/', generateActionFetcher(HTTP_METHOD.POST)<CreateFormSchema>);

  const onSubmit = async () => {
    try {
      await toast.promise(
        formMutation.trigger({
          name: 'untitled',
          draftConfig: {
            fields: [
              {
                id: cuid(),
                required: false,
                fieldName: 'fullname',
              },
              {
                id: cuid(),
                required: false,
                fieldName: 'email',
              },
            ],
          },
        } as any),
        {
          loading: 'Creating empty form...',
          success: 'Created!',
          error: 'Something went wrong',
        }
      );

      getFormsQuery.mutate();
    } catch (err) {
      console.log('error', err);
    }
  };
  const handleDeleteForm = async (formId: string) => {
    try {
      await toast.promise(axios.delete(`api/forms/${formId}/admin`), {
        loading: 'Processing',
        success: 'Deleted!',
        error: 'Something went wrong',
      });
      getFormsQuery.mutate();
    } catch (err) {
      console.log('error', err);
    }
  };

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          width: 'auto',
        }}
      >
        <Button onClick={onSubmit} endDecorator={<AddIcon />}>
          Create New From
        </Button>
      </Box>
      <Box>
        <Typography level="h4">My Forms</Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        }}
      >
        {getFormsQuery?.data?.map((form, index) => (
          <Link key={form.id} href={`${RouteNames.FORMS}/${form.id}/admin`}>
            <Card
              key={index}
              variant="outlined"
              sx={{
                padding: 3,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontWeight: 500 }}>{form.name}</Typography>
                <Chip
                  size={'sm'}
                  variant="soft"
                  color={isEmpty(form?.publishedConfig) ? 'warning' : 'success'}
                >
                  {isEmpty(form?.publishedConfig) ? 'Draft' : 'Published'}
                </Chip>
              </Box>
              <Box
                mt={2}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography>{form.conversations?.length} responses</Typography>
                <Dropdown>
                  <MenuButton
                    sx={{ background: 'transparent', border: 0, p: 0 }}
                    onClick={(e) => {
                      e?.preventDefault();
                      e?.stopPropagation();
                    }}
                  >
                    <MoreVertIcon />
                  </MenuButton>
                  <Menu sx={{}}>
                    <MenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteForm(form.id);
                      }}
                    >
                      Delete
                    </MenuItem>
                  </Menu>
                </Dropdown>
              </Box>
            </Card>
          </Link>
        ))}
      </Box>
    </Stack>
  );
}

FormsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {
        product: getProductFromHostname(ctx?.req?.headers?.host),
      },
    };
  }
);
