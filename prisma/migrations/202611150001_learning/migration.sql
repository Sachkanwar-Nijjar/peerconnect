-- CreateTable
CREATE TABLE "Course" (
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "credits" DOUBLE PRECISION NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "scheme" TEXT NOT NULL,
    "checkedAt" TEXT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ProfileCourse" (
    "userId" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProfileCourse_pkey" PRIMARY KEY ("userId","courseCode")
);

-- CreateTable
CREATE TABLE "HelpOffer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "HelpOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuidanceRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "courseCode" TEXT,
    "skill" TEXT,
    "question" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "activeKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuidanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuidanceMessage" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuidanceMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuidanceReview" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuidanceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseExperience" (
    "userId" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "workload" INTEGER NOT NULL,
    "advice" TEXT NOT NULL,
    "cohort" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseExperience_pkey" PRIMARY KEY ("userId","courseCode")
);

-- CreateIndex
CREATE INDEX "HelpOffer_skill_available_idx" ON "HelpOffer"("skill", "available");

-- CreateIndex
CREATE UNIQUE INDEX "HelpOffer_userId_skill_key" ON "HelpOffer"("userId", "skill");

-- CreateIndex
CREATE UNIQUE INDEX "GuidanceRequest_activeKey_key" ON "GuidanceRequest"("activeKey");

-- CreateIndex
CREATE INDEX "GuidanceRequest_senderId_status_createdAt_idx" ON "GuidanceRequest"("senderId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "GuidanceRequest_recipientId_status_createdAt_idx" ON "GuidanceRequest"("recipientId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "GuidanceMessage_requestId_createdAt_idx" ON "GuidanceMessage"("requestId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GuidanceReview_requestId_authorId_key" ON "GuidanceReview"("requestId", "authorId");

-- AddForeignKey
ALTER TABLE "ProfileCourse" ADD CONSTRAINT "ProfileCourse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileCourse" ADD CONSTRAINT "ProfileCourse_courseCode_fkey" FOREIGN KEY ("courseCode") REFERENCES "Course"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpOffer" ADD CONSTRAINT "HelpOffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceRequest" ADD CONSTRAINT "GuidanceRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceRequest" ADD CONSTRAINT "GuidanceRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceRequest" ADD CONSTRAINT "GuidanceRequest_courseCode_fkey" FOREIGN KEY ("courseCode") REFERENCES "Course"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceMessage" ADD CONSTRAINT "GuidanceMessage_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "GuidanceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceMessage" ADD CONSTRAINT "GuidanceMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceReview" ADD CONSTRAINT "GuidanceReview_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "GuidanceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceReview" ADD CONSTRAINT "GuidanceReview_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseExperience" ADD CONSTRAINT "CourseExperience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseExperience" ADD CONSTRAINT "CourseExperience_courseCode_fkey" FOREIGN KEY ("courseCode") REFERENCES "Course"("code") ON DELETE CASCADE ON UPDATE CASCADE;
