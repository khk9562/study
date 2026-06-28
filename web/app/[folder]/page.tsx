import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getFolders, getPostsByFolder } from "@/lib/posts";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";

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

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 md:py-20">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.15em] text-muted-2 transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 전체 폴더
      </Link>

      <SectionHeading eyebrow={`${posts.length} posts`} title={folder} />

      <ul className="divide-y divide-border border-y border-border">
        {posts.map((p, i) => {
          const created =
            p.createdEnd && p.createdEnd !== p.created
              ? `${p.created} ~ ${p.createdEnd}`
              : p.created;
          return (
            <Reveal key={p.slug} delay={Math.min(i * 0.03, 0.3)}>
              <li>
                <Link
                  href={`/${encodeURIComponent(folder)}/${encodeURIComponent(p.slug)}`}
                  className="group block rounded-lg px-3 py-5 transition-colors hover:bg-surface-2/50 sm:px-4"
                >
                  <h3 className="text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent">
                    {p.title}
                  </h3>
                  {p.excerpt && (
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-2">
                      {p.excerpt}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.slice(0, 4).map((t) => (
                        <Badge key={t} variant="outline">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <span className="shrink-0 font-mono text-xs text-muted-2">
                      작성 {created}
                      {p.edited && ` · 수정 ${p.edited}`}
                    </span>
                  </div>
                </Link>
              </li>
            </Reveal>
          );
        })}
      </ul>
    </div>
  );
}
