import { verifyKey } from "discord-interactions";

export const runtime = "edge";

// Discord / infra probes during validation:
export function GET() {
  return new Response("OK", { status: 200 });
}

export function HEAD() {
  return new Response(null, { status: 200 });
}

export function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function POST(req: Request) {
  const signature = req.headers.get("X-Signature-Ed25519");
  const timestamp = req.headers.get("X-Signature-Timestamp");
  const body = await req.text();

  if (!signature || !timestamp || !body) {
    return new Response(JSON.stringify({ error: "Bad request" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) {
    return new Response(JSON.stringify({ error: "Missing DISCORD_PUBLIC_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const isValidRequest = verifyKey(body, signature, timestamp, publicKey);
  if (!isValidRequest) {
    return new Response(JSON.stringify({ error: "Bad request signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const interaction = JSON.parse(body);

  // PING => must be immediate 200 with {"type":1}
  if (interaction.type === 1) {
    return new Response(JSON.stringify({ type: 1 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Unknown command" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
