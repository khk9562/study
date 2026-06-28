export function Footer() {
  return (
    <footer className="no-print border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-5 py-10 text-sm text-muted-2">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">archive_studying</p>
        <p>Notion TIL · Velog 글을 자동 동기화한 학습 아카이브.</p>
        <p>
          <a
            href="https://github.com/khk9562/archive_studying"
            className="hover:text-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/khk9562/archive_studying
          </a>
        </p>
      </div>
    </footer>
  );
}
