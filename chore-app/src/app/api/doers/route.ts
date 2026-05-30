import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const doers = await prisma.doer.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
    });
    return NextResponse.json(doers);
  } catch (error) {
    console.error("GET /api/doers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch doers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    const doer = await prisma.doer.create({
      data: { name: name.trim() },
    });
    return NextResponse.json(doer, { status: 201 });
  } catch (error) {
    console.error("POST /api/doers error:", error);
    return NextResponse.json(
      { error: "Failed to create doer" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, role } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const updateData: Record<string, unknown> = {};
    if (role !== undefined) updateData.role = role;
    const doer = await prisma.doer.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
    return NextResponse.json(doer);
  } catch (error) {
    console.error("PUT /api/doers error:", error);
    return NextResponse.json(
      { error: "Failed to update doer" },
      { status: 500 }
    );
  }
}
