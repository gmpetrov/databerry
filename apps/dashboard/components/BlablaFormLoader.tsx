import { zodResolver } from '@hookform/resolvers/zod';
import {
  AddAPhoto,
  AutoAwesomeMosaicOutlined,
  RocketLaunch,
} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Option,
  Select,
  Stack,
  Tab,
  tabClasses,
  TabList,
  TabPanel,
  Tabs,
  Textarea,
  Typography,
} from '@mui/joy';
import Chip from '@mui/joy/Chip';
import cuid from 'cuid';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import debounce from 'p-debounce';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import z from 'zod';

import FormSubmissionsTab from '@app/components/FormSubmissionsTab';
import Input from '@app/components/Input';
import Layout from '@app/components/Layout';
import useChat from '@app/hooks/useChat';
import { getProductFromHostname } from '@app/hooks/useProduct';
import useStateReducer from '@app/hooks/useStateReducer';
import { getForm } from '@app/pages/api/forms/[formId]';
import { updateForm } from '@app/pages/api/forms/[formId]/admin';
import { publishForm } from '@app/pages/api/forms/[formId]/publish';

import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import {
  CreateFormSchema,
  FormConfigSchema,
  FormFieldSchema,
} from '@chaindesk/lib/types/dtos';
import { withAuth } from '@chaindesk/lib/withAuth';
import { Prisma } from '@chaindesk/prisma';

import BlablaFormViewer from './BlablaFormViewer';

export const isEmpty = (obj: any) => Object?.keys(obj || {}).length === 0;

type Props = {
  formId: string;
  useDraftConfig?: boolean;
};

function BlablaFormLoader(props: Props) {
  const getFormQuery = useSWR<Prisma.PromiseReturnType<typeof getForm>>(
    props.formId ? `/api/forms/${props.formId}` : null,
    fetcher
  );

  const config = useMemo(() => {
    return (
      props.useDraftConfig
        ? getFormQuery?.data?.draftConfig
        : getFormQuery?.data?.publishedConfig
    ) as FormConfigSchema;
  }, [props.useDraftConfig, getFormQuery.data]);

  return <BlablaFormViewer config={config} formId={props.formId} />;
}

export default BlablaFormLoader;
