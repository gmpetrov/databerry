import { Done } from '@mui/icons-material';
import { Close } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  Stack,
} from '@mui/joy';
import Autocomplete from '@mui/joy/Autocomplete';
import AutocompleteOption from '@mui/joy/AutocompleteOption';
import { DatasourceType } from '@prisma/client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import { z } from 'zod';

import useStateReducer from '@app/hooks/useStateReducer';
import { getNotebooks } from '@app/pages/api/integrations/notion/get-notebooks';
import { getProviders } from '@app/pages/api/integrations/notion/get-notion-providers';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { UpsertDatasourceSchema } from '@chaindesk/lib/types/models';

import Base from './Base';
import { DatasourceFormProps } from './types';

type Props = DatasourceFormProps & {};

const NotionSourceSchema = UpsertDatasourceSchema.extend({
  config: z.object({
    serviceProviderId: z.string().min(1),
    notebooks: z.array(
      z.object({
        id: z.string().min(1),
        title: z.string(),
        url: z.string().optional(),
      })
    ),
  }),
});

function Nested() {
  const { data: session } = useSession();
  const { register, setValue, trigger } =
    useFormContext<z.infer<typeof NotionSourceSchema>>();

  const [state, setState] = useStateReducer({
    currentProviderId: '',
  });

  const getProvidersQuery = useSWR<Awaited<ReturnType<typeof getProviders>>>(
    session?.organization.id
      ? `/api/integrations/notion/get-notion-providers`
      : null,
    fetcher
  );

  const getNotebooksQuery = useSWR<Awaited<ReturnType<typeof getNotebooks>>>(
    state.currentProviderId
      ? `/api/integrations/notion/get-notebooks?providerId=${state.currentProviderId}`
      : null,
    fetcher,
    {
      onError: (error) => {
        if (error.response.status == 429) {
          toast.error(
            'You have reached your Notion rate limit, try again later'
          );
        }
      },
    }
  );

  useEffect(() => {
    setValue('config.notebooks', getNotebooksQuery.data as any);
    trigger();
  }, [getNotebooksQuery.data]);

  const handleSignIn = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    const res = await axios.get('/api/integrations/notion/get-auth-url');
    window.open(res.data, '_blank', 'width=800,height=800');
  };

  return (
    <>
      <FormControl>
        <FormLabel>Select Account</FormLabel>
        <Select
          {...register('config.serviceProviderId')}
          onChange={(_, value) => {
            setState({
              currentProviderId: value as string,
            });

            setValue('config.serviceProviderId', value as string, {
              shouldDirty: true,
            });
          }}
        >
          {getProvidersQuery?.data?.map((provider) => (
            <Option key={provider.id} value={provider.id}>
              {provider.name || provider.id}
            </Option>
          ))}
        </Select>
      </FormControl>

      <Button
        startDecorator={<AddIcon />}
        onClick={handleSignIn}
        variant={'plain'}
        sx={{ mr: 'auto' }}
      >
        Notion: Add Account
      </Button>

      {state.currentProviderId && (
        <>
          <FormControl>
            <FormLabel sx={{ mt: 2 }}>Notebooks</FormLabel>
            <Autocomplete
              multiple
              disabled={getNotebooksQuery.isValidating}
              startDecorator={
                getNotebooksQuery.isValidating ? (
                  <CircularProgress size="sm" />
                ) : null
              }
              placeholder="Notebooks"
              getOptionLabel={(option) => option.title || ''}
              options={getNotebooksQuery?.data || []}
              defaultValue={getNotebooksQuery?.data}
              onChange={(_, value) => {
                setValue('config.notebooks', value);
                trigger();
              }}
            />
          </FormControl>
        </>
      )}
    </>
  );
}

const DatasourceNotebook = (props: {
  serviceProviderId: string;
  title: string;
}) => {
  const { register, setValue, trigger } = useFormContext();
  const getNotebooksQuery = useSWR<Awaited<ReturnType<typeof getNotebooks>>>(
    `/api/integrations/notion/get-notebooks?providerId=${props.serviceProviderId}`,
    fetcher
  );

  return (
    <Stack gap={1}>
      <FormLabel>Used notebook</FormLabel>
      <Select
        {...register('config.notebookId')}
        onChange={(_, value) => {
          setValue('config.notebookId', value as string, {
            shouldDirty: true,
          });

          trigger();
        }}
        placeholder={props.title}
      >
        {getNotebooksQuery.isLoading && (
          <Option key="loading" value="loading">
            loading pages..
          </Option>
        )}
        {(getNotebooksQuery?.data || []).map((notebook) => (
          <Option key={notebook.id} value={notebook.id}>
            {notebook.title}
          </Option>
        ))}
      </Select>
    </Stack>
  );
};

function NotionForm(props: Props) {
  const { defaultValues, ...rest } = props;

  return (
    <Base
      schema={NotionSourceSchema}
      {...rest}
      defaultValues={{
        ...props.defaultValues!,
        type: DatasourceType.notion,
      }}
    >
      {!defaultValues?.id && <Nested />}
    </Base>
  );
}

export default NotionForm;
