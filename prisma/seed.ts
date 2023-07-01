// seed database with initial data
import { Category, Prisma, PrismaClient, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
prisma.$connect();

async function main() {
  const usersFakeData = Array.from({ length: 50 }, (): Prisma.UserCreateInput => {
    const familyName = faker.name.lastName() + uuidv4();
    return {
      name: faker.name.middleName(),
      email: faker.internet.email(),
      password: '12345678',
      role: 'admin',
      family: {
        connectOrCreate: {
          where: { name: familyName },
          create: { name: familyName, apiKey: `family-costs-${uuidv4()}` },
        },
      },
    };
  });

  const users = await Promise.all(usersFakeData.map((user) => prisma.user.create({ data: user })));
  console.log(`Created ${users.length} users!`);

  const categoriesFakeData = Array.from({ length: 70 }, (): Prisma.CategoryCreateInput => {
    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      image: faker.image.imageUrl(),
      family: {
        connect: { id: users[Math.floor(Math.random() * users.length)].familyId },
      },
    };
  });

  const categories = await Promise.all(
    categoriesFakeData.map((category) => prisma.category.create({ data: category })),
  );
  console.log(`Created ${categories.length} categories!`);

  const expensesFakeData = Array.from({ length: 1000 }, (): Prisma.ExpenseCreateInput => {
    let user: User | null = null;
    let allowedCategory: Category | null = null;
    let categoryChosen = false;

    while (!categoryChosen) {
      user = users[Math.floor(Math.random() * users.length)];
      const allowedCategories = categories.filter((item) => item.familyId === user?.familyId);
      allowedCategory = allowedCategories[Math.floor(Math.random() * allowedCategories.length)];
      if (allowedCategory) categoryChosen = true;
    }

    if (!allowedCategory || !user) {
      throw new Error('Failed creating expense');
    }

    return {
      description: faker.commerce.productDescription(),
      amount: faker.commerce.price(),
      date: faker.date.past(),
      user: {
        connect: { id: user.id },
      },
      category: {
        connect: { id: allowedCategory.id },
      },
    };
  });

  // create expenses
  for (let i = 0; i <= expensesFakeData.length; i += 15) {
    const chunk = expensesFakeData.slice(i, i + 15);

    await Promise.all(
      chunk.map((expense) =>
        prisma.expense.create({
          data: expense,
        }),
      ),
    );
  }

  console.log(`Created expenses!`);
}

main()
  .then(() => console.log('Seeding Finished!'))
  .catch((err) => console.error('Seeding Failed.', err))
  .finally(async () => {
    await prisma.$disconnect();
  });
