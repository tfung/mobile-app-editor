import { useRef, useState, useEffect } from 'react';
import { useEditor } from '../context/EditorContext';

export function Preview() {
  const { config } = useEditor();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const aspectRatioClasses = {
    portrait: 'aspect-[9/16]',
    landscape: 'aspect-[16/9]',
    square: 'aspect-square',
  };

  // Track scroll position to update active indicator
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollLeft;
      const itemWidth = container.scrollWidth / config.carousel.images.length;
      const index = Math.round(scrollPosition / itemWidth);
      setCurrentImageIndex(index);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [config.carousel.images.length]);

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const scrollWidth = scrollContainerRef.current.scrollWidth;
      const itemWidth = scrollWidth / config.carousel.images.length;
      scrollContainerRef.current.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth',
      });
    }
  };

  const nextImage = () => {
    const nextIndex = (currentImageIndex + 1) % config.carousel.images.length;
    scrollToIndex(nextIndex);
  };

  const prevImage = () => {
    const prevIndex = (currentImageIndex - 1 + config.carousel.images.length) % config.carousel.images.length;
    scrollToIndex(prevIndex);
  };

  const isLandscape = config.carousel.aspectRatio === 'landscape';

  return (
    <div className="flex flex-col items-center sticky top-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Live Preview</h2>
        <p className="text-gray-500 mt-1 text-sm md:text-base">See your changes in real-time</p>
      </div>

      {/* Mobile Phone Frame */}
      <div className={`bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl p-2 md:p-3 relative transition-all duration-500 ${
        isLandscape ? 'w-full max-w-[667px]' : 'w-full max-w-[375px]'
      }`}>
        {/* Phone Notch - only show in portrait */}
        {!isLandscape && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 md:w-40 h-5 md:h-7 bg-gray-900 rounded-b-2xl md:rounded-b-3xl z-10"></div>
        )}

        {/* Screen */}
        <div className="bg-white rounded-[1.75rem] md:rounded-[2.75rem] overflow-hidden relative">
          {/* Status Bar */}
          <div className={`bg-white flex items-center justify-between px-4 md:px-6 transition-all duration-500 ${
            isLandscape ? 'h-8 md:h-10 pt-1' : 'h-10 md:h-12 pt-2'
          }`}>
            <span className="text-xs font-semibold">9:41</span>
            <div className="flex items-center gap-1">
              <span className="text-xs">📶</span>
              <span className="text-xs">📡</span>
              <span className="text-xs">🔋</span>
            </div>
          </div>

          {/* Content */}
          <div className={`bg-white transition-all duration-500 ${
            isLandscape ? 'p-4 md:p-6 space-y-3 md:space-y-4 pb-4 md:pb-6' : 'p-4 md:p-5 space-y-4 md:space-y-5 pb-6 md:pb-8'
          }`}>
            {/* Horizontally Scrolling Carousel with Navigation Arrows */}
            <div className="relative">
              <div
                ref={scrollContainerRef}
                className={`${aspectRatioClasses[config.carousel.aspectRatio]} relative overflow-x-auto overflow-y-hidden rounded-xl md:rounded-2xl shadow-lg snap-x snap-mandatory scrollbar-hide flex`}
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {config.carousel.images.map((image, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-full h-full snap-center snap-always"
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              {config.carousel.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black/80 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg z-10"
                    aria-label="Previous image"
                  >
                    <span className="text-lg md:text-xl font-bold">‹</span>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black/80 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg z-10"
                    aria-label="Next image"
                  >
                    <span className="text-lg md:text-xl font-bold">›</span>
                  </button>
                </>
              )}

              {/* Active Scroll Indicators / Dots */}
              {config.carousel.images.length > 1 && (
                <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 bg-black/30 backdrop-blur-sm px-2 md:px-3 py-1.5 md:py-2 rounded-full z-10">
                  {config.carousel.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToIndex(index)}
                      className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'bg-white w-4 md:w-6'
                          : 'bg-white/60 w-1.5 md:w-2 hover:bg-white/80'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Text Section */}
            <div className="space-y-2 md:space-y-3 px-1">
              <h3
                style={{ color: config.textSection.titleColor }}
                className="text-xl md:text-2xl font-bold leading-tight transition-colors duration-200"
              >
                {config.textSection.title}
              </h3>
              <p
                style={{ color: config.textSection.descriptionColor }}
                className="text-sm md:text-base leading-relaxed transition-colors duration-200"
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
                className="w-full py-3 md:py-4 px-4 md:px-6 rounded-lg md:rounded-xl font-semibold text-sm md:text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 hover:-translate-y-0.5"
              >
                {config.cta.label}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint for mobile */}
      {config.carousel.images.length > 1 && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          👆 Swipe or use arrows to navigate
        </p>
      )}
    </div>
  );
}
