/*
  Warnings:

  - You are about to alter the column `accuracy` on the `Diagnosis` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Diagnosis` MODIFY `accuracy` DOUBLE NOT NULL;
