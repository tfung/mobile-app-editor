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
    <div className="flex flex-col items-center sticky top-8">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Live Preview</h2>
        <p className="text-gray-500 mt-1">See your changes in real-time</p>
      </div>

      {/* Mobile Phone Frame */}
      <div className="w-[375px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3.5rem] shadow-2xl p-3 relative">
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-10"></div>

        {/* Screen */}
        <div className="bg-white rounded-[2.75rem] overflow-hidden relative">
          {/* Status Bar */}
          <div className="h-12 bg-white flex items-center justify-between px-6 pt-2">
            <span className="text-xs font-semibold">9:41</span>
            <div className="flex items-center gap-1">
              <span className="text-xs">📶</span>
              <span className="text-xs">📡</span>
              <span className="text-xs">🔋</span>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white p-5 space-y-5 pb-8">
            {/* Carousel */}
            <div className="relative">
              <div className={`${aspectRatioClasses[config.carousel.aspectRatio]} relative overflow-hidden rounded-2xl shadow-lg`}>
                <img
                  src={config.carousel.images[currentImageIndex]?.url}
                  alt={config.carousel.images[currentImageIndex]?.alt}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                {config.carousel.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/80 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                    >
                      <span className="text-xl font-bold">‹</span>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/80 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                    >
                      <span className="text-xl font-bold">›</span>
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
                      {config.carousel.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentImageIndex ? 'bg-white w-6' : 'bg-white/60 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Text Section */}
            <div className="space-y-3 px-1">
              <h3
                style={{ color: config.textSection.titleColor }}
                className="text-2xl font-bold leading-tight transition-colors duration-200"
              >
                {config.textSection.title}
              </h3>
              <p
                style={{ color: config.textSection.descriptionColor }}
                className="text-base leading-relaxed transition-colors duration-200"
              >
                {config.textSection.description}
              </p>
            </div>

            {/* CTA Button */}
            <div className="px-1">
              <button
                style={{
                  backgroundColor: config.cta.backgroundColor,
                  color: config.cta.textColor,
                }}
                className="w-full py-4 px-6 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 hover:-translate-y-0.5"
              >
                {config.cta.label}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
