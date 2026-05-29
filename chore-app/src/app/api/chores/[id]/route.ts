import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.chore.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/chores/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete chore" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, difficulty_rating, steps } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name must be a non-empty string" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (difficulty_rating !== undefined) {
      const rating = Number(difficulty_rating);
      if (isNaN(rating) || rating < 1 || rating > 10) {
        return NextResponse.json(
          { error: "Difficulty must be between 1 and 10" },
          { status: 400 }
        );
      }
      updateData.difficulty_rating = rating;
    }

    // If steps are provided, replace all existing steps
    if (steps !== undefined) {
      if (!Array.isArray(steps)) {
        return NextResponse.json(
          { error: "Steps must be an array" },
          { status: 400 }
        );
      }
      // Delete existing steps
      await prisma.step.deleteMany({
        where: { choreId: parseInt(id) },
      });
      // Create new steps
      updateData.steps = {
        create: steps.map((text: string, index: number) => ({
          text,
          sequence_order: index,
        })),
      };
    }

    const chore = await prisma.chore.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        steps: {
          orderBy: { sequence_order: "asc" },
        },
      },
    });

    return NextResponse.json(chore);
  } catch (error) {
    console.error("PATCH /api/chores/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update chore" },
      { status: 500 }
    );
  }
}
