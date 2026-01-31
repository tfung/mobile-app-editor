import { useState } from 'react';
import { useEditor } from '../context/EditorContext';

export function Preview() {
  const { config } = useEditor();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const aspectRatioClasses = {
    portrait: 'aspect-[9/16]',
    landscape: 'aspect-[16/9]',
    square: 'aspect-square',
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % config.carousel.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + config.carousel.images.length) % config.carousel.images.length
    );
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Preview</h2>

      {/* Mobile Phone Frame */}
      <div className="w-[375px] border-8 border-gray-800 rounded-[3rem] shadow-2xl bg-white overflow-hidden">
        <div className="bg-white p-4 space-y-4">
          {/* Carousel */}
          <div className="relative">
            <div className={`${aspectRatioClasses[config.carousel.aspectRatio]} relative overflow-hidden rounded-lg`}>
              <img
                src={config.carousel.images[currentImageIndex]?.url}
                alt={config.carousel.images[currentImageIndex]?.alt}
                className="w-full h-full object-cover"
              />
              {config.carousel.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {config.carousel.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Text Section */}
          <div className="space-y-2 px-2">
            <h3
              style={{ color: config.textSection.titleColor }}
              className="text-xl font-bold"
            >
              {config.textSection.title}
            </h3>
            <p
              style={{ color: config.textSection.descriptionColor }}
              className="text-sm"
            >
              {config.textSection.description}
            </p>
          </div>

          {/* CTA Button */}
          <div className="px-2">
            <button
              style={{
                backgroundColor: config.cta.backgroundColor,
                color: config.cta.textColor,
              }}
              className="w-full py-3 px-4 rounded-lg font-semibold"
            >
              {config.cta.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
