import Link from "next/link";
import Image from "next/image";
import SimpleNavigation from "./components/SimpleNavigation";
import { getApiUrl } from "@/lib/getApiUrl";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  readingTime: number;
  publishedAt: Date | null;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  categories: {
    category: {
      id: string;
      name: string;
    };
  }[];
}

interface Category {
  id: string;
  name: string;
  postCount: number;
}

async function getRecentPosts(): Promise<Post[]> {
  const response = await fetch(getApiUrl('/api/posts/recent?limit=8'), {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recent posts');
  }

  return response.json();
}

async function getCategories(): Promise<Category[]> {
  const response = await fetch(getApiUrl('/api/categories/popular?limit=12'), {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
}

export default async function Home() {
  const [recentPosts, categories] = await Promise.all([
    getRecentPosts(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <SimpleNavigation />

      {/* Hero Section - Medium-like with featured post */}
      <section className="border-b border-gray-200 pt-10 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 tracking-tight">
                  Stay curious. <br />
                  Discover stories.
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-md">
                  Discover stories, thinking, and expertise from writers on any topic that matters to you.
                </p>
                <Link
                  href="/posts"
                  className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition inline-block"
                >
                  Start reading
                </Link>
              </div>

              {recentPosts.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 overflow-hidden">
                      {recentPosts[0].author.image && (
                        <Image
                          src={recentPosts[0].author.image}
                          alt={recentPosts[0].author.name || "Author"}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{recentPosts[0].author.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(recentPosts[0].publishedAt || recentPosts[0].createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-3 font-serif">
                    <Link href={`/posts/${recentPosts[0].id}`} className="hover:text-gray-700 transition">
                      {recentPosts[0].title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {recentPosts[0].excerpt || recentPosts[0].content.substring(0, 160) + '...'}
                  </p>

                  {recentPosts[0].featuredImage && (
                    <div className="mt-4 rounded-lg overflow-hidden h-48 relative">
                      <Image
                        src={recentPosts[0].featuredImage}
                        alt={recentPosts[0].title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Horizontal scrollable */}
      <section className="py-6 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-1 overflow-x-auto pb-2 scrollbar-hide">
            <Link
              href="/posts"
              className="whitespace-nowrap px-4 py-2 rounded-full bg-black text-white text-sm font-medium"
            >
              For You
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/posts?categoryId=${category.id}`}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium transition"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Posts Section - Medium-like grid */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 gap-10">
              {recentPosts.slice(1).map((post) => (
                <article key={post.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden">
                        {post.author.image && (
                          <Image
                            src={post.author.image}
                            alt={post.author.name || "Author"}
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <span className="text-sm font-medium">{post.author.name}</span>
                    </div>

                    <h3 className="text-xl font-bold font-serif">
                      <Link href={`/posts/${post.id}`} className="hover:text-gray-700 transition">
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-gray-600 line-clamp-2">
                      {post.excerpt || post.content.substring(0, 140) + '...'}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span>{post.readingTime} min read</span>
                      </div>

                      <div className="flex space-x-2">
                        {post.categories.slice(0, 1).map(({ category }) => (
                          <Link
                            key={category.id}
                            href={`/posts?categoryId=${category.id}`}
                            className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 hover:bg-gray-200 transition"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {post.featuredImage ? (
                    <div className="md:col-span-1 h-40 rounded-lg overflow-hidden relative">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="md:col-span-1 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/posts"
                className="bg-green-600 text-white px-6 py-3 rounded-full font-medium hover:bg-green-700 transition inline-block"
              >
                See more stories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Start Writing Section */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 font-serif">Share your ideas with the world</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join our community of writers and readers. Start writing today.
            </p>
            <Link
              href="/login"
              className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition inline-block"
            >
              Start Writing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-800 py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <h2 className="text-2xl font-bold font-serif">Journly</h2>
                <p className="text-gray-600 mt-2">Where good ideas find you.</p>
              </div>
              <div className="flex flex-wrap gap-8">
                <Link href="/about" className="hover:text-gray-600 transition">About</Link>
                <Link href="/contact" className="hover:text-gray-600 transition">Contact</Link>
                <Link href="/privacy" className="hover:text-gray-600 transition">Privacy</Link>
                <Link href="/terms" className="hover:text-gray-600 transition">Terms</Link>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
              <p>© {new Date().getFullYear()} Journly. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
