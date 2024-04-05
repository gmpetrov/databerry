import cuid from 'cuid';
import { NextApiResponse } from 'next';

import { FormSubmission, render } from '@chaindesk/emails';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import mailer from '@chaindesk/lib/mailer';
import cors from '@chaindesk/lib/middlewares/cors';
import pipe from '@chaindesk/lib/middlewares/pipe';
import roles from '@chaindesk/lib/middlewares/roles';
import { FormConfigSchema, FormSubmitSchema } from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import { FormStatus, MembershipRole } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createLazyAuthHandler();

export const getForm = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const id = req.query.formId as string;

  const existingForm = await prisma.form.findUnique({
    where: {
      id,
    },
  });
  if (!existingForm) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }
  return existingForm;
};

handler.get(respond(getForm));

export const postForm = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = FormSubmitSchema.parse(req.body);
  const id = req.query.formId as string;
  const submissionId = data?.submissionId || cuid();

  const form = await prisma.form.findUnique({
    where: {
      id,
    },
  });

  if (!form) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  const submission = await prisma.formSubmission.upsert({
    where: {
      id: submissionId,
    },
    create: {
      ...(data?.conversationId ? { conversationId: data.conversationId } : {}),
      ...(data?.messageId ? { messageId: data.messageId } : {}),
      formId: data.formId,
      data: data.formValues as any,
      status: FormStatus.COMPLETED,
    },
    update: {
      data: data.formValues as any,
      status: FormStatus.COMPLETED,
    },
    include: {
      form: {
        include: {
          organization: {
            select: {
              memberships: {
                where: {
                  role: MembershipRole.OWNER,
                },
                include: {
                  user: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const orgId = form.organizationId as string;

  const config = (form?.publishedConfig ??
    form?.draftConfig) as FormConfigSchema;

  const emailFields = config.fields.filter(
    (field) => field.type === 'email' && !!field.shouldCreateContact
  );
  const emails = emailFields
    .map((field) => data.formValues[field.name])
    .filter((each) => !!each) as string[];
  const phoneFields = config.fields.filter(
    (field) => field.type === 'phoneNumber' && !!field.shouldCreateContact
  );
  const phoneNumbers = phoneFields
    .map((field) => data.formValues[field.name])
    .filter((each) => !!each) as string[];

  if (emails.length > 0 || phoneNumbers.length > 0) {
    // https://github.com/prisma/prisma/issues/4134 switch to upserMany when ready
    await Promise.all([
      ...emails.map((email) =>
        prisma.contact.upsert({
          where: {
            unique_email_for_org: {
              email,
              organizationId: orgId,
            },
          },
          create: {
            email,
            organizationId: orgId,
          },
          update: {
            email,
          },
        })
      ),
      ...phoneNumbers.map((phoneNumber) =>
        prisma.contact.upsert({
          where: {
            unique_phone_number_for_org: {
              phoneNumber,
              organizationId: orgId,
            },
          },
          create: {
            phoneNumber,
            organizationId: orgId,
          },
          update: {
            phoneNumber,
          },
        })
      ),
    ]);
  }

  const ownerEmail =
    submission?.form?.organization?.memberships?.[0].user?.email;

  await mailer.sendMail({
    from: {
      name: 'Chaindesk',
      address: process.env.EMAIL_FROM!,
    },
    to: ownerEmail!,
    subject: `📬 New form submission from "${submission?.form?.name}"`,
    html: render(
      <FormSubmission
        ctaLink={`${process.env.NEXT_PUBLIC_DASHBOARD_URL}/forms/${data?.formId}/admin?tab=submissions&limit=25&offset=0`}
        values={data.formValues}
        formName={submission?.form?.name!}
      />
    ),
  });

  const webhookUrl = config?.webhook?.url;

  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });
    } catch (e) {
      console.log('error', e);
    }
  }

  return submission;
};

handler.post(
  validate({
    handler: respond(postForm),
    body: FormSubmitSchema,
  })
);

export const deleteForm = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const id = req.query.formId as string;

  if (!req?.session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const form = await prisma.form.findUnique({
    where: {
      id,
    },
  });

  if (req?.session?.organization?.id !== form?.organizationId) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return prisma.form.delete({
    where: {
      id,
    },
  });
};

handler.delete(
  pipe(roles([MembershipRole.ADMIN, MembershipRole.OWNER]), respond(deleteForm))
);

export default pipe(cors({ methods: ['GET', 'HEAD', 'POST'] }), handler);
