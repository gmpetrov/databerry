import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CelebrationIcon from '@mui/icons-material/Celebration';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import * as jose from 'jose';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';

import FeedbackCard from '@app/components/FeedbackCard';
import Logo from '@app/components/Logo';

import { RouteNames } from '@chaindesk/lib/types';
import { withAuth } from '@chaindesk/lib/withAuth';
import { Organization } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

export default function AccountPage(props: {
  organizationId: string;
  organizationName: string;
}) {
  const { data: session, update } = useSession();
  const router = useRouter();

  function Cta() {
    return (
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
    );
  }

  return (
    <FeedbackCard
      Icon={<CelebrationIcon />}
      header={'welcome aboard!'}
      description={`You are now a member of ${props.organizationName}`}
      Cta={<Cta />}
      isConfettiActive
    />
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
