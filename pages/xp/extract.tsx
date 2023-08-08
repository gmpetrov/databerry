import AddIcon from '@mui/icons-material/Add';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  ColorPaletteProp,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Option,
  Select,
} from '@mui/joy';
import Box from '@mui/joy/Box';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Stack from '@mui/joy/Stack';
import Tab from '@mui/joy/Tab';
import TabList from '@mui/joy/TabList';
import Tabs from '@mui/joy/Tabs';
import Typography from '@mui/joy/Typography';
import { Prisma } from '@prisma/client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import Layout from '@app/components/Layout';
import UsageLimitModal from '@app/components/UsageLimitModal';
import useGetDatastoreQuery from '@app/hooks/useGetDatastoreQuery';
import useStateReducer from '@app/hooks/useStateReducer';
import { RouteNames } from '@app/types';
import { XPBNPLabels } from '@app/utils/config';
import guardDataProcessingUsage from '@app/utils/guard-data-processing-usage';
import { withAuth } from '@app/utils/withAuth';

const schemaTweets = {
  type: 'object',
  properties: {
    tweets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          twitterHandle: {
            type: 'string',
          },
          publishedDate: {
            type: 'string',
          },
          sentimentAnalysis: {
            type: 'string',
            description: 'Sentiment analysis of the tweet.',
          },
          theme: {
            type: 'string',
          },
        },
      },
    },
  },
};

const schemaLinkedin = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    lastname: {
      type: 'string',
    },
    location: {
      type: 'string',
    },
    stats: {
      type: 'object',
      properties: {
        nbProfilViews: {
          type: 'number',
        },
        nbPostPrint: {
          type: 'number',
        },
        nbPrintSearchResults: {
          type: 'number',
        },
      },
    },
  },
};

const Field = ({ type, name, description, fieldKey, register }: any) => {
  return (
    <Stack key={`${fieldKey}`} gap={3}>
      <FormControl>
        <FormLabel>{'*Name'}</FormLabel>
        <Input
          type={'text'}
          defaultValue={name}
          {...register(`${fieldKey}.name`)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>{'*Type'}</FormLabel>
        <Select
          defaultValue={type}
          //   onChange={(_, value) => {
          //     setValue(
          //       `${parentfieldKey ? `${parentfieldKey}.` : ''}${fieldKey}.type`,
          //       value
          //     );
          //   }}
          {...register(`${fieldKey}.type`)}
        >
          <Option value="string">string</Option>
          <Option value="number">number</Option>
          <Option value="array">array</Option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>{'Description'}</FormLabel>
        <Input
          type={'text'}
          defaultValue={description}
          {...register(`${fieldKey}.description`)}
        />

        {/* <FormHelperText>Description</FormHelperText> */}
      </FormControl>

      <Divider />
    </Stack>
  );
};

function generateForm({
  schema,
  handleChange,
  register,
  parentKey,
  index,
  setValue,
}: {
  register: any;
  schema: any;
  handleChange: any;
  parentKey?: string;
  index?: number;
  setValue?: any;
}) {
  const { type, properties } = schema;

  if (type === 'object') {
    return Object.keys(properties).map((key) => {
      const property = properties[key];
      const { type: propertyType, description } = property;

      if (propertyType === 'object') {
        const nestedForm = generateForm({
          schema: property,
          handleChange,
          parentKey: `${parentKey ? `${parentKey}.` : ''}properties.${key}`,
          register,
        });

        return (
          <Stack key={key} gap={2}>
            {/* <Field
              key={`${parentKey ? `${parentKey}.` : ''}properties.${key}`}
              fieldKey={`${parentKey ? `${parentKey}.` : ''}properties.${key}`}
              type={propertyType}
              description={description}
              register={register}
              name={key}
            /> */}

            <Stack ml={2}>{nestedForm}</Stack>
          </Stack>
        );
      }

      if (propertyType === 'array') {
        if (property.items && property.items.type === 'object') {
          const nestedForm = generateForm({
            schema: property.items,
            parentKey: `${parentKey ? `${parentKey}.` : ''}items.${key}`,
            handleChange,
            register,
          });

          return (
            <Stack key={key} gap={2}>
              <Field
                key={`${parentKey ? `${parentKey}.` : ''}items.${key}`}
                fieldKey={`${parentKey ? `${parentKey}.` : ''}items.${key}`}
                type={propertyType}
                description={description}
                register={register}
                name={key}
              />

              <Stack ml={2}>{nestedForm}</Stack>
            </Stack>
          );
        }
        // Handle other array types if needed
      }

      // Handle other property types if needed
      return (
        <Field
          key={`${parentKey ? `${parentKey}.` : ''}${key}`}
          fieldKey={`${parentKey ? `${parentKey}.` : ''}${key}`}
          type={propertyType}
          description={description}
          register={register}
          name={key}
        />
      );
    });
  }

  return null;
}

export default function XPBNPHome() {
  const router = useRouter();
  const [state, setState] = useStateReducer({
    // schema: schemaTweets,
    schema: schemaLinkedin,
  });
  const methods = useForm({
    // defaultValues: schemaTweets,
  });

  const onSubmit = (values: any) => {
    console.log(values);
  };

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
      <Card sx={{ p: 2 }}>
        <Stack direction={'row'} gap={4}>
          <Stack sx={{ width: '100%' }}>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                {generateForm({
                  schema: state.schema,
                  parentKey: 'properties',
                  handleChange: () => {},
                  register: methods.register,
                  setValue: methods.setValue,
                })}
                <Button type="submit">Submit</Button>
              </form>
            </FormProvider>
          </Stack>
          <Stack sx={{ maxWidth: 'sm' }}>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(state.schema, null, 2)}
            </Typography>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
}

XPBNPHome.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  }
);
