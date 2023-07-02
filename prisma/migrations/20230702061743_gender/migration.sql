/*
  Warnings:

  - The values [other] on the enum `User_gender` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `gender` ENUM('male', 'female') NOT NULL DEFAULT 'male';
