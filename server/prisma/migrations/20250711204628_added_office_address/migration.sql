/*
  Warnings:

  - Added the required column `office_address` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "office_address" TEXT NOT NULL;
