import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { Organization } from '@prisma/client';
import * as jose from 'jose';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';

import Logo from '@app/components/Logo';
import { RouteNames } from '@app/types';
import prisma from '@app/utils/prisma-client';
import { withAuth } from '@app/utils/withAuth';

export default function AccountPage(props: {
  organizationId: string;
  organizationName: string;
}) {
  const { data: session, update } = useSession();
  const router = useRouter();

  return (
    <Stack
      sx={{
        p: 2,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Card sx={{ maxWidth: 'sm' }} variant="outlined">
        <Stack gap={4} sx={{ p: 2 }}>
          <Stack direction="row" sx={{ mx: 'auto', alignItems: 'end' }} gap={1}>
            <Logo className="w-14 " />
            <Typography level="h2">Chaindesk</Typography>
          </Stack>

          <Typography level="title-lg" sx={{ textAlign: 'center' }}>
            🎉 You are now a member of{' '}
            <Typography sx={{ fontWeight: 'bold' }} color="primary">
              {' '}
              {`${props.organizationName}`}
            </Typography>
          </Typography>
        </Stack>

        <Divider></Divider>

        <Button
          onClick={async () => {
            if (props.organizationId) {
              await update({
                orgId: props.organizationId,
              });
            }

            router.push(RouteNames.AGENTS);
          }}
          endDecorator={<ArrowForwardRoundedIcon />}
          sx={{ ml: 'auto' }}
        >
          Continue to Dashboard
        </Button>
      </Card>
    </Stack>
  );
}

export const getServerSideProps = withAuth(
  async ({ req, res, query }: GetServerSidePropsContext) => {
    try {
      const session = (req as any)?.session as Session;

      const token = decodeURIComponent(query.token as string);
      const id = decodeURIComponent(query.id as string);

      const { payload } = await jose.jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );

      const membership = await prisma.membership.findUnique({
        where: {
          id,
        },
        include: {
          organization: true,
        },
      });

      if (membership?.invitedToken !== token) {
        throw new Error('Token does not match invitedToken');
      }

      await prisma.membership.update({
        where: {
          id,
        },
        data: {
          user: {
            connect: {
              id: session?.user?.id,
            },
          },
          invitedToken: null,
          invitedEmail: null,
          invitedName: null,
        },
        include: {
          organization: true,
        },
      });

      return {
        props: {
          organizationId: membership?.organizationId,
          organizationName: membership?.organization?.name,
        },
      };
    } catch (err) {
      console.error(err);
    }

    return {
      redirect: {
        destination: '/',
      },
    };
  }
);
