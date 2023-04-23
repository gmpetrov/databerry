import { DatasourceStatus, DatasourceType } from '@prisma/client';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { UpsertDatasourceSchema } from '@app/types/models';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import cuid from '@app/utils/cuid';
import findDomainPages, { getSitemapPages } from '@app/utils/find-domain-pages';
import generateFunId from '@app/utils/generate-fun-id';
import prisma from '@app/utils/prisma-client';
import triggerTaskLoadDatasource from '@app/utils/trigger-task-load-datasource';
import validate from '@app/utils/validate';

const handler = createAuthApiHandler();

export const getDatasources = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const datasources = await prisma.appDatasource.findMany({
    where: {
      ownerId: session?.user?.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return datasources;
};

handler.get(respond(getDatasources));

export const upsertDatasource = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as UpsertDatasourceSchema;
  const session = req.session;

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: data.datastoreId,
    },
  });

  if (datastore?.ownerId !== session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // TODO: find a better way to handle this
  if (data.type === DatasourceType.web_site) {
    let urls: string[] = [];
    const sitemap = (data as any).config.sitemap;
    const source = (data as any).config.source;

    if (sitemap) {
      urls = await getSitemapPages(sitemap);
    } else if (source) {
      urls = await findDomainPages((data as any).config.source);
    } else {
      return;
    }

    const ids = urls.map(() => cuid());

    await prisma.appDatasource.createMany({
      data: urls.map((each, idx) => ({
        id: ids[idx],
        type: DatasourceType.web_page,
        name: each,
        config: {
          ...data.config,
          source: each,
        },
        ownerId: session?.user?.id,
        datastoreId: data.datastoreId,
      })),
    });

    await triggerTaskLoadDatasource(
      ids.map((each) => ({
        datasourceId: each,
      }))
    );

    return;
  }

  let existingDatasource;
  if (data?.id) {
    existingDatasource = await prisma.appDatasource.findUnique({
      where: {
        id: data.id,
      },
    });

    if (
      existingDatasource &&
      (existingDatasource as any)?.ownerId !== session?.user?.id
    ) {
      throw new Error('Unauthorized');
    }
  }

  const id = data?.id || cuid();

  const datasource = await prisma.appDatasource.upsert({
    where: {
      id,
    },
    create: {
      id,
      type: data.type,
      name: data.name || generateFunId(),
      config: data.config,
      status: DatasourceStatus.pending,
      owner: {
        connect: {
          id: session?.user?.id,
        },
      },
      datastore: {
        connect: {
          id: data.datastoreId,
        },
      },
    },
    update: {
      name: data.name,
      config: data.config,
    },
  });

  await triggerTaskLoadDatasource([
    { datasourceId: id, isUpdateText: data.isUpdateText },
  ]);

  return datasource;
};

handler.post(
  validate({
    body: UpsertDatasourceSchema,
    handler: respond(upsertDatasource),
  })
);

export default handler;
