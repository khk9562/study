"use client";

import { useRef, useState } from "react";
import { Search, X } from "lucide-react";

/**
 * 입력은 즉시 표시(text)하되, 실제 검색(onChange)은 200ms 디바운스.
 * 한글 IME 조합 중 쏟아지는 중간 입력(자음/모음 단위)을 흘려보내고,
 * 입력이 잠깐 멈춘 = 글자가 완성된 시점에만 필터링한다.
 */
export function SearchInput({
  value = "",
  onChange,
  placeholder = "검색",
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = (v: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setText(v);
    fire(v);
  };

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    setText("");
    onChange("");
  };

  return (
    <div className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-2 focus:border-accent"
      />
      {text && (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={clear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-2 transition-colors hover:text-accent"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
