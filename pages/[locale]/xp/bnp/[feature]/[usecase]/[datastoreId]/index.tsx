import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  ColorPaletteProp,
  FormLabel,
  Input,
  Modal,
  Option,
  Select,
  Sheet,
} from '@mui/joy';
import Box from '@mui/joy/Box';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import Tab from '@mui/joy/Tab';
import TabList from '@mui/joy/TabList';
import Tabs from '@mui/joy/Tabs';
import Textarea from '@mui/joy/Textarea';
import Typography from '@mui/joy/Typography';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { ConversationChannel, Prisma } from '@prisma/client';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { z } from 'zod';

import ChatBoxBNP from '@app/components/ChatBoxBNP';
import CreateDatastoreModal from '@app/components/CreateDatastoreModal';
import Layout from '@app/components/Layout';
import UsageLimitModal from '@app/components/UsageLimitModal';
import useAgentChat from '@app/hooks/useAgentChat';
import useGetDatastoreQuery from '@app/hooks/useGetDatastoreQuery';
import useStateReducer from '@app/hooks/useStateReducer';
import { getDatastores } from '@app/pages/api/datastores';
import { getDatastore } from '@app/pages/api/datastores/[id]';
import { RouteNames } from '@app/types';
import { XPBNPLabels } from '@app/utils/config';
import guardDataProcessingUsage from '@app/utils/guard-data-processing-usage';
import { fetcher } from '@app/utils/swr-fetcher';
import { withAuth } from '@app/utils/withAuth';

const CreateDatasourceModal = dynamic(
  () => import('@app/components/CreateDatasourceModal'),
  {
    ssr: false,
  }
);

const DatastoreSettings = dynamic(
  () => import('@app/components/DatastoreSettings'),
  {
    ssr: false,
  }
);

const Datasources = dynamic(() => import('@app/components/Datasources'), {
  ssr: false,
});

const EvalSchema = z.object({
  score_1: z.string().min(0).max(5),
  score_2: z.string().min(0).max(5),
  score_3: z.string().min(0).max(5),
  comment: z.string().optional(),
});

