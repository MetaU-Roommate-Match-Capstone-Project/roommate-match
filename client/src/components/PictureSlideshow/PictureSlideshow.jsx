import React, { useState } from "react";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { RxDotFilled } from "react-icons/rx";

const PictureSlideshow = ({ images = [] }) => {
  if (!images || images.length === 0) {
    return null;
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const prevSlide = () => {
    const isFirstSlide = currentImageIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentImageIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentImageIndex + 1;
    setCurrentImageIndex(newIndex);
  };

  const goToSlide = (slideIndex) => {
    setCurrentImageIndex(slideIndex);
  };

  return (
    <div className="post-slideshow-container">
      <div
        style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
        className="post-slideshow-image"
      ></div>
      <div className="post-slideshow-arrow-left">
        <BsChevronCompactLeft onClick={prevSlide} size={30} />
      </div>
      <div className="post-slideshow-arrow-right">
        <BsChevronCompactRight onClick={nextSlide} size={30} />
      </div>
      <div className="post-slideshow-image-index">
        {images.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className={`post-slideshow-dot-cursor ${slideIndex === currentImageIndex ? "text-blue-500" : "text-gray-400"}`}
          >
            <RxDotFilled />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PictureSlideshow;
