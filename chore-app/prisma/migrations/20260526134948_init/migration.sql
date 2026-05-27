-- CreateTable
CREATE TABLE "Doer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "completions" INTEGER NOT NULL DEFAULT 0,
    "refusals" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Chore" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "difficulty_rating" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "Step" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "choreId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    CONSTRAINT "Step_choreId_fkey" FOREIGN KEY ("choreId") REFERENCES "Chore" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "doerId" INTEGER NOT NULL,
    "choreId" INTEGER NOT NULL,
    "assignedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    CONSTRAINT "Assignment_doerId_fkey" FOREIGN KEY ("doerId") REFERENCES "Doer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assignment_choreId_fkey" FOREIGN KEY ("choreId") REFERENCES "Chore" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Step_choreId_idx" ON "Step"("choreId");

-- CreateIndex
CREATE INDEX "Assignment_doerId_idx" ON "Assignment"("doerId");

-- CreateIndex
CREATE INDEX "Assignment_choreId_idx" ON "Assignment"("choreId");
