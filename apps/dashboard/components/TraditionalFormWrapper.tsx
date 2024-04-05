import useSWR from 'swr';

import { getForm } from '@app/pages/api/forms/[formId]';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { FormConfigSchema } from '@chaindesk/lib/types/dtos';
import { Prisma } from '@chaindesk/prisma';
import TraditionalForm from '@chaindesk/ui/TraditionalForm';

export default function TraditionalFormWrapper({
  formId,
  messageId,
  conversationId,
  isFormSubmitted,
}: {
  formId: string;
  messageId: string;
  conversationId: string;
  isFormSubmitted?: boolean;
}) {
  const getFormQuery = useSWR<Prisma.PromiseReturnType<typeof getForm>>(
    formId
      ? `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/forms/${formId}`
      : null,
    fetcher
  );

  return (
    <TraditionalForm
      formId={formId}
      conversationId={conversationId}
      messageId={messageId}
      config={getFormQuery?.data?.publishedConfig as FormConfigSchema}
      isFormSubmitted={isFormSubmitted}
    />
  );
}
