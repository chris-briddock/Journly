import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addMonths } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a system user for categories with admin role
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@journly.site' },
    update: {
      role: 'admin'
    },
    create: {
      email: 'system@journly.site',
      name: 'System',
      role: 'admin'
    },
  });

  console.log('Created system user for categories');

  // Create an admin user with password and unlimited subscription
  const hashedPassword = await bcrypt.hash(`${process.env.ADMIN_PASSWORD}`, 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'chris@journly.site' },
    update: {
      role: 'admin',
      monthlyArticleLimit: 999999, // Effectively unlimited articles
      emailVerified: new Date() // Admin should be pre-verified
    },
    create: {
      email: 'chris@journly.site',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
      monthlyArticleLimit: 999999, // Effectively unlimited articles
      emailVerified: new Date() // Admin should be pre-verified
    },
  });

  console.log('Created admin user for management');

  // Create or update admin subscription (MEMBER tier with unlimited access)
  const tenYearsFromNow = addMonths(new Date(), (12 * 10));

  await prisma.subscription.upsert({
    where: { userId: adminUser.id },
    update: {
      tier: 'MEMBER',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: tenYearsFromNow,
      cancelAtPeriodEnd: false
    },
    create: {
      userId: adminUser.id,
      tier: 'MEMBER',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: tenYearsFromNow,
      cancelAtPeriodEnd: false
    }
  });

  console.log('Created unlimited subscription for admin user');

  // Create default categories
  const defaultCategories = [
    {
      name: 'Technology',
      description: 'Articles about software, hardware, and tech trends',
      isDefault: true,
    },
    {
      name: 'Design',
      description: 'UI/UX design, graphic design, and creative processes',
      isDefault: true,
    },
    {
      name: 'Business',
      description: 'Entrepreneurship, marketing, and business strategies',
      isDefault: true,
    },
    {
      name: 'Lifestyle',
      description: 'Health, wellness, travel, and personal development',
      isDefault: true,
    },
    {
      name: 'Programming',
      description: 'Coding tutorials, programming languages, and development tips',
      isDefault: true,
    },
    {
      name: 'Writing',
      description: 'Writing tips, book reviews, and literary analysis',
      isDefault: true,
    },
    {
      name: 'Photography',
      description: 'Photography tips, techniques, and photo essays',
      isDefault: true,
    },
    {
      name: 'Art',
      description: 'Art appreciation, techniques, and artist interviews',
      isDefault: true,
    },
    {
      name: 'Music',
      description: 'Music reviews, concerts, and artist interviews',
      isDefault: true,
    },
    {
      name: 'Fashion',
      description: 'Fashion trends, style tips, and runway shows',
      isDefault: true,
    },
    {
      name: 'Gaming',
      description: 'Gaming news, reviews, and esports',
      isDefault: true,
    },
    {
      name: 'Food',
      description: 'Food reviews, recipes, and culinary arts',
      isDefault: true,
    },
    {
      name: 'News',
      description: 'Latest news and current events from around the world.',
      isDefault: true,
    },
    {
      name: 'Uncategorized',
      description: 'Posts without a specific category',
      isDefault: true,
    }
  ];

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: {
        ...category,
        createdById: systemUser.id,
      },
    });
    console.log(`Created category: ${category.name}`);
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
