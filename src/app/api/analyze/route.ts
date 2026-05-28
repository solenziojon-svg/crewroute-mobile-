import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File;
    const mode = (formData.get('mode') as string) || 'estimate';

    if (!file) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString('base64');

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      temperature: 0,
      system: mode === "estimate" 
        ? "You are a professional landscaping estimator. Return clean JSON only." 
        : "You are a professional landscaping quality auditor. Return clean JSON only.",
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: file.type as any,
              data: base64Image,
            },
          },
          { 
            type: "text", 
            text: mode === "estimate" 
              ? "Analyze this yard and return JSON with square_footage, turf_type, access_constraints, and condition." 
              : "Analyze this completed job and return JSON with quality, work_completed, upsell, client_message_draft, and flags." 
          } 0 0].text 
      :";

    let parsed;
    try {
      const jsonMatch = text.match(/\{ *\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "No JSON found" };
    } catch (e) {
      parsed = { error: "Failed to parse response" };
    }

    return NextResponse.json({
      job_id: "JOB-" + Date.now(),
      mode,
      analyzed_at: new Date().toISOString(),
      ...parsed,
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ 
      error: error.message || "Internal server error" 
    }, { status: 500 });
  }
}