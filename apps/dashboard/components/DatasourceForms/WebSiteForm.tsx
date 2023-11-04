import Alert from '@mui/joy/Alert';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useSession } from 'next-auth/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';

import accountConfig from '@chaindesk/lib/account-config';
import {
  DatasourceSchema,
  DatasourceWebSite,
} from '@chaindesk/lib/types/models';
import { DatasourceType } from '@chaindesk/prisma';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps<DatasourceWebSite> & {};

function Nested() {
  const { data: session, status } = useSession();
  const { control, register } = useFormContext<DatasourceWebSite>();

  return (
    <Stack gap={1}>
      <Stack gap={1}>
        <Input
          label="Web Site URL"
          helperText="e.g.: https://example.com/"
          control={control as any}
          {...register('config.source_url')}
        />
        <Alert color="neutral">
          <Stack>
            Will automatically try to find all pages on the website during 45s
            max.
            <strong>
              Limited to{' '}
              {
                accountConfig[session?.organization?.currentPlan!]?.limits
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

        <Alert color="neutral">
          <Stack>
            Will process all pages in the sitemap.
            <strong>
              Limited to{' '}
              {
                accountConfig[session?.organization?.currentPlan!]?.limits
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
      schema={DatasourceSchema}
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
