import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import Alert from '@mui/joy/Alert';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CircularProgress from '@mui/joy/CircularProgress';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Modal from '@mui/joy/Modal';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import Link from 'next/link';
import React from 'react';
import useSWR from 'swr';

import { getAgent } from '@app/pages/api/agents/[id]';
import { getMessage } from '@app/pages/api/messages/[messageId]';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { Prisma } from '@chaindesk/prisma';

import QAForm from './DatasourceForms/QAForm';

type Props = {
  messageId: string;
  isOpen?: boolean;
  question?: string;
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

  const nbDatastores =
    getAgentQuery.data?.conversation?.agent?.tools?.filter(
      (one) => !!one.datastoreId
    )?.length || 0;

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

              {nbDatastores > 1 && (
                <FormControl sx={{ mt: 2 }}>
                  <FormLabel>Datastore</FormLabel>
                  <Select
                    value={currentDatastoreId}
                    onChange={(_, value) => {
                      setCurrentDatastoreId(value as string);
                    }}
                  >
                    {getAgentQuery.data?.conversation?.agent?.tools
                      ?.filter((one) => !!one.datastoreId)
                      .map((one) => (
                        <Option key={one.datastoreId} value={one.datastoreId}>
                          {one?.datastore?.name}
                        </Option>
                      ))}
                  </Select>
                </FormControl>
              )}
              <QAForm
                key={currentDatastoreId}
                onSubmitSuccess={props.handleCloseModal}
                defaultValues={
                  {
                    datastoreId: currentDatastoreId,
                    config: {
                      question: props.question,
                    },
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
