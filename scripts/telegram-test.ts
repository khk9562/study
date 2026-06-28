/**
 * 로컬에서 Telegram 봇 연동을 테스트한다.
 *   npm run telegram:test            → 기본 테스트 메시지 전송
 *   npm run telegram:test -- "내용"   → 원하는 메시지 전송
 *
 * 토큰/챗 ID는 .env 또는 환경변수에서 읽는다:
 *   TELEGRAM_BOT_TOKEN=123:abc TELEGRAM_CHAT_ID=12345 npm run telegram:test
 */
import { loadDotenv } from "./config.js";

loadDotenv();

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

if (!token || !chatId) {
  console.error("❌ TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID 가 없습니다.");
  console.error("   .env 파일에 넣거나 환경변수로 전달하세요. (예: .env.example 참고)");
  process.exit(1);
}

const text = process.argv.slice(2).join(" ") || "✅ TIL 봇 연동 테스트 — 이 메시지가 보이면 정상입니다.";

const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
});

const body: any = await res.json().catch(() => ({}));

if (res.ok && body.ok) {
  console.log("✅ 전송 성공! 텔레그램을 확인하세요.");
} else {
  console.error(`❌ 전송 실패 (HTTP ${res.status})`);
  console.error(`   error_code: ${body.error_code ?? "?"} / description: ${body.description ?? "(없음)"}`);
  if (res.status === 401) console.error("   → 봇 토큰이 틀렸을 가능성이 큽니다.");
  if (body.description?.includes("chat not found"))
    console.error("   → 챗 ID가 틀렸거나, 아직 봇에게 먼저 말을 걸지 않았습니다(1:1 대화에서 아무 메시지나 보내보세요).");
  process.exit(1);
}
