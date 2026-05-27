import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const chores = await prisma.chore.findMany({
      orderBy: { id: "desc" },
      include: {
        steps: {
          orderBy: { sequence_order: "asc" },
        },
        _count: {
          select: { assignments: true },
        },
      },
    });
    return NextResponse.json(chores);
  } catch (error) {
    console.error("GET /api/chores error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chores" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, difficulty_rating, steps } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Chore name is required" },
        { status: 400 }
      );
    }

    const chore = await prisma.chore.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        difficulty_rating: difficulty_rating || 1,
        steps:
          steps && Array.isArray(steps)
            ? {
                create: steps.map((text: string, index: number) => ({
                  text,
                  sequence_order: index,
                })),
              }
            : undefined,
      },
      include: {
        steps: {
          orderBy: { sequence_order: "asc" },
        },
      },
    });

    return NextResponse.json(chore, { status: 201 });
  } catch (error) {
    console.error("POST /api/chores error:", error);
    return NextResponse.json(
      { error: "Failed to create chore" },
      { status: 500 }
    );
  }
}
