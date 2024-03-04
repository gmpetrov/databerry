import { Metadata } from 'next';
import { cache } from 'react';
import React from 'react';

import { youtubeSummaryTool } from '@chaindesk/lib/config';
import { Prisma } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

import Cta from '@/components/cta';
import Section from '@/components/ui/section';
import AllPagination from '@/components/youtube-summarizer/all-pagination';

const getPage = cache(async (page: number) => {
  const [total, items] = await Promise.all([
    prisma.lLMTaskOutput.count({
      where: {
        type: 'youtube_summary',
        output: {
          path: ['metadata', 'title'],
          not: Prisma.AnyNull,
        },
      },
    }),
    prisma.lLMTaskOutput.findMany({
      where: {
        type: 'youtube_summary',
        output: {
          path: ['metadata', 'title'],
          not: Prisma.AnyNull,
        },
      },
      skip: Number(page) * youtubeSummaryTool.paginationLimit,
      take: youtubeSummaryTool.paginationLimit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  return {
    total,
    items,
  };
});

export default async function All(props: {
  params: {
    index: string;
  };
}) {
  const index = Number(props.params.index);

  const page = await getPage(index);

  return (
    <Section>
      <AllPagination index={index} {...page} />
      <Cta />
    </Section>
  );
}
