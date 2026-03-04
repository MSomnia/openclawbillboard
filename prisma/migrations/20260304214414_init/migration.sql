-- CreateTable
CREATE TABLE "Repository" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "githubId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "homepage" TEXT,
    "language" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "openIssues" INTEGER NOT NULL DEFAULT 0,
    "topics" TEXT NOT NULL DEFAULT '[]',
    "license" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "pushedAt" DATETIME,
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastFetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activityScore" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "DailySnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "repositoryId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "stars" INTEGER NOT NULL,
    "forks" INTEGER NOT NULL,
    "openIssues" INTEGER NOT NULL,
    "starsDelta" INTEGER NOT NULL DEFAULT 0,
    "forksDelta" INTEGER NOT NULL DEFAULT 0,
    "commitsCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "DailySnapshot_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommitRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "repositoryId" INTEGER NOT NULL,
    "sha" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorDate" DATETIME NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "CommitRecord_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FetchLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "reposFound" INTEGER NOT NULL DEFAULT 0,
    "reposUpdated" INTEGER NOT NULL DEFAULT 0,
    "newRepos" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'running'
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_githubId_key" ON "Repository"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_fullName_key" ON "Repository"("fullName");

-- CreateIndex
CREATE INDEX "Repository_stars_idx" ON "Repository"("stars");

-- CreateIndex
CREATE INDEX "Repository_activityScore_idx" ON "Repository"("activityScore");

-- CreateIndex
CREATE INDEX "Repository_language_idx" ON "Repository"("language");

-- CreateIndex
CREATE INDEX "DailySnapshot_date_idx" ON "DailySnapshot"("date");

-- CreateIndex
CREATE INDEX "DailySnapshot_starsDelta_idx" ON "DailySnapshot"("starsDelta");

-- CreateIndex
CREATE UNIQUE INDEX "DailySnapshot_repositoryId_date_key" ON "DailySnapshot"("repositoryId", "date");

-- CreateIndex
CREATE INDEX "CommitRecord_authorDate_idx" ON "CommitRecord"("authorDate");

-- CreateIndex
CREATE UNIQUE INDEX "CommitRecord_repositoryId_sha_key" ON "CommitRecord"("repositoryId", "sha");
