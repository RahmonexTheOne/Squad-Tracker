import { verifyKey } from "discord-interactions";

export const runtime = "edge";

// Some Discord/infra probes may use these methods during verification.
// Returning 200 prevents the generic "could not be verified" error.
export async function GET() {
  return new Response("OK", { status: 200 });
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}

export async function OPTIONS() {
  return new Response(null, { status: 200 });
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
    // Misconfigured env var will break validation in prod.
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

  // PING -> PONG (must be an immediate 200 with {"type":1})
  if (interaction.type === 1) {
    return new Response(JSON.stringify({ type: 1 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ... handle other commands
  return new Response(JSON.stringify({ error: "Unknown command" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
