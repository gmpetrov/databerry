import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, Chip, Divider, IconButton } from '@mui/joy';
import Alert from '@mui/joy/Alert';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useSession } from 'next-auth/react';
import React from 'react';
import { Control, useFieldArray, useFormContext } from 'react-hook-form';

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
  const { control, register, trigger } = useFormContext<DatasourceWebSite>();
  const parameters = useFieldArray({
    control: control as Control<DatasourceSchema>,
    name: 'config.black_listed_urls',
  });

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
      <Divider sx={{ my: 2 }} />
      <Stack gap={1}>
        <Typography>Blacklisted URLs</Typography>
        <Alert color="neutral">
          <Stack>
            <Typography>
              Blacklisted URLs will be ignored during the scan. Glob patterns
              can be used, e.g.: https://example.com/blog/*
            </Typography>
          </Stack>
        </Alert>

        <Stack gap={1}>
          {parameters.fields.map((field, index) => (
            <Stack key={index} direction="row" gap={1}>
              <Input
                key={index}
                control={control}
                sx={{ width: '100%', flex: 1 }}
                formControlProps={{ sx: { flex: 1 } }}
                {...register(`config.black_listed_urls.${index}`)}
              />
              <IconButton
                variant="outlined"
                color="neutral"
                onClick={() => parameters.remove(index)}
              >
                <DeleteIcon fontSize="md" />
              </IconButton>
            </Stack>
          ))}
          <Button
            variant="outlined"
            startDecorator={<AddIcon fontSize="md" />}
            size="sm"
            onClick={() => {
              parameters.append('');
            }}
            sx={{ width: '70px' }}
          >
            Add
          </Button>
        </Stack>
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
      mode="onChange"
      defaultValues={{
        ...props.defaultValues!,
        type: DatasourceType.web_site,
      }}
    >
      <Nested />
    </Base>
  );
}
