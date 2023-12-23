import { Card, Skeleton, Stack } from '@mui/joy';
import Table from '@mui/joy/Table';
import React, { useMemo } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import useStateReducer from '@app/hooks/useStateReducer';
import { getForm } from '@app/pages/api/forms/[formId]';
import { getSubmissions } from '@app/pages/api/forms/[formId]/submissions';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { FormConfigSchema } from '@chaindesk/lib/types/dtos';
import { Prisma } from '@chaindesk/prisma';

type Props = {
  formId: string;
};

function FormSubmissionsTab({ formId }: Props) {
  const [state, setState] = useStateReducer({
    hasMore: false,
  });

  const getFormQuery = useSWR<Prisma.PromiseReturnType<typeof getForm>>(
    formId ? `/api/forms/${formId}` : null,
    fetcher
  );

  const getSubmissionsQuery = useSWRInfinite<
    Prisma.PromiseReturnType<typeof getSubmissions>
  >((pageIndex, previousPageData) => {
    // reached the end
    if (previousPageData && previousPageData?.length === 0) {
      setState({
        hasMore: false,
      });
      return null;
    }

    const cursor = previousPageData?.[previousPageData?.length - 1]
      ?.id as string;

    return `/api/forms/${formId}/submissions?cursor=${cursor || ''}`;
  }, fetcher);

  const submissions = useMemo(() => {
    return getSubmissionsQuery?.data?.flat?.() || [];
  }, [getSubmissionsQuery?.data?.length]);

  const cols = useMemo(() => {
    const uniques = new Set();

    (submissions || []).forEach((each) => {
      Object.keys(each.data as any).forEach((key) => {
        uniques.add(key.toLowerCase());
      });
    });

    return [...Array.from(uniques), 'createdAt'];
  }, [submissions?.length]);

  const loading = getFormQuery?.isLoading || !getSubmissionsQuery?.data;

  return (
    <Card>
      <Skeleton loading={loading} variant="rectangular">
        {(submissions?.length || 0) > 0 && (
          <Table aria-label="Form Submissions Table">
            <thead>
              <tr>
                {(cols || []).map((each: any) => (
                  <th key={each}>{each}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions?.map((each) => (
                <tr key={each.id}>
                  {(cols || []).map((col: any) => {
                    let val = '';
                    if (col === 'createdAt') {
                      val = each?.createdAt?.toString();
                    } else {
                      val = (each?.data as any)?.[col] as string;
                    }

                    return <td key={col}>{val}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Skeleton>
    </Card>
  );
}

export default FormSubmissionsTab;
