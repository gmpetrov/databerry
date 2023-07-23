import Alert from '@mui/joy/Alert';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { DatasourceType } from '@prisma/client';
import { useSession } from 'next-auth/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';
import { UpsertDatasourceSchema } from '@app/types/models';
import accountConfig from '@app/utils/account-config';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps & {};

export const WebSiteSourceSchema = UpsertDatasourceSchema.extend({
  config: z
    .object({
      source_url: z.string().trim().optional(),
      sitemap: z.string().trim().optional(),
    })
    .refine(
      (data) => {
        if (data.sitemap) {
          return !!z
            .string()
            .url()
            .parse(data.sitemap, {
              path: ['config.sitemap'],
            });
        } else if (data.source_url) {
          return !!z
            .string()
            .url()
            .parse(data.source_url, {
              path: ['config.source_url'],
            });
        }

        return false;
      },
      {
        message: 'You must provide either a web site URL or a sitemap URL',
        path: ['config.sitemap', 'config.source_url'],
      }
    ),
});

function Nested() {
  const { data: session, status } = useSession();
  const { control, register } =
    useFormContext<z.infer<typeof WebSiteSourceSchema>>();

  return (
    <Stack gap={1}>
      <Stack gap={1}>
        <Input
          label="Web Site URL"
          helperText="e.g.: https://example.com/"
          control={control as any}
          {...register('config.source_url')}
        />
        <Alert color="info">
          <Stack>
            Will automatically try to find all pages on the website during 45s
            max.
            <strong>
              Limited to{' '}
              {
                accountConfig[session?.user?.currentPlan!]?.limits
                  ?.maxWebsiteURL
              }
              {' Pages on your plan.'}
            </strong>
          </Stack>
        </Alert>
      </Stack>

      <Typography color="primary" fontWeight={'bold'} mx={'auto'} mt={2}>
        Or
      </Typography>

      <Stack gap={1}>
        <Input
          label="Sitemap URL"
          helperText="e.g.: https://example.com/sitemap.xml"
          control={control as any}
          {...register('config.sitemap')}
        />

        <Alert color="info">
          <Stack>
            Will process all pages in the sitemap.
            <strong>
              Limited to{' '}
              {
                accountConfig[session?.user?.currentPlan!]?.limits
                  ?.maxWebsiteURL
              }
              {' Pages on your plan.'}
            </strong>
          </Stack>
        </Alert>
      </Stack>
    </Stack>
  );
}

export default function WebSiteForm(props: Props) {
  const { defaultValues, ...rest } = props;

  return (
    <Base
      schema={WebSiteSourceSchema}
      {...rest}
      defaultValues={{
        ...props.defaultValues!,
        type: DatasourceType.web_site,
      }}
    >
      <Nested />
    </Base>
  );
}
