/*
  Warnings:

  - You are about to drop the column `preference_1_weight` on the `RoommateProfile` table. All the data in the column will be lost.
  - You are about to drop the column `preference_2_weight` on the `RoommateProfile` table. All the data in the column will be lost.
  - You are about to drop the column `preference_3_weight` on the `RoommateProfile` table. All the data in the column will be lost.
  - You are about to drop the column `top_preference_1` on the `RoommateProfile` table. All the data in the column will be lost.
  - You are about to drop the column `top_preference_2` on the `RoommateProfile` table. All the data in the column will be lost.
  - You are about to drop the column `top_preference_3` on the `RoommateProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RoommateProfile" DROP COLUMN "preference_1_weight",
DROP COLUMN "preference_2_weight",
DROP COLUMN "preference_3_weight",
DROP COLUMN "top_preference_1",
DROP COLUMN "top_preference_2",
DROP COLUMN "top_preference_3",
ADD COLUMN     "cleanliness_weight" DECIMAL(3,2),
ADD COLUMN     "favorite_music_weight" DECIMAL(3,2),
ADD COLUMN     "gender_preference_weight" DECIMAL(3,2),
ADD COLUMN     "hobbies_weight" DECIMAL(3,2),
ADD COLUMN     "noise_tolerance_weight" DECIMAL(3,2),
ADD COLUMN     "num_roommates_weight" DECIMAL(3,2),
ADD COLUMN     "pets_weight" DECIMAL(3,2),
ADD COLUMN     "room_type_weight" DECIMAL(3,2),
ADD COLUMN     "sleep_schedule_weight" DECIMAL(3,2),
ADD COLUMN     "smokes_weight" DECIMAL(3,2),
ADD COLUMN     "socialness_weight" DECIMAL(3,2);
