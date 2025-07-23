/*
  Warnings:

  - You are about to drop the column `image` on the `Picture` table. All the data in the column will be lost.
  - You are about to drop the column `profile_picture` on the `User` table. All the data in the column will be lost.
  - Added the required column `image_path` to the `Picture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Picture" DROP COLUMN "image",
ADD COLUMN     "image_path" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profile_picture",
ADD COLUMN     "profile_picture_path" TEXT;
