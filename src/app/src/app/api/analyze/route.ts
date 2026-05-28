import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ESTIMATE_PROMPT = `You are a professional landscaping estimator.
Analyze this yard photo. Return ONLY valid JSON — no markdown, no backticks:
{
  "square_footage": <integer>,
  "turf_type": "<Bermuda Grass | Kentucky Bluegrass | St. Augustine | Fescue | Zoysia | Mixed | Unknown>",
  "access_constraints": "<describe gates or obstacles, or write exactly: None detected>",
  "condition": "<pristine | maintained | neglected | overgrown | severely_overgrown>"
}`;

const AUDIT_PROMPT = `You are a landscaping job quality auditor.
Analyze this completed job photo. Return ONLY valid JSON — no markdown, no backticks:
{
  "quality": {
    "score": <integer 1-10>,
    "status": "<verified | acceptable | needs_attention | failed>",
    "notes": "<one sentence>"
  },
  "work_completed": ["<service>"],
  "upsell": {
    "detected": <true | false>,
    "description": "<opportunity or empty string>",
    "estimated_value": <integer dollars, 0 if none>
  },
  "client_message_draft": "<2-3 sentence professional message>",
  "flags": ["<operator alert>"],
  "raw_description": "<one sentence of what is visible>"
}`;

function jobId(): string {
  const d = new Date();
  return `JOB-${d.getMonth() + 1}${String(d.getDate()).padStart(2, "0")}-${
    Math.floor(Math.random() * 9000) + 1000
  }`;
}

function parseJSON(raw: string): Record<string, unknown> {
  return JSON.parse(
    raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()
  );
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not set. Add it in Vercel → Settings → Environment Variables." },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Could not parse form data." }, { status: 400 });
  }

  const photo = form.get("photo");
  const mode = (form.get("mode") as string) ?? "estimate";

  if (!photo || typeof photo === "string") {
    return NextResponse.json({ error: "No photo provided." }, { status: 400 });
  }

  if ((photo as File).size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Photo exceeds 10 MB limit." }, { status: 413 });
  }

  const bytes = await (photo as File).arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mediaType = ((photo as File).type || "image/jpeg") as
    | "image/jpeg"
    | "image/png"
    | "image/gif"
    | "image/webp";

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let vision: Record<string, unknown>;
  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: mode === "audit" ? 800 : 400,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: mode === "audit" ? AUDIT_PROMPT : ESTIMATE_PROMPT,
            },
          ],
        },
      ],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text : "";
    vision = parseJSON(text);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Claude Vision failed";
    console.error("[crewroute] Claude error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  return NextResponse.json({
    job_id: jobId(),
    mode,
    analyzed_at: new Date().toISOString(),
    ...vision,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
