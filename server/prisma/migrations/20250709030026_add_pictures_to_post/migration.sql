-- CreateTable
CREATE TABLE "Picture" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "image" BYTEA NOT NULL,

    CONSTRAINT "Picture_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Picture" ADD CONSTRAINT "Picture_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
