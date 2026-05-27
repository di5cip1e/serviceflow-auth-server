import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { steps, choreName } = await request.json();

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        { error: "Steps array is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert at evaluating the difficulty of household tasks. Given a chore name and its ordered steps, rate the overall difficulty on a scale of 1-10 based on physical effort, complexity, time required, and attention needed. Return ONLY a JSON object with a single integer field: {\"rating\": N}. No markdown, no extra text.",
          },
          {
            role: "user",
            content: `Chore: "${choreName}"\nSteps:\n${steps.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}\n\nRate difficulty 1-10.`,
          },
        ],
        temperature: 0.2,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error:", response.status, errText);
      return NextResponse.json(
        { error: "AI service error" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    try {
      const parsed = JSON.parse(content);
      const rating = Math.min(10, Math.max(1, Math.round(parsed.rating || parsed.score || 5)));
      return NextResponse.json({ rating });
    } catch {
      const match = content.match(/\d+/);
      const rating = match ? Math.min(10, Math.max(1, parseInt(match[0]))) : 5;
      return NextResponse.json({ rating });
    }
  } catch (error) {
    console.error("rate-difficulty error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
