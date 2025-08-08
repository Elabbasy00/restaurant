import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils"; // Assuming you have a cn utility for class merging

interface ProductGalleryProps {
  images: string[];
  className?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  console.log("reload");
  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className={cn("relative group", className)}>
      {/* Main image container */}
      <div className="h-[400px] md:h-[500px] overflow-hidden rounded-lg relative">
        {/* Loading indicator - only show if image is not loaded */}
        {/* {!isLoaded[currentIndex] && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )} */}

        {/* Main image */}
        <img
          key={`main-${images[currentIndex]}`}
          src={images[currentIndex]}
          alt={`Product image ${currentIndex + 1}`}
          className={cn(
            "w-full h-full object-contain transition-opacity duration-500"
            // isLoaded[currentIndex] ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      {/* Navigation arrows - only show if more than one image */}
      {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full opacity-70 hover:opacity-100 shadow-md"
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full opacity-70 hover:opacity-100 shadow-md"
            onClick={goToNext}
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {images.map((_, slideIndex) => (
            <button
              key={`dot-${slideIndex}`}
              onClick={() => goToSlide(slideIndex)}
              className={`w-3 h-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                currentIndex === slideIndex
                  ? "bg-primary"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to image ${slideIndex + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="mt-4 grid grid-flow-col auto-cols-max gap-2 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {images.map((image, index) => (
            <button
              key={`thumb-${index}`}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-16 h-16 flex-shrink-0 rounded-md overflow-hidden transition-all duration-200 focus:outline-none",
                currentIndex === index
                  ? "ring-2 ring-primary"
                  : "ring-1 ring-gray-200 hover:ring-gray-300"
              )}
              aria-label={`View image ${index + 1}`}
              aria-current={currentIndex === index ? "true" : "false"}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductGallery);
