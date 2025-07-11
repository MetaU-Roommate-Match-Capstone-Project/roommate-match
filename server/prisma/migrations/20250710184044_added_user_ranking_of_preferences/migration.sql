-- CreateEnum
CREATE TYPE "PreferenceType" AS ENUM ('CLEANLINESS', 'SMOKES', 'PETS', 'GENDER_PREFERENCE', 'ROOM_TYPE', 'NUM_ROOMMATES', 'SLEEP_SCHEDULE', 'NOISE_TOLERANCE', 'SOCIALNESS', 'HOBBIES', 'FAVORITE_MUSIC');

-- AlterTable
ALTER TABLE "RoommateProfile" ADD COLUMN     "preference_1_weight" INTEGER,
ADD COLUMN     "preference_2_weight" INTEGER,
ADD COLUMN     "preference_3_weight" INTEGER,
ADD COLUMN     "top_preference_1" "PreferenceType",
ADD COLUMN     "top_preference_2" "PreferenceType",
ADD COLUMN     "top_preference_3" "PreferenceType";
