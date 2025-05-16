import { getPosts as getPostsApi, getCategories as getCategoriesApi } from "@/lib/api";
import PostsPageClient from "../components/PostsPageClient";

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
  return await getCategoriesApi();
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

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
