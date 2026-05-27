import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Fetch all active doers
    const doers = await prisma.doer.findMany({
      orderBy: { name: "asc" },
      include: {
        assignments: {
          where: {
            assignedDate: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
      },
    });

    if (doers.length === 0) {
      return NextResponse.json(
        { error: "No doers available" },
        { status: 400 }
      );
    }

    // Fetch all chores
    const chores = await prisma.chore.findMany({
      include: { steps: true },
    });

    if (chores.length === 0) {
      return NextResponse.json(
        { error: "No chores available to distribute" },
        { status: 400 }
      );
    }

    // Calculate total difficulty and target quota per doer
    const totalDifficulty = chores.reduce(
      (sum, chore) => sum + chore.difficulty_rating,
      0
    );
    const targetQuota = totalDifficulty / doers.length;

    // Sort chores by difficulty descending for balanced distribution
    const sortedChores = [...chores].sort(
      (a, b) => b.difficulty_rating - a.difficulty_rating
    );

    // Track each doer's current load
    const doerLoads: Record<number, number> = {};
    const assignments: { doerId: number; choreId: number; flag?: string }[] = [];

    for (const doer of doers) {
      doerLoads[doer.id] = 0;
    }

    // Greedy assignment: pair high and low difficulty using round-robin with load balancing
    // Use a "snake" approach: assign highest to lowest-loaded, then lowest to highest-loaded
    let left = 0;
    let right = sortedChores.length - 1;
    let doerIndex = 0;
    const sortedDoers = [...doers].sort(
      (a, b) => doerLoads[a.id] - doerLoads[b.id]
    );

    while (left <= right) {
      // Sort doers by current load (ascending) so least-loaded doer gets next hardest chore
      const activeDoers = [...doers].sort(
        (a, b) => doerLoads[a.id] - doerLoads[b.id]
      );
      const doer = activeDoers[0];

      // Check for refusal flags
      const hasRefusals = doer.refusals > 0;
      const flag = hasRefusals
        ? `${doer.name} has ${doer.refusals} recent refusal(s) — parental review recommended`
        : undefined;

      // Assign hardest remaining chore to least-loaded doer
      if (left <= right) {
        assignments.push({
          doerId: doer.id,
          choreId: sortedChores[left].id,
          flag,
        });
        doerLoads[doer.id] += sortedChores[left].difficulty_rating;
        left++;
      }

      // Assign easiest remaining chore to most-loaded doer (balancing)
      if (left <= right) {
        const heaviestDoer = [...doers].sort(
          (a, b) => doerLoads[b.id] - doerLoads[a.id]
        )[0];
        const balanceFlag =
          heaviestDoer.refusals > 0
            ? `${heaviestDoer.name} has ${heaviestDoer.refusals} recent refusal(s) — parental review recommended`
            : undefined;
        assignments.push({
          doerId: heaviestDoer.id,
          choreId: sortedChores[right].id,
          flag: balanceFlag,
        });
        doerLoads[heaviestDoer.id] += sortedChores[right].difficulty_rating;
        right--;
      }
    }

    // Create assignment records in DB
    const now = new Date();
    const created = await Promise.all(
      assignments.map((a) =>
        prisma.assignment.create({
          data: {
            doerId: a.doerId,
            choreId: a.choreId,
            assignedDate: now,
            status: "Pending",
          },
          include: {
            doer: true,
            chore: true,
          },
        })
      )
    );

    // Build summary
    const summary = {
      totalChores: chores.length,
      totalDifficulty,
      targetQuotaPerDoer: Math.round(targetQuota * 100) / 100,
      assignments: created.map((a) => ({
        id: a.id,
        doer: a.doer.name,
        chore: a.chore.name,
        difficulty: a.chore.difficulty_rating,
        flag: assignments.find(
          (as) => as.doerId === a.doerId && as.choreId === a.choreId
        )?.flag,
      })),
      doerLoads: doers.map((d) => ({
        name: d.name,
        assignedDifficulty: doerLoads[d.id],
        variance:
          Math.round((doerLoads[d.id] - targetQuota) * 100) / 100,
        refusals: d.refusals,
      })),
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("POST /api/distribute-chores error:", error);
    return NextResponse.json(
      { error: "Failed to distribute chores" },
      { status: 500 }
    );
  }
}
