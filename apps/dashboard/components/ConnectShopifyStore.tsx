import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Stack } from '@mui/joy';
import { ServiceProviderType } from '@prisma/client';
import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import getRootDomain from '@chaindesk/lib/get-root-domain';

import Input from './Input';

type Props = {
  agentId?: string;
};

export const shopSchema = z.object({
  shop: z
    .string()
    .min(3)
    .superRefine(async (val, ctx) => {
      if (val) {
        if (!val.includes('.myshopify.com')) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid shop name.',
          });
          return;
        } else if (typeof window === 'undefined') {
          return;
        }
        const existing = await axios.get(
          `/api/service-providers?type=shopify&externalId=${getRootDomain(val)}`
        );
        if (existing?.data?.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'This shop is already connected.',
          });
          return;
        }
      }
    }),
});

export default function ConnectShopifyStore(props: Props) {
  const { register, handleSubmit, control, formState } = useForm<
    z.infer<typeof shopSchema>
  >({
    resolver: zodResolver(shopSchema, { async: true }, { mode: 'async' }),
    mode: 'onChange',
  });

  const onSubmit = async (values: z.infer<typeof shopSchema>) => {
    try {
      const params = new URLSearchParams();

      params.append('shop', getRootDomain(values.shop));

      if (props.agentId) {
        params.append('agentId', props.agentId);
      }

      const OauthUrl = `/api/integrations/shopify/add?${params.toString()}`;

      window.open(OauthUrl, '_blank');
    } catch (e) {
      console.log(e);
    } finally {
    }
  };

  return (
    <details className="mt-2 ml-2 text-md">
      <summary>Connect new shopify store</summary>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          control={control}
          {...register('shop')}
          placeholder="shop name"
        />
        <Stack direction="row-reverse" sx={{ mt: 1 }}>
          <Button
            color="success"
            type="submit"
            disabled={!formState.isValid}
            variant="plain"
            sx={{ px: 0.5 }}
          >
            Connect
          </Button>
        </Stack>
      </form>
    </details>
  );
}
