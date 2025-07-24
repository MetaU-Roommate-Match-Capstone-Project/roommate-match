import React from "react";
import PictureSlideshow from "../PictureSlideshow/PictureSlideshow";
import { getBaseUrl } from "../../utils/url";

const PostPictureDisplay = ({ pictures }) => {
  if (!pictures || pictures.length === 0) {
    return null;
  }

  const imageUrls = pictures.map((pic) =>
    import.meta.env.DEV
      ? `/api/post/picture/${pic.id}`
      : `${getBaseUrl()}/api/post/picture/${pic.id}`,
  );

  return <PictureSlideshow images={imageUrls} />;
};

export default PostPictureDisplay;
