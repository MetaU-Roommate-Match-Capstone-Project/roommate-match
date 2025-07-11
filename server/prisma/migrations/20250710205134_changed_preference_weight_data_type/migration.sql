/*
  Warnings:

  - You are about to alter the column `preference_1_weight` on the `RoommateProfile` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(3,2)`.
  - You are about to alter the column `preference_2_weight` on the `RoommateProfile` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(3,2)`.
  - You are about to alter the column `preference_3_weight` on the `RoommateProfile` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(3,2)`.

*/
-- AlterTable
ALTER TABLE "RoommateProfile" ALTER COLUMN "preference_1_weight" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "preference_2_weight" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "preference_3_weight" SET DATA TYPE DECIMAL(3,2);
