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
  // 크기/개수/속도가 다른 레이어 → 깊이감. 개수를 충분히 늘려 빽빽하게.
  const layers = useMemo(() => {
    const W = 2000;
    const H = 1100;
    return [
      { size: 1, shadow: buildShadow(1, 520, W, H), twinkle: 4, drift: 90 },
      { size: 1, shadow: buildShadow(7, 300, W, H), twinkle: 5.5, drift: 110 },
      { size: 2, shadow: buildShadow(2, 200, W, H), twinkle: 7, drift: 140 },
      { size: 3, shadow: buildShadow(3, 70, W, H), twinkle: 9, drift: 180 },
    ];
  }, []);

  return (
    <div
      aria-hidden
      className="no-print pointer-events-none fixed left-0 top-0 -z-10 hidden h-screen w-screen overflow-hidden dark:block"
      style={{
        // 좌→우 페이드(왼쪽 진하게). 그라데이션이 과하지 않게 완만히.
        WebkitMaskImage: "linear-gradient(to right, #000 0%, #000 55%, transparent 96%)",
        maskImage: "linear-gradient(to right, #000 0%, #000 55%, transparent 96%)",
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
