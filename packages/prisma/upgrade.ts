import prisma from './client';

async function main() {
  try {
    const id =
      process.env.npm_config_org ||
      process.argv[process.argv.length - 1].split('=')[1];

    if (!id) {
      console.error('Hint: The org flag is required --org=<id>');
      process.exit(1);
    }

    const found = await prisma.organization.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
    if (!found) {
      console.error('Organisation was not found');
      process.exit(1);
    }

    const premium = await prisma.product.findFirst({
      where: {
        name: 'Pro',
      },
      include: {
        prices: true,
      },
    });

    if (!premium) {
      console.error('Hint: run prisma:seed');
      process.exit(1);
    }

    await prisma.subscription.create({
      data: {
        organizationId: id,
        priceId: premium.prices[0].id,
        status: 'active',
        customerId: '33',
      },
    });
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
    // await prisma.$disconnect();
  });
