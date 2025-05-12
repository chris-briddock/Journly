import { PrismaClient } from '@prisma/client';
import { calculateReadingTime } from '../src/lib/readingTime';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating reading time for all posts...');
  
  // Get all posts
  const posts = await prisma.post.findMany();
  console.log(`Found ${posts.length} posts to update`);
  
  // Update each post with calculated reading time
  for (const post of posts) {
    const readingTime = calculateReadingTime(post.content);
    
    await prisma.post.update({
      where: { id: post.id },
      data: { readingTime }
    });
    
    console.log(`Updated post "${post.title}" with reading time: ${readingTime} minutes`);
  }
  
  console.log('All posts updated successfully!');
}

main()
  .catch((e) => {
    console.error('Error updating reading time:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
