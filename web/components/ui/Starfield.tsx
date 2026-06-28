"use client";

import { useMemo } from "react";

// 결정적 PRNG(mulberry32) — 고정 seed로 SSR/CSR 좌표 일치(하이드레이션 불일치 방지)
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 박스섀도 점들로 별 흩뿌리기
function buildShadow(seed: number, count: number, w: number, h: number): string {
  const rand = mulberry32(seed);
  const pts: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(rand() * w);
    const y = Math.floor(rand() * h);
    const a = (0.5 + rand() * 0.5).toFixed(2);
    pts.push(`${x}px ${y}px rgba(255,255,255,${a})`);
  }
  return pts.join(", ");
}

export function Starfield() {
  // 크기/개수/속도가 다른 3개 레이어 → 깊이감
  const layers = useMemo(() => {
    const W = 1920;
    const H = 1200;
    return [
      { size: 1, shadow: buildShadow(1, 80, W, H), twinkle: 4, drift: 90 },
      { size: 2, shadow: buildShadow(2, 36, W, H), twinkle: 6, drift: 130 },
      { size: 3, shadow: buildShadow(3, 16, W, H), twinkle: 9, drift: 170 },
    ];
  }, []);

  return (
    <div
      aria-hidden
      className="no-print pointer-events-none fixed left-0 top-0 -z-10 hidden h-screen w-screen overflow-hidden dark:block"
      style={{
        WebkitMaskImage: "radial-gradient(130% 100% at 0% 0%, #000 35%, transparent 78%)",
        maskImage: "radial-gradient(130% 100% at 0% 0%, #000 35%, transparent 78%)",
      }}
    >
      {layers.map((l, i) => (
        <div
          key={i}
          className="star-layer absolute left-0 top-0 rounded-full"
          style={{
            width: l.size,
            height: l.size,
            boxShadow: l.shadow,
            animation: `star-twinkle ${l.twinkle}s ease-in-out ${i * 0.6}s infinite, star-drift ${l.drift}s linear infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}