const EvalModal = (props: {
  handleClose: any;
  isOpen: boolean;
  result: string;
  useCase: string;
  feature: string;
  prompt: string;
  promptType: string;
  datastoreId: string;
}) => {
  const [state, setState] = useStateReducer({
    isLoading: false,
  });
  const methods = useForm<z.infer<typeof EvalSchema>>({
    resolver: zodResolver(EvalSchema),
  });

  const onSubmit = async (values: z.infer<typeof EvalSchema>) => {
    console.log('values', values);

    const payload = {
      ...values,
      result: props.result,
      name: localStorage.getItem('userName'),
      useCase: props.useCase,
      feature: props.feature,
      promptType: props.promptType,
      prompt: props.prompt,
    };

    console.log('payload', payload);
    setState({
      isLoading: true,
    });

    await axios.post(`/api/xp/bnp/eval`, payload);

    await axios.delete(`/api/xp/bnp/history`),
      {
        datastoreId: props.datastoreId,
      };

    props?.handleClose();
    methods?.reset();

    setState({
      isLoading: false,
    });

    window.location.reload();
  };

  console.log('methods', methods.formState.errors);

  return (
    <Modal
      onClose={props.handleClose}
      open={props.isOpen!}
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: 600,
          maxWidth: '100%',
          borderRadius: 'md',
          p: 3,
          boxShadow: 'lg',
        }}
      >
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Stack gap={2}>
            <FormControl>
              <FormLabel>Score 1 (0-5)</FormLabel>
              <Input
                {...methods.register('score_1')}
                type="number"
                slotProps={{
                  input: {
                    min: 0,
                    max: 5,
                  },
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Score 2 (0-5)</FormLabel>
              <Input
                {...methods.register('score_2')}
                type="number"
                slotProps={{
                  input: {
                    min: 0,
                    max: 5,
                  },
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Score 3 (0-5)</FormLabel>
              <Input
                {...methods.register('score_3')}
                type="number"
                slotProps={{
                  input: {
                    min: 0,
                    max: 5,
                  },
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Commentaire</FormLabel>
              <Textarea
                {...methods.register('comment')}
                minRows={4}
                maxRows={10}
              />
            </FormControl>

            <Divider sx={{ mt: 2 }}></Divider>

            <Button
              type="submit"
              color="primary"
              sx={{ ml: 'auto' }}
              loading={state.isLoading}
            >
              Valider
            </Button>
          </Stack>
        </form>
      </Sheet>
    </Modal>
  );
};

const prompts = {
  writing: {
    libre: [],
    auto: ['Ecrit un poème comme molière sur databerry'],
    assisté: [
      'Rédige un résumé de ... lignes sans aucun exemple du document ...',
      'Rédige un résumé de ... du document ... Avec à la fin une réflexion sur un des sujets abordés',
    ],
  },
  qa: {
    libre: [],
    auto: [],
    assisté: [],
  },
  summary: {
    libre: [],
    auto: ['Ecrit un poème comme molière sur databerry'],
    assisté: [
      'Rédige un résumé de ... lignes sans aucun exemple du document ...',
      'Rédige un résumé de ... du document ... Avec à la fin une réflexion sur un des sujets abordés',
    ],
  },
};

const SearchBNP = (props: {
  datastoreId: string;
  feature: 'writing' | 'qa' | 'summary';
}) => {
  const router = useRouter();
  const [state, setState] = useStateReducer({
    isEvalModalOpen: false,
    promptType: undefined as 'libre' | 'auto' | 'assisté' | undefined,
    prompt: '',
  });
  const { history, handleChatSubmit } = useAgentChat({
    queryAgentURL: `/api/xp/bnp/search`,
    queryHistoryURL: '/api/xp/bnp/history',
    channel: ConversationChannel.website,
    queryBody: {
      datastoreId: props.datastoreId,
    },
  });

  React.useEffect(() => {
    if (state.prompt) {
    }
  }, [state.prompt]);

  return (
    <>
      <Stack>
        {state.promptType && (
          <Chip sx={{ mr: 'auto' }} variant="outlined" color="neutral">
            Type de prompt: <strong>{state.promptType}</strong>
          </Chip>
        )}
        <Stack direction="row">
          {/* <Button
            sx={{ mr: 'auto' }}
            color="warning"
            variant="outlined"
            onClick={async () => {
              await axios.delete(`/api/xp/bnp/history`),
                {
                  datastoreId: props.datastoreId,
                };

              window.location.reload();
            }}
          >
            Reset Prompt
          </Button> */}
          {history.length > 0 && (
            <Button
              sx={{ ml: 'auto' }}
              onClick={() => {
                setState({ isEvalModalOpen: true });
              }}
            >
              Evaluer
            </Button>
          )}
        </Stack>

        <Box
          sx={{
            height: 'calc(100vh - 200px)',
            maxHeight: '680px',
          }}
        >
          <ChatBoxBNP
            promptType={state.promptType}
            prompt={state.prompt}
            messages={history}
            onSubmit={handleChatSubmit}
            multiline
            // messageTemplates={config.messageTemplates}
            // initialMessage={config.initialMessage}
          />
        </Box>
      </Stack>
      <EvalModal
        datastoreId={props.datastoreId}
        prompt={state.prompt}
        promptType={state.promptType!}
        feature={router.query.feature as string}
        useCase={router.query.usecase as string}
        isOpen={state.isEvalModalOpen}
        handleClose={() => setState({ isEvalModalOpen: false })}
        result={history
          ?.map((each) => `${each.from}: ${each.message}`)
          .join('\n')}
      />

      <Modal
        onClose={() =>
          setState({
            promptType: undefined,
            prompt: '',
          })
        }
        open={!state.promptType}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 2,
        }}
      >
        <Sheet
          variant="outlined"
          sx={{
            width: 600,
            maxWidth: '100%',
            height: '100%',
            overflowY: 'scroll',

            borderRadius: 'md',
            p: 3,
            boxShadow: 'lg',
          }}
        >
          <Button
            color="warning"
            startDecorator={<ArrowBackRoundedIcon />}
            onClick={() => router.push('/xp/bnp')}
          >
            Nouvel Usage
          </Button>

          <Divider sx={{ my: 4 }}></Divider>

          <Typography mb={4} level="h5">
            Type de Prompt
          </Typography>
          <Stack>
            <RadioGroup
              defaultValue="medium"
              name="radio-buttons-group"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                const type = value?.split('_')?.[0];
                const index = value?.split('_')?.[1];

                const prompt =
                  (prompts as any)?.[props.feature]?.[type]?.[index || 0] || '';

                setState({
                  promptType: type as any,
                  prompt,
                });
              }}
            >
              <Stack gap={2}>
                {['writing', 'summary'].includes(props.feature) && (
                  <>
                    <Radio value="auto" label="Auto" size="lg" />
                    <Divider></Divider>
                  </>
                )}

                {['writing', 'summary'].includes(props.feature) && (
                  <>
                    <Typography>Assisté</Typography>
                    <Stack gap={1}>
                      {prompts[props.feature]['assisté'].map((each, index) => (
                        <Radio
                          key={index}
                          value={`assisté_${index}`}
                          label={each}
                          size="lg"
                        />
                      ))}
                    </Stack>

                    <Divider></Divider>
                  </>
                )}

                {['qa', 'writing', 'summary'].includes(props.feature) && (
                  <Radio value="libre" label="Libre" size="lg" />
                )}
              </Stack>
            </RadioGroup>
          </Stack>
        </Sheet>
      </Modal>
    </>
  );
};

export default function XPBNPFeature() {
  const router = useRouter();
  const useCase = router.query.usecase as string;
  const datastoreId = router.query.datastoreId as string;
  const feature = router.query.feature as 'qa' | 'writing' | 'summary';

  const { data: session, status } = useSession();
  const [state, setState] = useStateReducer({
    userName: undefined as string | undefined,

    currentDatastore: undefined as
      | Prisma.PromiseReturnType<typeof getDatastores>[0]
      | undefined,

    isCreateDatastoreModalOpen: false,
  });

  const getDatastoreQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatastore>
  >(`/api/datastores/${datastoreId}`, fetcher);

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        px: {
          xs: 2,
          md: 6,
        },
        pb: {
          xs: 2,
          sm: 2,
          md: 3,
        },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        // height: '100dvh',
        width: '100%',
        gap: 1,
      })}
    >
      <Stack gap={1}>
        <Breadcrumbs separator="›">
          <Link href="/xp/bnp">
            <Typography color="primary">XP Home</Typography>
          </Link>
          <Link href={`/xp/bnp/${feature}`}>
            <Typography color="primary">
              {XPBNPLabels[feature] || feature}
            </Typography>
          </Link>
          <Link href={`/xp/bnp/${feature}/${useCase}`}>
            <Typography color="primary">{useCase}</Typography>
          </Link>
          <Typography>
            {getDatastoreQuery?.data?.name || datastoreId}
          </Typography>
        </Breadcrumbs>

        <Card
          sx={{ p: 4, maxWidth: 'lg', minHeight: '500px', overflow: 'visible' }}
          variant="outlined"
        >
          {feature && <SearchBNP feature={feature} datastoreId={datastoreId} />}
        </Card>
      </Stack>
    </Box>
  );
}

XPBNPFeature.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  }
);
