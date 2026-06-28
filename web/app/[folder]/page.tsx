import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getFolders, getPostsByFolder } from "@/lib/posts";
import { FolderView, type PostItem } from "@/components/FolderView";

export const dynamicParams = false;

export function generateStaticParams() {
  return getFolders().map((f) => ({ folder: f.folder }));
}

function decode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export default async function FolderPage({
  params,
}: {
  params: Promise<{ folder: string }>;
}) {
  const folder = decode((await params).folder);
  const posts = getPostsByFolder(folder);
  if (posts.length === 0) notFound();

  const items: PostItem[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    tags: p.tags,
    created: p.created,
    createdEnd: p.createdEnd ?? null,
    edited: p.edited,
    excerpt: p.excerpt,
  }));

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 md:py-20">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.15em] text-muted-2 transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 전체 폴더
      </Link>

      <FolderView folder={folder} items={items} />
    </div>
  );
}
