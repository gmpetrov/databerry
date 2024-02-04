import { Prisma } from '@prisma/client';

import { prisma } from '@chaindesk/prisma/client';

(async () => {
  const agentWithHumanRequested = await prisma.agent.findMany({
    where: {
      visibility: 'public',
      OR: [
        {
          interfaceConfig: {
            path: ['isHumanRequestedDisabled'],
            equals: false,
          },
        },
        {
          interfaceConfig: {
            path: ['isHumanRequestedDisabled'],
            equals: Prisma.AnyNull,
          },
        },
      ],
    },
  });

  await prisma.tool.createMany({
    data: agentWithHumanRequested.map((agent) => ({
      type: 'request_human',
      agentId: agent.id,
    })),
  });

  const agentWitMarkAsResolved = await prisma.agent.findMany({
    where: {
      visibility: 'public',
      OR: [
        {
          interfaceConfig: {
            path: ['isMarkAsResolvedDisabled'],
            equals: false,
          },
        },
        {
          interfaceConfig: {
            path: ['isMarkAsResolvedDisabled'],
            equals: Prisma.AnyNull,
          },
        },
      ],
    },
  });

  await prisma.tool.createMany({
    data: agentWitMarkAsResolved.map((agent) => ({
      type: 'mark_as_resolved',
      agentId: agent.id,
    })),
  });

  const agentWitCaptureLead = await prisma.agent.findMany({
    where: {
      visibility: 'public',
      OR: [
        {
          interfaceConfig: {
            path: ['isLeadCaptureDisabled'],
            equals: false,
          },
        },
        {
          interfaceConfig: {
            path: ['isLeadCaptureDisabled'],
            equals: Prisma.AnyNull,
          },
        },
      ],
    },
  });

  await prisma.tool.createMany({
    data: agentWitCaptureLead.map((agent) => ({
      type: 'lead_capture',
      agentId: agent.id,
      config: {
        isEmailEnabled: true,
        isPhoneNumberEnabled: false,
        isRequired: false,
      },
    })),
  });

  console.log('✅ Done');
})();
