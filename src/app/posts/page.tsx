import { getPosts as getPostsApi, } from "@/lib/services/getPosts";
import { getCategories as getCategoriesApi } from "@/lib/services/getCategories";
import PostsPageClient from "../components/PostsPageClient";
import { auth } from "@/lib/auth";

type SearchParams = {
  categoryId?: string;
  page?: string;
};

async function getPosts(searchParams: SearchParams) {
  const page = Number(searchParams.page) || 1;
  const limit = 12;

  return await getPostsApi({
    page,
    limit,
    categoryId: searchParams.categoryId,
    status: 'published'
  });
}

async function getCategories() {
  return await getCategoriesApi(false);
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await auth();

  // If no user is logged in, they should be redirected by middleware
  // This is a fallback in case middleware fails
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Login Required</h1>
          <p className="mb-4">You need to be logged in to browse articles.</p>
          <div className="flex justify-center">
            <a
              href="/login?from=/posts"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  const [{ posts, pagination }, categories] = await Promise.all([
    getPosts(params),
    getCategories(),
  ]);

  const selectedCategoryId = params.categoryId;

  return (
    <PostsPageClient
      posts={posts}
      categories={categories}
      pagination={pagination}
      selectedCategoryId={selectedCategoryId}
    />
  );
}
