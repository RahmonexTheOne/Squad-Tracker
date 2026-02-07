import { verifyKey } from "discord-interactions";

export const runtime = "nodejs";

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
  try {
    const signature = req.headers.get("X-Signature-Ed25519");
    const timestamp = req.headers.get("X-Signature-Timestamp");

    // IMPORTANT: body brute
    const body = await req.text();

    if (!signature || !timestamp) {
      return new Response("Unauthorized", { status: 401 });
    }

    const publicKey = process.env.DISCORD_PUBLIC_KEY?.trim();
    if (!publicKey) {
      console.error("Missing DISCORD_PUBLIC_KEY");
      return new Response("Server misconfigured", { status: 500 });
    }

    const ok = verifyKey(body, signature, timestamp, publicKey);
    if (!ok) {
      return new Response("Invalid signature", { status: 401 });
    }

    const interaction = JSON.parse(body);

    if (interaction.type === 1) {
      // PONG strict
      return new Response(JSON.stringify({ type: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unhandled interaction" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Interactions endpoint crashed:", err);
    return new Response("Internal error", { status: 500 });
  }
}
