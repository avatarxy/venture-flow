-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'RUNNING', 'NEEDS_REVIEW', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "GenerationType" AS ENUM ('STRATEGY', 'BLUEPRINT', 'BUILD', 'REVIEW', 'OPTIMIZATION', 'IMPROVEMENT');

-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'LIVE', 'FAILED');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalProblem" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "strategy" JSONB,
    "blueprint" JSONB,
    "currentVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Generation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "GenerationType" NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "status" "GenerationStatus" NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedVersion" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "files" JSONB NOT NULL,
    "blueprintSnapshot" JSONB NOT NULL,
    "changeSummary" TEXT NOT NULL,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentState" (
    "projectId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPlan" JSONB NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "toolCalls" JSONB NOT NULL,
    "buildAttempts" INTEGER NOT NULL DEFAULT 0,
    "repairAttempts" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentState_pkey" PRIMARY KEY ("projectId")
);

-- CreateTable
CREATE TABLE "UsageEvent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "entityName" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_currentVersionId_key" ON "Project"("currentVersionId");

-- CreateIndex
CREATE INDEX "Generation_projectId_createdAt_idx" ON "Generation"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "GeneratedVersion_projectId_createdAt_idx" ON "GeneratedVersion"("projectId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedVersion_projectId_version_key" ON "GeneratedVersion"("projectId", "version");

-- CreateIndex
CREATE INDEX "UsageEvent_projectId_createdAt_idx" ON "UsageEvent"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "UsageEvent_versionId_createdAt_idx" ON "UsageEvent"("versionId", "createdAt");

-- CreateIndex
CREATE INDEX "UsageEvent_eventName_createdAt_idx" ON "UsageEvent"("eventName", "createdAt");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "GeneratedVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedVersion" ADD CONSTRAINT "GeneratedVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentState" ADD CONSTRAINT "AgentState_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageEvent" ADD CONSTRAINT "UsageEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageEvent" ADD CONSTRAINT "UsageEvent_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "GeneratedVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
