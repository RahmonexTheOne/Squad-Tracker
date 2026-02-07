import { verifyKey } from "discord-interactions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("X-Signature-Ed25519");
    const timestamp = req.headers.get("X-Signature-Timestamp");
    const body = await req.text();

    if (!signature || !timestamp) return new Response("Unauthorized", { status: 401 });

    const publicKey = process.env.DISCORD_PUBLIC_KEY?.trim();
    if (!publicKey) return new Response("Missing key", { status: 500 });

    const ok = verifyKey(body, signature, timestamp, publicKey);
    if (!ok) return new Response("Bad signature", { status: 401 });

    const interaction = JSON.parse(body);

    if (interaction.type === 1) {
      return new Response(JSON.stringify({ type: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unhandled" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Interactions crash:", e);
    return new Response("Internal error", { status: 500 });
  }
}
