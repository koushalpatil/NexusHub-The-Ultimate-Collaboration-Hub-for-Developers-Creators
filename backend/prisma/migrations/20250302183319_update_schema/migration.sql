/*
  Warnings:

  - Added the required column `serverId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "serverId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Conversation_serverId_idx" ON "Conversation"("serverId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;
