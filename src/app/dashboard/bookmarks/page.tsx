import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookmarksPageClient } from "@/app/components/dashboard/BookmarksPageClient";

export default async function BookmarksPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookmarks</h1>
        <p className="text-muted-foreground">
          Your saved articles for later reading
        </p>
      </div>
      
      <BookmarksPageClient />
    </div>
  );
}
