import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Link,
  Modal,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { z } from 'zod';

import useStateReducer from '@app/hooks/useStateReducer';
import { getServiceProviders } from '@app/pages/api/service-providers';

import getRootDomain from '@chaindesk/lib/get-root-domain';
import { fetcher } from '@chaindesk/lib/swr-fetcher';

import ConnectShopifyStore from './ConnectShopifyStore';
import Input from './Input';

type Props = {
  isOpen: boolean;
  handleCloseModal: () => any;
  agentId?: string;
};

const schema = z.object({ shop: z.string().min(6) });

export default function ShopifySettingsModal(props: Props) {
  const { data: session } = useSession();

  const [state, setState] = useStateReducer({
    isLoading: false,
    selectedShops: [] as string[],
    isNewStoreViewOpen: false,
  });
  const methods = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const { register, handleSubmit, control, formState } = useForm<
    z.infer<typeof schema>
  >({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const getProvidersQuery = useSWR<
    Awaited<ReturnType<typeof getServiceProviders>>
  >(
    session?.organization.id ? `/api/service-providers?type=shopify` : null,
    fetcher
  );

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const OauthUrl = `/api/integrations/shopify/add?shop=${getRootDomain(
        values.shop
      )}&agentId=${props.agentId}`;

      window.open(OauthUrl, '_blank');
    } catch (e) {
      console.log(e);
    } finally {
    }
  };

  const publish = async (values: z.infer<typeof schema>) => {
    const toastId = toast.loading('Publishing...');
    try {
      await axios.post(`/api/integrations/shopify/inject`, {
        shop: values.shop,
        agentId: props.agentId,
      });
      toast.dismiss(toastId);
      toast.success('Published Successfully !');
      getProvidersQuery.mutate();
    } catch (e) {
      toast.dismiss(toastId);
      toast.error('Something went wrong..');
      console.log(e);
    } finally {
    }
  };

  const unPublish = async () => {
    const toastId = toast.loading('Unpublishing...');
    try {
      await axios.post(`/api/integrations/shopify/delete`, {
        shops: state.selectedShops,
      });
      toast.dismiss(toastId);
      toast.success('Un-Published Successfully !');
      getProvidersQuery.mutate();
    } catch (e) {
      console.log(e);
      toast.dismiss(toastId);
      toast.error('Something went wrong..');
    }
  };

  if (!props.agentId) {
    return null;
  }

  return (
    <Modal
      open={props.isOpen}
      onClose={props.handleCloseModal}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Card variant="outlined" sx={{ width: '100%', maxWidth: 400 }}>
        <Typography level="h4"> Publish To Your Shopify Store</Typography>

        {getProvidersQuery?.data &&
          getProvidersQuery?.data?.filter(
            (provider) => (provider?.config as any)?.script_tag_id
          ).length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />

              <Typography level="body-md">Stores published To :</Typography>
              {getProvidersQuery?.data?.map((provider) => (
                <Stack direction="row" key={provider.id}>
                  <Checkbox
                    onChange={(event) => {
                      setState({
                        selectedShops: event.target.checked
                          ? [
                              ...state.selectedShops,
                              (provider.config as any)?.shopify_offline_session
                                ?.shop,
                            ]
                          : state.selectedShops.filter(
                              (shop) =>
                                shop !==
                                (provider.config as any)
                                  ?.shopify_offline_session?.shop
                            ),
                      });
                    }}
                  />
                  <Link
                    ml={1}
                    href={`https://${
                      (provider.config as any)?.shopify_offline_session?.shop
                    }`}
                  >
                    {(provider.config as any)?.shopify_offline_session?.shop}
                  </Link>
                </Stack>
              ))}
              <Stack direction="row-reverse">
                <Button
                  color="danger"
                  disabled={state.selectedShops.length == 0}
                  onClick={unPublish}
                >
                  Un-publish
                </Button>
              </Stack>
            </>
          )}

        {getProvidersQuery?.data &&
          getProvidersQuery?.data?.filter(
            (provider) => !(provider?.config as any)?.script_tag_id
          ).length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography level="body-md">Publish To A New Store :</Typography>

              <form onSubmit={methods.handleSubmit(publish)} className="ml-3">
                <Select
                  {...methods.register('shop')}
                  onChange={(_, value) => {
                    methods.setValue('shop', value as string, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                >
                  {getProvidersQuery?.data
                    ?.filter(
                      (provider) => !(provider.config as any)?.script_tag_id
                    )
                    .map((provider) => (
                      <Option key={provider.id} value={provider.externalId}>
                        {
                          (provider.config as any)?.shopify_offline_session
                            ?.shop
                        }
                      </Option>
                    ))}
                </Select>

                <Stack direction="row-reverse">
                  <Button
                    color="primary"
                    disabled={!methods.formState.isValid}
                    type="submit"
                    variant="outlined"
                    sx={{ px: 0.5, mt: 1 }}
                  >
                    Publish To The Store
                  </Button>
                </Stack>
              </form>
            </>
          )}

        <Divider sx={{ mt: 3 }} />

        <ConnectShopifyStore />

        <Divider sx={{ my: 2 }}></Divider>
      </Card>
    </Modal>
  );
}
