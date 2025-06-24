-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "intern_or_new_grad" TEXT NOT NULL,
    "budget_min" INTEGER NOT NULL,
    "budget_max" INTEGER NOT NULL,
    "university" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "group_id" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
