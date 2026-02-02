export type AspectRatio = 'portrait' | 'landscape' | 'square';

export interface CarouselImage {
  url: string;
  alt: string;
}

export interface CarouselConfig {
  images: CarouselImage[];
  aspectRatio: AspectRatio;
}

export interface TextSectionConfig {
  title: string;
  description: string;
  titleColor: string;
  descriptionColor: string;
}

export interface CTAConfig {
  label: string;
  url: string;
  backgroundColor: string;
  textColor: string;
}

export interface HomeScreenConfig {
  carousel: CarouselConfig;
  textSection: TextSectionConfig;
  cta: CTAConfig;
}

export interface ConfigResponse {
  id: number;
  schemaVersion: number;
  updatedAt: string;
  data: HomeScreenConfig;
}
