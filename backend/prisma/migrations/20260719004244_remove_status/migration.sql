/*
  Warnings:

  - You are about to drop the column `status` on the `Store` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Rating_storeId_key";

-- DropIndex
DROP INDEX "Rating_userId_key";

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "status";

-- DropEnum
DROP TYPE "Status";

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
