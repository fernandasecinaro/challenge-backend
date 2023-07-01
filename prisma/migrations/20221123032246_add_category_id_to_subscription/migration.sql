/*
  Warnings:

  - Added the required column `categoryId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Subscription` ADD COLUMN `categoryId` INTEGER NOT NULL;
