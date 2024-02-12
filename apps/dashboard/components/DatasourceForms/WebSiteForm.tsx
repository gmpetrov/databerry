import Alert from '@mui/joy/Alert';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
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
  const { t } = useTranslation('datenpool');

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
            {t('urlText')}
            <strong>
              {t('urlLimit')}{' '}
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
            {t('url2Text')}
            <strong>
              {t('urlLimit')}{' '}
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
