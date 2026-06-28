"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { Reveal } from "@/components/ui/Reveal";

export interface FolderItem {
  folder: string;
  count: number;
  latest: string;
}

export function FolderGrid({ folders, total }: { folders: FolderItem[]; total: number }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const filtered = useMemo(
    () => (query ? folders.filter((f) => f.folder.toLowerCase().includes(query)) : folders),
    [folders, query]
  );

  return (
    <>
      {/* Hero */}
      <Reveal>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-accent">archive</p>
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl">
              archive_studying<span className="text-accent">.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
              Notion TIL과 Velog 글을 자동으로 모아둔 학습 아카이브. 총{" "}
              <span className="font-semibold text-foreground">{total}</span>개의 글 ·{" "}
              <span className="font-semibold text-foreground">{folders.length}</span>개 폴더.
            </p>
          </div>
          <SearchInput value={q} onChange={setQ} placeholder="폴더 검색" />
        </div>
      </Reveal>

      {/* 폴더 카드 그리드 */}
      {filtered.length === 0 ? (
        <p className="mt-14 py-16 text-center text-sm text-muted-2">검색 결과가 없습니다.</p>
      ) : (
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f, i) => (
            <Reveal key={f.folder} delay={Math.min(i * 0.04, 0.3)}>
              <Link
                href={`/${encodeURIComponent(f.folder)}`}
                className="group flex h-full flex-col justify-between rounded-xl border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-bold tracking-tight text-foreground">{f.folder}</h2>
                  <ArrowUpRight className="h-4 w-4 text-muted-2 transition-colors group-hover:text-accent" />
                </div>
                <div className="mt-6 flex items-center justify-between font-mono text-xs text-muted-2">
                  <span>{f.count} posts</span>
                  <span>{f.latest}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}
