"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

export function SearchInput({
  value,
  onChange,
  placeholder = "검색",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  // 입력창에 보이는 텍스트(조합 중 포함)는 내부 상태로, 실제 검색어(value)는
  // 한글 조합이 끝났을 때만 갱신 → 자음/모음 단위가 아니라 완성된 글자 단위로 검색
  const [text, setText] = useState(value);
  const composing = useRef(false);

  // 외부에서 value가 바뀌면(예: 초기화) 표시 텍스트도 동기화
  useEffect(() => setText(value), [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setText(v);
    if (!composing.current && !e.nativeEvent.isComposing) onChange(v);
  };

  const clear = () => {
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
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={(e) => {
          composing.current = false;
          onChange(e.currentTarget.value); // 조합 완료 시점에 검색어 반영
        }}
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
