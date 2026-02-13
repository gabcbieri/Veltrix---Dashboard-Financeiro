-- CreateTable
CREATE TABLE "LoginToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoginToken_userId_createdAt_idx" ON "LoginToken"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LoginToken_expiresAt_idx" ON "LoginToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "LoginToken" ADD CONSTRAINT "LoginToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
