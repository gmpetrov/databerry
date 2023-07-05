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
import xpData from '@app/utils/xp-bnp-data.json';

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
  datastoreId?: string;
  datasourceName?: string;
  datastoreName?: string;
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
      datasourceName: props.datasourceName,
      datastoreName: props.datastoreName,
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

    await axios.delete(`/api/xp/bnp/history`, {
      data: {
        userName: localStorage.getItem('userName'),
      },
    });

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
              <FormLabel>
                {`${(xpData as any)[props.feature]?.score_1 || 'Score 1'}`}
                (0-5)
              </FormLabel>
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
              <FormLabel>
                {`${(xpData as any)[props.feature]?.score_2 || 'Score 2'}`}
                (0-5)
              </FormLabel>
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
              <FormLabel>
                {`${(xpData as any)[props.feature]?.score_3 || 'Score 3'}`}
                (0-5)
              </FormLabel>
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
    auto: ['Ecrit un poème comme molière sur chaindesk'],
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
    auto: ['Fait un résumé'],
    assisté: [
      'Rédige un résumé de ... lignes sans aucun exemple du document ...',
      'Rédige un résumé de ... du document ... Avec à la fin une réflexion sur un des sujets abordés',
    ],
  },
};

const SearchBNP = (props: {
  datastoreId?: string;
  feature: 'writing' | 'qa' | 'summary';
}) => {
  const router = useRouter();
  const [state, setState] = useStateReducer({
    isEvalModalOpen: false,
    promptType: undefined as 'libre' | 'auto' | 'assisté' | undefined,
    prompt: '',
    currentDatasourceId: undefined as string | undefined,
    userName: '',
  });

  let queryURL = `/api/xp/bnp/search`;

  if (props.feature === 'summary' || props.feature === 'writing') {
    queryURL = `/api/xp/bnp/summary`;
  }

  const getDatastoreQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatastore>
  >(
    props.datastoreId
      ? `/api/datastores/${props.datastoreId}?offset=${0}&limit=${100}`
      : null,
    fetcher
  );

  const { history, handleChatSubmit } = useAgentChat({
    queryAgentURL: queryURL,
    queryHistoryURL: state.userName
      ? `/api/xp/bnp/history?userName=${state.userName}`
      : undefined,
    channel: ConversationChannel.website,
    queryBody: {
      datastoreId: props.datastoreId,
      datasourceId: state.currentDatasourceId,
      userName: state.userName,
    },
  });

  React.useEffect(() => {
    setState({
      userName: localStorage.getItem('userName') || '',
    });
  }, []);

  let showChatBox = false;

  switch (props.feature) {
    case 'qa':
      showChatBox = true;
      break;
    case 'writing': {
      if (!props.datastoreId) {
        showChatBox = true;
      } else if (props.datastoreId && state.currentDatasourceId) {
        showChatBox = true;
      }
      break;
    }
    case 'summary':
      if (state.currentDatasourceId) {
        showChatBox = true;
      }
      break;
    default:
      break;
  }

  const datasourceName = React.useMemo(() => {
    if (state.currentDatasourceId) {
      const datasource = getDatastoreQuery?.data?.datasources?.find(
        (each) => each.id === state.currentDatasourceId
      );

      return datasource?.name;
    }
    return undefined;
  }, [state.currentDatasourceId, getDatastoreQuery?.data?.datasources]);

  const datastoreName = getDatastoreQuery?.data?.name;

  return (
    <>
      <Stack>
        <Stack direction={'row'} gap={2} sx={{ mb: 2 }}>
          {state.promptType && (
            <Chip sx={{}} variant="outlined" color="neutral">
              Type de prompt: <strong>{state.promptType}</strong>
            </Chip>
          )}

          {(props.feature === 'summary' ||
            (props.feature === 'writing' && props?.datastoreId)) && (
            <Select
              placeholder="Selectionner un Document"
              onChange={(_, value) => {
                if (!state.currentDatasourceId) {
                  setState({
                    currentDatasourceId: value as string,
                  });
                } else {
                  setState({
                    currentDatasourceId: undefined,
                  });

                  setTimeout(() => {
                    setState({
                      currentDatasourceId: value as string,
                    });
                  }, 500);
                }
              }}
            >
              {getDatastoreQuery?.data?.datasources?.map((datasource) => (
                <Option key={datasource.id} value={datasource.id}>
                  {datasource.name}
                </Option>
              ))}
            </Select>
          )}

          <Stack direction="row" gap={2} sx={{ ml: 'auto' }}>
            <Button
              sx={{ mr: 'auto' }}
              color="warning"
              variant="outlined"
              onClick={async () => {
                await axios.delete(`/api/xp/bnp/history`, {
                  data: {
                    userName: state.userName,
                  },
                });

                window.location.reload();
              }}
            >
              {`Supprimer l'historique`}
            </Button>
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
        </Stack>

        <Box
          sx={{
            height: 'calc(100vh - 200px)',
            maxHeight: '680px',
          }}
        >
          {showChatBox && (
            <ChatBoxBNP
              promptType={state.promptType}
              prompt={state.prompt}
              messages={history}
              onSubmit={handleChatSubmit}
              multiline
              // messageTemplates={config.messageTemplates}
              // initialMessage={config.initialMessage}
            />
          )}
        </Box>
      </Stack>
      <EvalModal
        datastoreId={props.datastoreId}
        datastoreName={datastoreName}
        datasourceName={datasourceName}
        prompt={state.prompt || history?.[0]?.message}
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
                  (xpData as any)?.[props.feature]?.['prompts']?.[type]?.[
                    index || 0
                  ]?.value || '';
                // (prompts as any)?.[props.feature]?.[type]?.[index || 0] || '';

                setState({
                  promptType: type as any,
                  prompt,
                });
              }}
            >
              <Stack gap={2}>
                {['summary'].includes(props.feature) && (
                  <>
                    <Radio value="auto" label="Auto" size="lg" />
                    <Divider></Divider>
                  </>
                )}

                {['writing', 'summary'].includes(props.feature) && (
                  <>
                    <Typography>Assisté</Typography>
                    <Stack gap={1}>
                      {xpData[props.feature]['prompts']['assisté'].map(
                        (each, index) => (
                          <Radio
                            key={index}
                            value={`assisté_${index}`}
                            label={each?.label}
                            size="lg"
                          />
                        )
                      )}
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
  const datastoreId = (
    router.query.datastoreId !== 'none' ? router.query.datastoreId : undefined
  ) as string | undefined;
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
  >(datastoreId ? `/api/datastores/${datastoreId}` : null, fetcher);

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
            {getDatastoreQuery?.data?.name || datastoreId || 'Sans Datastore'}
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
