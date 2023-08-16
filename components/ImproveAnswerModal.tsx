import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import Alert from '@mui/joy/Alert';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CircularProgress from '@mui/joy/CircularProgress';
import Modal from '@mui/joy/Modal';
import Stack from '@mui/joy/Stack';
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import React from 'react';
import useSWR from 'swr';

import { getAgent } from '@app/pages/api/agents/[id]';
import { getMessage } from '@app/pages/api/messages/[messageId]';
import { RouteNames } from '@app/types';
import { fetcher } from '@app/utils/swr-fetcher';

import QAForm from './DatasourceForms/QAForm';

type Props = {
  messageId: string;
  isOpen?: boolean;
  handleCloseModal?: () => any;
};

function ImproveAnswerModal(props: Props) {
  const [currentDatastoreId, setCurrentDatastoreId] = React.useState('');
  const getAgentQuery = useSWR<Prisma.PromiseReturnType<typeof getMessage>>(
    `/api/messages/${props.messageId}`,
    fetcher,
    {
      onSuccess: (data) => {
        setCurrentDatastoreId(
          data?.conversation?.agent?.tools?.[0]?.datastoreId || ''
        );
      },
    }
  );

  const hasNoDatastore =
    !getAgentQuery.isLoading &&
    !getAgentQuery.data?.conversation?.agent?.tools?.find(
      (one) => !!one.datastoreId
    );

  return (
    <Modal
      open={!!props.messageId}
      onClose={props.handleCloseModal}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
        height: '100vh',
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 'sm',
          maxHeight: '100%',
          overflowY: 'auto',
          //   my: 2,
        }}
      >
        {getAgentQuery.isLoading ? (
          <CircularProgress sx={{ mx: 'auto' }} />
        ) : hasNoDatastore ? (
          <Stack gap={3}>
            <Alert color="warning">
              This agent has no datastore. Please create a datastore first.
            </Alert>

            <Link href={RouteNames.DATASTORES} className="ml-auto">
              <Button>Create Datastore</Button>
            </Link>
          </Stack>
        ) : (
          currentDatastoreId && (
            <Stack>
              <Alert
                color="primary"
                variant="soft"
                startDecorator={<InfoRoundedIcon />}
              >
                This action will add a new Q&A Datasource to your Datastore.
              </Alert>
              <QAForm
                key={currentDatastoreId}
                onSubmitSuccess={props.handleCloseModal}
                defaultValues={
                  {
                    datastoreId: currentDatastoreId,
                  } as any
                }
              ></QAForm>
            </Stack>
          )
        )}
      </Card>
    </Modal>
  );
}

export default ImproveAnswerModal;
