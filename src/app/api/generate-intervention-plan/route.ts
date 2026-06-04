import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_name, grade, subject, gap, current_score } = body;

    if (!student_name || !grade || !subject || !gap) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = `Generate a 5-7 step personalized catch-up plan for:
- Student: ${student_name}, Grade: ${grade}
- Subject: ${subject}
- Knowledge gap: ${gap}
- Current score: ${current_score}%

Focus on: video lessons, interactive practice, quizzes, peer learning

Return ONLY valid JSON (no markdown, no code blocks) with this structure:
{
  "gap": "concise description of the gap",
  "urgency": "high|medium|low",
  "estimatedCatchUp": "timeframe like '2-3 weeks'",
  "steps": [
    {
      "type": "video|lesson|practice|quiz",
      "title": "step title",
      "description": "brief description",
      "duration": "e.g., '15 min'"
    }
  ],
  "parentNote": "guidance for parents on how to support"
}`;

    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const planJson = JSON.parse(content.text);

    return NextResponse.json(planJson);
  } catch (error) {
    console.error("Error generating intervention plan:", error);
    return NextResponse.json(
      { error: "Failed to generate intervention plan" },
      { status: 500 }
    );
  }
}
