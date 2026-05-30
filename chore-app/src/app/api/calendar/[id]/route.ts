import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/calendar/[id] — update assignment status (complete, approve, reject, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes, approvedBy } = body;

    const assignmentId = parseInt(id);
    if (isNaN(assignmentId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
      if (status === "completed") {
        updateData.completedAt = new Date();
      } else if (status === "approved") {
        updateData.approvedAt = new Date();
        if (approvedBy) updateData.approvedBy = parseInt(approvedBy);
        // Increment doer's completion count
        const assignment = await prisma.assignment.findUnique({
          where: { id: assignmentId },
        });
        if (assignment) {
          await prisma.doer.update({
            where: { id: assignment.doerId },
            data: { completions: { increment: 1 } },
          });
        }
      } else if (status === "rejected") {
        // Reset to pending so redo is needed
        updateData.completedAt = null;
      } else if (status === "refused") {
        const assignment = await prisma.assignment.findUnique({
          where: { id: assignmentId },
        });
        if (assignment) {
          await prisma.doer.update({
            where: { id: assignment.doerId },
            data: { refusals: { increment: 1 } },
          });
        }
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: updateData,
      include: {
        doer: true,
        chore: {
          include: { steps: { orderBy: { sequence_order: "asc" } } },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/calendar/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.assignment.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/calendar/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
