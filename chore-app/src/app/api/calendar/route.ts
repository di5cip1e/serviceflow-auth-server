import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/calendar?weekStart=ISO&doerId=optional
// Returns assignments for a given week, optionally filtered by doer
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStartParam = searchParams.get("weekStart");
    const doerIdParam = searchParams.get("doerId");

    const weekStart = weekStartParam
      ? new Date(weekStartParam)
      : getStartOfWeek(new Date());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const where: Record<string, unknown> = {
      dueDate: {
        gte: weekStart,
        lt: weekEnd,
      },
    };

    if (doerIdParam) {
      where.doerId = parseInt(doerIdParam);
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        doer: true,
        chore: {
          include: { steps: { orderBy: { sequence_order: "asc" } } },
        },
      },
      orderBy: [{ dueDate: "asc" }, { id: "asc" }],
    });

    // Also get all doers for the dropdown
    const doers = await prisma.doer.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      assignments,
      doers,
    });
  } catch (error) {
    console.error("GET /api/calendar error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar" },
      { status: 500 }
    );
  }
}

// POST /api/calendar — create a new scheduled assignment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { doerId, choreId, dueDate, notes } = body;

    if (!doerId || !choreId) {
      return NextResponse.json(
        { error: "doerId and choreId are required" },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        doerId: parseInt(doerId),
        choreId: parseInt(choreId),
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || "",
        status: "pending",
      },
      include: {
        doer: true,
        chore: {
          include: { steps: { orderBy: { sequence_order: "asc" } } },
        },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("POST /api/calendar error:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
