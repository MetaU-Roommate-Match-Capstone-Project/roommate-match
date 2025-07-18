-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'FRIEND_REQUEST_SENT', 'ACCEPTED', 'REJECTED_BY_RECIPIENT', 'REJECTED_RECOMMENDATION');

-- CreateTable
CREATE TABLE "Matches" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "recommended_id" INTEGER NOT NULL,
    "similarity_score" DOUBLE PRECISION NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "friend_request_sent_by" INTEGER,
    "friend_request_sent_at" TIMESTAMP(3),
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Matches_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_recommended_id_fkey" FOREIGN KEY ("recommended_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_friend_request_sent_by_fkey" FOREIGN KEY ("friend_request_sent_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
