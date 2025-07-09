import React from "react";
import PictureSlideshow from "../PictureSlideshow/PictureSlideshow";

const PostPictureDisplay = ({ pictures }) => {
  if (!pictures || pictures.length === 0) {
    return null;
  }

  const imageUrls = pictures.map((pic) => `/api/post/picture/${pic.id}`);

  return <PictureSlideshow images={imageUrls} />;
};

export default PostPictureDisplay;
