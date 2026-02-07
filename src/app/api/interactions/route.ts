import { verifyKey } from "discord-interactions";

export const runtime = "edge";

export function GET() {
  return new Response("OK", { status: 200 });
}
export function HEAD() {
  return new Response(null, { status: 200 });
}
export function OPTIONS() {
  return new Response(null, { status: 200 });
}

export async function POST(req: Request) {
  const signature = req.headers.get("X-Signature-Ed25519");
  const timestamp = req.headers.get("X-Signature-Timestamp");
  const body = await req.text();

  if (!signature || !timestamp) {
    return new Response("Unauthorized", { status: 401 });
  }

  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) {
    return new Response("Missing DISCORD_PUBLIC_KEY", { status: 500 });
  }

  const isValid = verifyKey(body, signature, timestamp, publicKey);
  if (!isValid) {
    return new Response("Invalid request signature", { status: 401 });
  }

  const interaction = JSON.parse(body);

  // ✅ PING => PONG strict
  if (interaction.type === 1) {
    return new Response(JSON.stringify({ type: 1 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Unhandled interaction" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
