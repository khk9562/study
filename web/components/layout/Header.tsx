"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors ${
        scrolled ? "border-border bg-background/80 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="text-base font-bold tracking-tight text-foreground">
          archive_studying<span className="text-accent">.</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
