import {
  DatasourceType,
  DatastoreType,
  MessageEval,
  MessageFrom,
  ToolType,
} from '@prisma/client';
import prisma from './client';
import { faker } from '@faker-js/faker';

async function main() {
  try {
    // specify current organisation
    const organizationId = '';

    if (!organizationId) {
      console.error(
        '*HINT: Make sure to specify the organisation id in seed-analytics.ts'
      );
      process.exit(1);
    }

    /* Agents */
    const agents = Array.from({ length: 3 }).map((_, i) => ({
      id: faker.string.uuid(),
      organizationId,
      name: `agent-${faker.person.firstName()}`,
      description: faker.lorem.sentence(),
      createdAt: faker.date.between({
        from: '2023-01-01T00:00:00.000Z',
        to: '2024-01-01T00:00:00.000Z',
      }),
    }));

    await prisma.agent.createMany({
      data: agents,
    });

    /* conversations */
    const converstaions = Array.from({ length: 100 }).map((_, i) => ({
      organizationId,
      agentId: agents[faker.number.int({ min: 0, max: 2 })].id,
      id: faker.string.uuid(),
      // created this year.
      createdAt: faker.date.between({
        from: '2023-01-01T00:00:00.000Z',
        to: '2024-01-01T00:00:00.000Z',
      }),
      metadata: {
        country: faker.location.countryCode(),
      },
    }));

    await prisma.conversation.createMany({
      data: converstaions,
    });

    /* Messages */
    const messages = Array.from({ length: 100 }).map((_, i) => ({
      conversationId: converstaions[i].id,
      eval: faker.helpers.enumValue(MessageEval),
      text: faker.lorem.text(),
      from: faker.helpers.enumValue(MessageFrom),
      createdAt: faker.date.between({
        from: '2023-01-01T00:00:00.000Z',
        to: '2024-01-01T00:00:00.000Z',
      }),
    }));
    // working
    await prisma.message.createMany({
      data: messages,
    });

    /* leads */
    const leads = Array.from({ length: 100 }).map((_, i) => ({
      conversationId: converstaions[i].id,
      agentId: agents[faker.number.int({ min: 0, max: 2 })].id,
      organizationId,
      email: faker.internet.email(),
      phoneNumber: faker.phone.number(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      createdAt: faker.date.between({
        from: '2023-01-01T00:00:00.000Z',
        to: '2024-01-01T00:00:00.000Z',
      }),
    }));

    await prisma.lead.createMany({
      data: leads,
    });

    const datastores = Array.from({ length: 4 }).map(() => ({
      id: faker.string.uuid(),
      name: faker.lorem.word(),
      organizationId,
      type: DatastoreType.qdrant,
    }));

    await prisma.datastore.createMany({
      data: datastores,
    });

    const datasources = Array.from({ length: 100 }).map(() => ({
      id: faker.string.uuid(),
      name: faker.lorem.word(),
      organizationId,
      datastoreId: datastores[faker.number.int({ min: 0, max: 3 })].id,
      type: faker.helpers.enumValue(DatasourceType),
    }));

    await prisma.appDatasource.createMany({
      data: datasources,
    });

    const tools = Array.from({ length: 30 }).map(() => ({
      datastoreId: datastores[faker.number.int({ min: 0, max: 3 })].id,
      agentId: agents[faker.number.int({ min: 0, max: 2 })].id,
      type: faker.helpers.enumValue(ToolType),
    }));

    await prisma.tool.createMany({
      data: tools,
    });

    console.log('Seeded Successfully.');
  } catch (err) {
    console.log('prisma seed err', err);
    throw err;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
