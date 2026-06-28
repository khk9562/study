import { getAllPosts, getFolders } from "@/lib/posts";
import { FolderGrid } from "@/components/FolderGrid";

export default function Home() {
  const folders = getFolders();
  const total = getAllPosts().length;

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 md:py-24">
      <FolderGrid folders={folders} total={total} />
    </div>
  );
}
