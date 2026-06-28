import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getAllPosts, getPost } from "@/lib/posts";
import { Badge } from "@/components/ui/Badge";
import { Markdown } from "@/components/Markdown";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ folder: p.folder, slug: p.slug }));
}

function decode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ folder: string; slug: string }>;
}) {
  const { folder: f, slug: s } = await params;
  const folder = decode(f);
  const post = getPost(folder, decode(s));
  if (!post) notFound();

  const created =
    post.createdEnd && post.createdEnd !== post.created
      ? `${post.created} ~ ${post.createdEnd}`
      : post.created;

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:py-20">
      <Link
        href={`/${encodeURIComponent(folder)}`}
        className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.15em] text-muted-2 transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {folder}
      </Link>

      <header className="mb-10 border-b border-border pb-8">
        <h1 className="text-3xl font-bold leading-snug tracking-tight text-foreground md:text-4xl">
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-2">
          <span>작성 {created}</span>
          <span>·</span>
          <span>수정 {post.edited}</span>
          {post.velogUrl && (
            <a
              href={post.velogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent hover:opacity-80"
            >
              Velog 원문 <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <Badge key={t} variant="accent">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <Markdown>{post.body}</Markdown>
    </article>
  );
}
