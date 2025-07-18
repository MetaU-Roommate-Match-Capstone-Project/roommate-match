-- AlterTable
ALTER TABLE "User" ALTER COLUMN "group_id" DROP NOT NULL,
ALTER COLUMN "group_id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
