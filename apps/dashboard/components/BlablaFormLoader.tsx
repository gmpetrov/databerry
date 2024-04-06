import React, { useMemo } from 'react';
import useSWR from 'swr';

import { getForm } from '@app/pages/api/forms/[formId]';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { FormConfigSchema } from '@chaindesk/lib/types/dtos';
import { Prisma } from '@chaindesk/prisma';

import BlablaFormViewer from './BlablaFormViewer';

type Props = {
  formId: string;
  conversationId?: string;
  messageId?: string;
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

  return (
    <BlablaFormViewer
      config={config}
      formId={props.formId}
      conversationId={props.conversationId}
      messageId={props.messageId}
      type={getFormQuery?.data?.type ?? 'conversational'}
    />
  );
}

export default BlablaFormLoader;
