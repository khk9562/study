"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";

export interface PostItem {
  slug: string;
  title: string;
  tags: string[];
  created: string;
  createdEnd?: string | null;
  edited: string;
  excerpt: string;
}

export function FolderView({ folder, items }: { folder: string; items: PostItem[] }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!query) return items;
    return items.filter(
      (it) =>
        it.title.toLowerCase().includes(query) ||
        it.tags.some((t) => t.toLowerCase().includes(query))
    );
  }, [items, query]);

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-14">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {items.length} posts
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{folder}</h2>
        </div>
        <SearchInput value={q} onChange={setQ} placeholder="제목·태그 검색" />
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-2">검색 결과가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {filtered.map((p, i) => {
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
                    <div className="flex items-baseline gap-2.5">
                      <span className="shrink-0 font-mono tabular-nums text-base text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent">
                        {p.title}
                      </h3>
                    </div>
                    {p.excerpt && (
                      <p className="mt-1.5 line-clamp-2 px-1.5 text-[11px] leading-relaxed text-muted-2/70">
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
      )}
    </>
  );
}
