export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-10 md:mb-14">
      {eyebrow && (
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h2>
      {description && (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
