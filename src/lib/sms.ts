export function isBulkSmsConfigured(): boolean {
  return Boolean(
    process.env.BULKSMS_API_KEY?.trim() &&
      process.env.BULKSMS_SENDER_ID?.trim()
  );
}

export function normalizeBdPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (/^01[3-9]\d{8}$/.test(digits)) return `88${digits}`;
  if (/^8801[3-9]\d{8}$/.test(digits)) return digits;
  return null;
}

export async function sendBulkSmsBd(
  phone: string,
  message: string
): Promise<{ ok: boolean; response: string }> {
  const apiKey = process.env.BULKSMS_API_KEY;
  const senderId = process.env.BULKSMS_SENDER_ID;

  if (!apiKey || !senderId) {
    return { ok: false, response: "BULKSMS_API_KEY or BULKSMS_SENDER_ID not set" };
  }

  const number = normalizeBdPhone(phone);
  if (!number) {
    return { ok: false, response: "Invalid phone number" };
  }

  const url = new URL("http://bulksmsbd.net/api/smsapi");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("type", "text");
  url.searchParams.set("number", number);
  url.searchParams.set("senderid", senderId);
  url.searchParams.set("message", message);

  const res = await fetch(url.toString(), { method: "GET" });
  const text = await res.text();

  const ok =
    res.ok &&
    !/error|fail|invalid|insufficient/i.test(text);

  return { ok, response: text.slice(0, 500) };
}
