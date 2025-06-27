-- CreateEnum
CREATE TYPE "Cleanliness" AS ENUM ('VERY_DIRTY', 'DIRTY', 'MEDIUM', 'CLEAN', 'VERY_CLEAN');

-- CreateEnum
CREATE TYPE "Pets" AS ENUM ('NO_PETS', 'CATS_ONLY', 'DOGS_ONLY', 'CATS_AND_DOGS', 'OKAY_WITH_ANY_PET');

-- CreateEnum
CREATE TYPE "GenderPreference" AS ENUM ('NO_PREFERENCE', 'MALE', 'FEMALE', 'NONBINARY');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('PRIVATE_ROOM_IN_APARTMENT', 'SHARED_ROOM', 'PRIVATE_ROOM_IN_HOUSE');

-- CreateEnum
CREATE TYPE "SleepSchedule" AS ENUM ('EARLY_RISER', 'LATE_SLEEPER', 'NO_PREFERENCE');

-- CreateEnum
CREATE TYPE "NoiseTolerance" AS ENUM ('QUIET', 'SOMEWHAT_QUIET', 'SOMEWHAT_NOISY', 'NOISY');

-- CreateEnum
CREATE TYPE "Socialness" AS ENUM ('LONER', 'SOMEWHAT_SOCIAL', 'SOCIAL', 'VERY_SOCIAL');

-- CreateTable
CREATE TABLE "RoommateProfile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "cleanliness" "Cleanliness" NOT NULL,
    "smokes" BOOLEAN NOT NULL,
    "pets" "Pets" NOT NULL,
    "gender_preference" "GenderPreference" NOT NULL,
    "room_type" "RoomType" NOT NULL,
    "num_roommates" INTEGER NOT NULL,
    "lease_duration" INTEGER NOT NULL,
    "move_in_date" TIMESTAMP(3) NOT NULL,
    "sleep_schedule" "SleepSchedule" NOT NULL,
    "noise_tolerance" "NoiseTolerance" NOT NULL,
    "socialness" "Socialness" NOT NULL,
    "hobbies" TEXT NOT NULL,
    "favorite_music" TEXT NOT NULL,
    "bio" TEXT NOT NULL,

    CONSTRAINT "RoommateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoommateProfile_user_id_key" ON "RoommateProfile"("user_id");

-- AddForeignKey
ALTER TABLE "RoommateProfile" ADD CONSTRAINT "RoommateProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
