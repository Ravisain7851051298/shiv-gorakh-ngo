"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const AUTO_ADVANCE_INTERVAL = 3500;

export default function ImageCarousel({ images, title }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [imageRatios, setImageRatios] = useState([]);
  const imageCount = images.length;
  const aspectRatio = imageRatios[activeIndex] || 16 / 9;

  useEffect(() => {
    if (imageCount < 2 || paused) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % imageCount);
    }, AUTO_ADVANCE_INTERVAL);

    return () => window.clearInterval(timer);
  }, [imageCount, paused]);

  function showPrevious() {
    setActiveIndex((index) => (index - 1 + imageCount) % imageCount);
  }

  function showNext() {
    setActiveIndex((index) => (index + 1) % imageCount);
  }

  return (
    <div
      aria-label={`${title} images`}
      aria-roledescription="carousel"
      className="group relative w-full overflow-hidden rounded-t-xl bg-slate-100 transition-[aspect-ratio] duration-500 ease-in-out"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      style={{ aspectRatio }}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-in-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {images.map((image, imageIndex) => {
          const isVideo = /\.(mp4|webm|mov|ogv|mkv)$/i.test(image);
          return isVideo ? (
            <div
              key={`${image}-${imageIndex}`}
              className="relative h-full w-full shrink-0 bg-black flex items-center justify-center"
            >
              <video src={image} controls className="h-full w-full object-contain" />
            </div>
          ) : (
            <div
              aria-label={`Image ${imageIndex + 1} of ${imageCount} for ${title}`}
              aria-hidden={imageIndex !== activeIndex}
              className="relative h-full w-full shrink-0"
              key={`${image}-${imageIndex}`}
              role="img"
            >
              <Image
                alt={`${title}, image ${imageIndex + 1} of ${imageCount}`}
                className="object-contain"
                fill
                key={`${image}-image-${imageIndex}`}
                onLoad={(event) => {
                  const { naturalWidth, naturalHeight } = event.currentTarget;
                  if (naturalWidth && naturalHeight) {
                    const ratio = naturalWidth / naturalHeight;
                    setImageRatios((ratios) => {
                      const nextRatios = [...ratios];
                      nextRatios[imageIndex] = ratio;
                      return nextRatios;
                    });
                  }
                }}
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                src={image}
                unoptimized
              />
            </div>
          );
        })}
      </div>

      {imageCount > 1 && (
        <>
          <button
            aria-label="Previous image"
            className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-slate-700 opacity-0 shadow transition hover:bg-white group-hover:opacity-100 focus:opacity-100"
            onClick={showPrevious}
            type="button"
          >
            <FiChevronLeft />
          </button>
          <button
            aria-label="Next image"
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-slate-700 opacity-0 shadow transition hover:bg-white group-hover:opacity-100 focus:opacity-100"
            onClick={showNext}
            type="button"
          >
            <FiChevronRight />
          </button>
          <span className="absolute bottom-2 right-2 rounded-full bg-slate-950/60 px-2 py-1 text-[10px] font-medium text-white">
            {activeIndex + 1} / {imageCount}
          </span>
        </>
      )}
    </div>
  );
}
