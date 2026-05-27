import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required" },
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
              "You are a helpful assistant that breaks household chores into clear, actionable steps. Given a chore description, return a JSON array of step strings (3-8 steps). Each step should be a single actionable instruction. Return ONLY valid JSON, no markdown or extra text. Example: [\"Gather supplies\", \"Wipe surfaces\", \"Rinse\", \"Dry with towel\"]",
          },
          {
            role: "user",
            content: `Break this chore into actionable steps: "${description}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
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

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 502 }
      );
    }

    try {
      const steps = JSON.parse(content);
      if (!Array.isArray(steps)) throw new Error("Not an array");
      return NextResponse.json({ steps });
    } catch {
      // Try to extract JSON array from content
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        const steps = JSON.parse(match[0]);
        return NextResponse.json({ steps });
      }
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("generate-steps error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
