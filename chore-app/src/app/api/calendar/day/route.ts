import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/calendar/day?date=ISO&doerId=optional
// Returns assignments for a specific day
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const doerIdParam = searchParams.get("doerId");

    const date = dateParam ? new Date(dateParam) : new Date();
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const where: Record<string, unknown> = {
      dueDate: {
        gte: dayStart,
        lt: dayEnd,
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
      orderBy: { id: "asc" },
    });

    return NextResponse.json({
      date: dayStart.toISOString(),
      assignments,
    });
  } catch (error) {
    console.error("GET /api/calendar/day error:", error);
    return NextResponse.json(
      { error: "Failed to fetch day view" },
      { status: 500 }
    );
  }
}
