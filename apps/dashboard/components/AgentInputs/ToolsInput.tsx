import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import EditIcon from '@mui/icons-material/Edit';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import Alert from '@mui/joy/Alert';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import cuid from 'cuid';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { useCallback, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import useSWR from 'swr';

import useModal from '@app/hooks/useModal';
import { getDatastores } from '@app/pages/api/datastores';

import agentToolFormat, {
  agentToolConfig,
  createTool,
  NormalizedTool,
} from '@chaindesk/lib/agent-tool-format';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { CreateAgentSchema, ToolSchema } from '@chaindesk/lib/types/dtos';
import {
  AppDatasource as Datasource,
  Form,
  Prisma,
  ToolType,
} from '@chaindesk/prisma';
import useDeepCompareEffect from '@chaindesk/ui/hooks/useDeepCompareEffect';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

import HttpToolForm, { HttpToolTestForm } from '../HttpToolForm';
import LeadCaptureToolForm from '../LeadCaptureToolForm';
import LeadCaptureToolFormInput from '../LeadCaptureToolForm/LeadCaptureToolFormInput';

import { EditFormToolInput, NewFormToolInput } from './FormToolInput';
import HttpToolInput from './HttpToolInput';
type Props = {
  onHttpToolClick?: (index: number) => any;
};

const CreateDatastoreModal = dynamic(
  () => import('@app/components/CreateDatastoreModal'),
  {
    ssr: false,
  }
);

type ToolCardProps = Partial<NormalizedTool> & {
  type: ToolType;
  mode: 'create' | 'edit';
  onDelete?(): any;
  onEdit?(): any;
  onCreate?(): any;
  link?: string;
};

const editableTools = ['form', 'http', 'lead_capture'];

const ToolCard = ({
  name,
  description,
  type,
  mode,
  link,
  onCreate,
  onDelete,
  onEdit,
}: ToolCardProps) => {
  return (
    <Card variant="outlined" sx={{ borderRadius: 10, width: '100%' }} size="sm">
      <Stack
        direction={'row'}
        alignItems={'center'}
        justifyContent="space-between"
        gap={2}
      >
        <Stack
          direction={'column'}
          spacing={0}
          width={'100%'}
          sx={{ maxWidth: '85%' }}
        >
          <Stack direction="row" spacing={2} alignItems={'center'}>
            <Stack sx={{ minWidth: 0 }}>
              {link ? (
                <Link href={link as unknown as URL}>
                  <Typography level="body-md">{name}</Typography>
                </Link>
              ) : (
                <Typography level="body-md">{name}</Typography>
              )}
            </Stack>
            {type && (
              <Stack>
                <Chip variant="soft" size="md" color="primary">
                  {type}
                </Chip>
              </Stack>
            )}
          </Stack>
          <Typography className="truncate" level="body-sm">
            {description}
          </Typography>
        </Stack>
        <Stack direction="row">
          {mode === 'edit' && (
            <>
              {editableTools.includes(type) && (
                <IconButton
                  variant="plain"
                  color="neutral"
                  size="md"
                  onClick={onEdit}
                >
                  <TuneRoundedIcon />
                </IconButton>
              )}

              <IconButton
                variant="plain"
                color="danger"
                size="md"
                onClick={onDelete}
              >
                <RemoveCircleOutlineRoundedIcon />
              </IconButton>
            </>
          )}

          {mode === 'create' && (
            <>
              <IconButton
                variant="plain"
                color="success"
                size="md"
                onClick={onCreate}
              >
                <AddCircleOutlineRoundedIcon />
              </IconButton>
            </>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

function ToolsInput({}: Props) {
  const { watch, setValue, formState, getValues } =
    useFormContext<CreateAgentSchema>();
  const [isCreateDatastoreModalOpen, setIsCreateDatastoreModalOpen] =
    useState(false);
  const btnSubmitRef = useRef<HTMLButtonElement>(null);
  const isToolValidRef = useRef(false);

  const [state, setState] = useStateReducer({
    currentToolIndex: -1,
    currentToolId: '',
  });

  const currentToolConfig = getValues([
    `tools.${state.currentToolIndex}.config.url`,
    `tools.${state.currentToolIndex}.config.body`,
    `tools.${state.currentToolIndex}.config.headers`,
    `tools.${state.currentToolIndex}.config.method`,
    `tools.${state.currentToolIndex}.config.pathVariables`,
    `tools.${state.currentToolIndex}.config.queryParameters`,
  ]);

  const newDatastoreModal = useModal();
  const newApiToolForm = useModal();
  const editApiToolForm = useModal({
    onClose: () => {
      isToolValidRef.current = false;
    },
  });
  const newFormToolModal = useModal();
  const editFormToolModal = useModal();
  const newLeadCaptureToolModal = useModal();
  const editLeadCaptureToolModal = useModal();
  const validateToolModal = useModal();

  const getDatastoresQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatastores>
  >('/api/datastores', fetcher);

  const tools = (watch('tools') || []) as Exclude<
    ToolSchema,
    { type: 'connector' } | { type: 'agent' }
  >[];

  const formattedTools = tools.map(agentToolFormat);

  const hasMarkAsResolved = !!tools.find(
    (tool) => tool.type === ToolType.mark_as_resolved
  );
  const hasRequestHuman = !!tools.find(
    (tool) => tool.type === ToolType.request_human
  );
  const hasLeadCapture = !!tools.find(
    (tool) => tool.type === ToolType.lead_capture
  );
  const getToolLink = (tool: Record<string, unknown>) => {
    switch (tool.type) {
      case ToolType.datastore:
        return `${RouteNames.DATASTORES}/${tool.datastoreId}`;
      case ToolType.form:
        return `${RouteNames.FORMS}/${tool.formId}/admin`;
      default:
        return undefined;
    }
  };

  const handleAddTool = useCallback(
    (payload: Parameters<typeof createTool>[0]) => {
      return setValue('tools', [...tools, createTool(payload)], {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [tools, setValue]
  );

  const handleToolEdit = ({
    tool,
    index,
  }: {
    tool: { type: ToolType; id?: string };
    index: number;
  }) => {
    setState({ currentToolIndex: index });
    switch (tool.type) {
      case 'http':
        editApiToolForm.open();
        break;
      case 'lead_capture':
        editLeadCaptureToolModal.open();
        break;
      case 'form':
        editFormToolModal.open();
        break;
      default:
        break;
    }
  };

  const handleDeleteTool = (toolId: string) => {
    setValue(
      'tools',
      tools.filter((each) => each.id !== toolId),
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  // config changed, allow re-test.
  useDeepCompareEffect(() => {
    isToolValidRef.current = false;
  }, [currentToolConfig]);

  return (
    <Stack gap={1}>
      {tools.length === 0 && (
        <Alert
          startDecorator={<WarningAmberRoundedIcon />}
          size="sm"
          color="warning"
          variant="soft"
        >
          Train your Agent with custom data by connecting it to a Datastore
          below.
        </Alert>
      )}

      <Stack direction={'row'} gap={1} flexWrap={'wrap'}>
        {formattedTools.map((tool, index) => (
          <ToolCard
            key={tool.id}
            id={tool.id}
            type={tool.type}
            name={tool.name!}
            description={tool.description!}
            mode="edit"
            onEdit={() =>
              handleToolEdit({
                tool: { type: tool.type, id: tool.id },
                index,
              })
            }
            onDelete={() => handleDeleteTool(tool.id)}
            link={getToolLink(tool)}
          />
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <ToolCard
        id="datastore-tool"
        type={ToolType.datastore}
        name={agentToolConfig.datastore.title}
        description={agentToolConfig.datastore.description}
        mode="create"
        onCreate={newDatastoreModal.open}
      />

      <ToolCard
        id="http-tool"
        type={ToolType.http}
        name={agentToolConfig.http.title}
        description={agentToolConfig.http.description}
        mode="create"
        onCreate={newApiToolForm.open}
      />

      <ToolCard
        id="form-tool"
        type={ToolType.form}
        name={agentToolConfig.form.title}
        description={agentToolConfig.form.description}
        mode="create"
        onCreate={newFormToolModal.open}
      />

      {!hasMarkAsResolved && (
        <ToolCard
          id="form-tool"
          type={ToolType.mark_as_resolved}
          name={agentToolConfig.mark_as_resolved.title}
          description={agentToolConfig.mark_as_resolved.description}
          mode="create"
          onCreate={() => {
            handleAddTool({
              type: ToolType.mark_as_resolved,
            });
          }}
        />
      )}

      {!hasRequestHuman && (
        <ToolCard
          id="form-tool"
          type={ToolType.request_human}
          mode="create"
          name={agentToolConfig.request_human.title}
          description={agentToolConfig.request_human.description}
          onCreate={() =>
            handleAddTool({
              type: ToolType.request_human,
            })
          }
        />
      )}

      {!hasLeadCapture && (
        <ToolCard
          type={ToolType.lead_capture}
          id="form-tool"
          name={agentToolConfig.lead_capture.title}
          description={agentToolConfig.lead_capture.description}
          mode="create"
          onCreate={newLeadCaptureToolModal.open}
        />
      )}

      <newDatastoreModal.component
        title={agentToolConfig.datastore.title}
        description={agentToolConfig.datastore.description}
        dialogProps={{
          sx: {
            maxWidth: 'sm',
            height: 'auto',
          },
        }}
      >
        <Stack direction="row" width="100%" gap={1}>
          <Select
            sx={{ width: '100%' }}
            // value={tools[0]?.datastoreId || ''}
            placeholder="Choose a Datastore"
            onChange={(_, value) => {
              const datastore = getDatastoresQuery?.data?.find(
                (one) => one.id === value
              );

              if (datastore) {
                setValue(
                  'tools',
                  [
                    ...tools,
                    createTool({
                      type: ToolType.datastore,
                      datastoreId: datastore.id,
                      datastore,
                    }),
                  ],
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  }
                );

                newDatastoreModal.close();
              }
            }}
          >
            {getDatastoresQuery.data
              ?.filter(
                // Don't show already selected datastores
                (each) =>
                  !tools.find((one) => (one as any).datastoreId === each.id)
              )
              ?.map((datastore) => (
                <Option key={datastore.id} value={datastore.id}>
                  {datastore.name}
                </Option>
              ))}
          </Select>
        </Stack>

        <Stack direction={'row'} gap={1}>
          {/* {tools?.length === 0 && ( */}
          <Button
            sx={{ mr: 'auto' }}
            variant="plain"
            // endDecorator={<ArrowForwardRoundedIcon />}
            startDecorator={<AddIcon />}
            size="sm"
            onClick={() => setIsCreateDatastoreModalOpen(true)}
          >
            Create a Datastore
          </Button>
        </Stack>
      </newDatastoreModal.component>

      <newApiToolForm.component
        title={agentToolConfig.http.title}
        description={agentToolConfig.http.description}
        dialogProps={{
          sx: {
            maxWidth: 'md',
            height: 'auto',
          },
        }}
      >
        <HttpToolForm
          onSubmit={(values) => {
            setValue('tools', [...tools, createTool(values)], {
              shouldDirty: true,
              shouldValidate: true,
            });
            newApiToolForm.close();
            // auto save.
            btnSubmitRef?.current?.click();
          }}
        />
      </newApiToolForm.component>

      <newLeadCaptureToolModal.component
        title={agentToolConfig.lead_capture.title}
        description={agentToolConfig.lead_capture.description}
        dialogProps={{
          sx: {
            maxWidth: 'md',
            height: 'auto',
          },
        }}
      >
        <LeadCaptureToolForm
          onSubmit={(values) => {
            handleAddTool(values);
            newLeadCaptureToolModal.close();
          }}
        />
      </newLeadCaptureToolModal.component>

      <newFormToolModal.component
        title={agentToolConfig.form.title}
        description={agentToolConfig.form.description}
        dialogProps={{
          sx: {
            maxWidth: 'sm',
            height: 'auto',
          },
        }}
      >
        <NewFormToolInput
          saveFormTool={({
            form,
            trigger,
            messageCountTrigger,
          }: {
            form: Form;
            trigger?: string;
            messageCountTrigger?: number;
          }) => {
            setValue(
              'tools',
              [
                ...tools,
                createTool({
                  type: ToolType.form,
                  formId: form.id,
                  form: form,
                  config: { trigger, messageCountTrigger },
                }),
              ],
              {
                shouldDirty: true,
                shouldValidate: true,
              }
            );
            newFormToolModal.close();
          }}
        />
      </newFormToolModal.component>

      <editFormToolModal.component
        title={agentToolConfig.form.title}
        description={agentToolConfig.form.description}
        dialogProps={{
          sx: {
            maxWidth: 'sm',
            height: 'auto',
          },
        }}
      >
        <EditFormToolInput
          currentToolIndex={state.currentToolIndex}
          onSubmit={() => {
            editFormToolModal.close();
            //  save.
            btnSubmitRef?.current?.click();
          }}
        />
      </editFormToolModal.component>
      <CreateDatastoreModal
        isOpen={isCreateDatastoreModalOpen}
        onSubmitSuccess={(newDatatore) => {
          getDatastoresQuery.mutate();
          setIsCreateDatastoreModalOpen(false);
          newDatastoreModal.close();

          setValue(
            'tools',
            [
              ...tools,
              {
                id: cuid(),
                datastoreId: newDatatore.id!,
                datastore: newDatatore,
                type: ToolType.datastore,
              },
            ],
            {
              shouldDirty: true,
              shouldValidate: true,
            }
          );
        }}
        handleClose={() => {
          setIsCreateDatastoreModalOpen(false);
        }}
      />

      <editApiToolForm.component
        title={agentToolConfig.http.title}
        description={agentToolConfig.http.description}
        dialogProps={{
          sx: {
            maxWidth: 'md',
            height: 'auto',
          },
        }}
      >
        {state.currentToolIndex >= 0 && (
          <Stack gap={2}>
            <HttpToolInput name={`tools.${state.currentToolIndex}`} />
            <validateToolModal.component
              title="Set up a request to your endpoint"
              description="Send a request to your endpoint to make sure it's working well."
              dialogProps={{
                sx: {
                  maxWidth: '50%',
                },
              }}
            >
              <HttpToolTestForm
                setToolValidState={(state: boolean) => {
                  isToolValidRef.current = state;
                }}
                name={`tools.${state.currentToolIndex}`}
                handleCloseModal={validateToolModal.close}
              />
            </validateToolModal.component>

            <Button
              type="button"
              loading={formState.isSubmitting}
              color={isToolValidRef.current ? 'success' : 'primary'}
              onClick={() => {
                if (!isToolValidRef.current && formState.isValid) {
                  validateToolModal.open();
                  return;
                } else if (isToolValidRef.current) {
                  editApiToolForm.close();
                  btnSubmitRef?.current?.click();
                }
              }}
            >
              {isToolValidRef.current ? 'Update' : 'Validate Config'}
            </Button>
          </Stack>
        )}
      </editApiToolForm.component>
      <editLeadCaptureToolModal.component
        title={agentToolConfig.lead_capture.title}
        description={agentToolConfig.lead_capture.description}
        dialogProps={{
          sx: {
            maxWidth: 'md',
            height: 'auto',
          },
        }}
      >
        {state.currentToolIndex >= 0 && (
          <Stack gap={2}>
            <LeadCaptureToolFormInput
              name={`tools.${state.currentToolIndex}`}
            />
            <Button
              type="button"
              loading={formState.isSubmitting}
              onClick={() => {
                editLeadCaptureToolModal.close();
                btnSubmitRef?.current?.click();
              }}
            >
              Update
            </Button>
          </Stack>
        )}
      </editLeadCaptureToolModal.component>

      {/* Trick to submit form from HttpToolInput modal */}
      <button
        ref={btnSubmitRef}
        type="submit"
        style={{ width: 0, height: 0, visibility: 'hidden' }}
      >
        submit
      </button>
    </Stack>
  );
}

export default ToolsInput;
