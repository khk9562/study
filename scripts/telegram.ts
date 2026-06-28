/**
 * Telegram 알림. 봇 토큰/챗 ID가 없으면 조용히 건너뛴다(동기화 자체는 실패시키지 않음).
 */

export interface TelegramConfig {
  token?: string;
  chatId?: string;
}

export function telegramEnabled(cfg: TelegramConfig): boolean {
  return Boolean(cfg.token && cfg.chatId);
}

/** Telegram 메시지 1건 전송. 실패해도 throw 하지 않고 경고만 남긴다. */
export async function sendTelegram(cfg: TelegramConfig, text: string): Promise<void> {
  if (!telegramEnabled(cfg)) return;
  // Telegram 메시지 최대 4096자
  const body = text.length > 4000 ? text.slice(0, 3990) + "\n…(생략)" : text;
  try {
    const res = await fetch(`https://api.telegram.org/bot${cfg.token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: cfg.chatId,
        text: body,
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.warn(`⚠ Telegram 전송 실패 (${res.status}): ${t.slice(0, 200)}`);
    }
  } catch (e) {
    console.warn(`⚠ Telegram 전송 예외: ${(e as Error).message}`);
  }
}
