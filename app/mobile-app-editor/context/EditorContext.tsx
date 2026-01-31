import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { HomeScreenConfig, CarouselConfig, TextSectionConfig, CTAConfig } from '../types';

interface EditorContextType {
  config: HomeScreenConfig;
  updateCarousel: (carousel: Partial<CarouselConfig>) => void;
  updateTextSection: (textSection: Partial<TextSectionConfig>) => void;
  updateCTA: (cta: Partial<CTAConfig>) => void;
  setConfig: (config: HomeScreenConfig) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

const defaultConfig: HomeScreenConfig = {
  carousel: {
    images: [
      { url: 'https://placehold.co/400x600/3b82f6/white?text=Image+1', alt: 'Placeholder 1' },
      { url: 'https://placehold.co/400x600/8b5cf6/white?text=Image+2', alt: 'Placeholder 2' },
      { url: 'https://placehold.co/400x600/ec4899/white?text=Image+3', alt: 'Placeholder 3' },
    ],
    aspectRatio: 'portrait',
  },
  textSection: {
    title: 'Welcome to Our App',
    description: 'Discover amazing features and experiences.',
    titleColor: '#000000',
    descriptionColor: '#666666',
  },
  cta: {
    label: 'Get Started',
    url: 'https://example.com',
    backgroundColor: '#007AFF',
    textColor: '#FFFFFF',
  },
};

interface EditorProviderProps {
  children: ReactNode;
  initialConfig?: HomeScreenConfig;
}

export function EditorProvider({ children, initialConfig }: EditorProviderProps) {
  const [config, setConfigState] = useState<HomeScreenConfig>(initialConfig || defaultConfig);

  const updateCarousel = useCallback((carousel: Partial<CarouselConfig>) => {
    setConfigState((prev) => ({
      ...prev,
      carousel: { ...prev.carousel, ...carousel },
    }));
  }, []);

  const updateTextSection = useCallback((textSection: Partial<TextSectionConfig>) => {
    setConfigState((prev) => ({
      ...prev,
      textSection: { ...prev.textSection, ...textSection },
    }));
  }, []);

  const updateCTA = useCallback((cta: Partial<CTAConfig>) => {
    setConfigState((prev) => ({
      ...prev,
      cta: { ...prev.cta, ...cta },
    }));
  }, []);

  const setConfig = useCallback((config: HomeScreenConfig) => {
    setConfigState(config);
  }, []);

  return (
    <EditorContext.Provider
      value={{
        config,
        updateCarousel,
        updateTextSection,
        updateCTA,
        setConfig,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
