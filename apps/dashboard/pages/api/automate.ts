import { NextApiResponse } from 'next';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import generateFunId from '@chaindesk/lib/generate-fun-id';
import triggerTaskLoadDatasource from '@chaindesk/lib/trigger-task-load-datasource';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import uuidv4 from '@chaindesk/lib/uuidv4';
import {
  AgentVisibility,
  DatasourceStatus,
  DatasourceType,
  DatastoreType,
  DatastoreVisibility,
} from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const automate = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const data = req.body;

  // step1: create datastore:
  const datastore = await prisma.datastore.create({
    data: {
      type: DatastoreType.qdrant,
      name: `auto-generate-for-websie-${data.url}`,
      description: `datastore dedicated to the website ${data.url}`,
      visibility: DatastoreVisibility.private,
      organization: {
        connect: {
          id: (session as any)?.organization?.id,
        },
      },
      config: {},
      apiKeys: {
        create: {
          key: uuidv4(),
        },
      },
    },
  });

  // step2 create datastource.

  const datasource = await prisma.appDatasource.create({
    data: {
      type: DatasourceType.web_site,
      name: `auto-generate-for-websie-${data.url}`,
      status: DatasourceStatus.pending,
      organization: {
        connect: {
          id: (session as any)?.organization?.id,
        },
      },
      config: { sitemap: '', source_url: data.url },
      datastore: {
        connect: {
          id: datastore.id,
        },
      },
    },
  });

  // step4: create agent with datastore as tool.

  prisma.agent.create({
    data: {
      name: 'agent auto-generated',
      description: 'agent auto-generate for websie',
      organization: {
        connect: {
          id: (session as any)?.organization?.id,
        },
      },
      visibility: AgentVisibility.private,
      tools: {
        createMany: {
          data: [{ type: 'datastore', datastoreId: datastore.id }],
        },
      },
    },
  });
  await triggerTaskLoadDatasource([
    {
      organizationId: session?.organization?.id,
      datasourceId: datasource.id,
      priority: 1,
    },
  ]);
};

handler.post(respond(automate));

export default handler;
