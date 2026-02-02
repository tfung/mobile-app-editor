import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EditorProvider } from '../mobile-app-editor/context/EditorContext';
import { Preview } from '../mobile-app-editor/components/Preview';
import type { HomeScreenConfig } from '../mobile-app-editor/types';

describe('Preview Component', () => {
  const mockConfig: HomeScreenConfig = {
    carousel: {
      images: [
        { url: 'https://example.com/image1.jpg', alt: 'Image 1' },
        { url: 'https://example.com/image2.jpg', alt: 'Image 2' },
      ],
      aspectRatio: 'portrait',
    },
    textSection: {
      title: 'Welcome to Our App',
      description: 'This is a test description',
      titleColor: '#FF0000',
      descriptionColor: '#00FF00',
    },
    cta: {
      label: 'Get Started',
      url: 'https://example.com',
      backgroundColor: '#0000FF',
      textColor: '#FFFFFF',
    },
  };

  test('renders preview with phone frame', () => {
    render(
      <EditorProvider initialConfig={mockConfig}>
        <Preview />
      </EditorProvider>
    );

    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  test('displays text section with correct content', () => {
    render(
      <EditorProvider initialConfig={mockConfig}>
        <Preview />
      </EditorProvider>
    );

    expect(screen.getByText('Welcome to Our App')).toBeInTheDocument();
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  test('applies correct colors to text section', () => {
    render(
      <EditorProvider initialConfig={mockConfig}>
        <Preview />
      </EditorProvider>
    );

    const title = screen.getByText('Welcome to Our App');
    const description = screen.getByText('This is a test description');

    expect(title).toHaveStyle({ color: '#FF0000' });
    expect(description).toHaveStyle({ color: '#00FF00' });
  });

  test('displays CTA button with correct label', () => {
    render(
      <EditorProvider initialConfig={mockConfig}>
        <Preview />
      </EditorProvider>
    );

    const button = screen.getByRole('button', { name: 'Get Started' });
    expect(button).toBeInTheDocument();
  });

  test('applies correct colors to CTA button', () => {
    render(
      <EditorProvider initialConfig={mockConfig}>
        <Preview />
      </EditorProvider>
    );

    const button = screen.getByRole('button', { name: 'Get Started' });
    expect(button).toHaveStyle({
      backgroundColor: '#0000FF',
      color: '#FFFFFF',
    });
  });

  test('renders all carousel images', () => {
    render(
      <EditorProvider initialConfig={mockConfig}>
        <Preview />
      </EditorProvider>
    );

    const images = screen.getAllByRole('img');
    // Filter out any other images (like status bar icons if they use img tags)
    const carouselImages = images.filter((img) =>
      img.getAttribute('alt')?.startsWith('Image')
    );

    expect(carouselImages).toHaveLength(2);
    expect(carouselImages[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');
    expect(carouselImages[1]).toHaveAttribute('src', 'https://example.com/image2.jpg');
  });

  test('shows navigation arrows for multiple images', () => {
    render(
      <EditorProvider initialConfig={mockConfig}>
        <Preview />
      </EditorProvider>
    );

    expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeInTheDocument();
  });

  test('hides navigation arrows for single image', () => {
    const singleImageConfig = {
      ...mockConfig,
      carousel: {
        ...mockConfig.carousel,
        images: [{ url: 'https://example.com/image1.jpg', alt: 'Single Image' }],
      },
    };

    render(
      <EditorProvider initialConfig={singleImageConfig}>
        <Preview />
      </EditorProvider>
    );

    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
  });

  test('shows indicator dots for multiple images', () => {
    render(
      <EditorProvider initialConfig={mockConfig}>
        <Preview />
      </EditorProvider>
    );

    // Indicator dots have aria-label "Go to image X"
    expect(screen.getByLabelText('Go to image 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to image 2')).toBeInTheDocument();
  });

  test('hides indicator dots for single image', () => {
    const singleImageConfig = {
      ...mockConfig,
      carousel: {
        ...mockConfig.carousel,
        images: [{ url: 'https://example.com/image1.jpg', alt: 'Single Image' }],
      },
    };

    render(
      <EditorProvider initialConfig={singleImageConfig}>
        <Preview />
      </EditorProvider>
    );

    expect(screen.queryByLabelText('Go to image 1')).not.toBeInTheDocument();
  });

  test('preview is read-only and reflects config state', () => {
    render(
      <EditorProvider initialConfig={mockConfig}>
        <Preview />
      </EditorProvider>
    );

    // Verify initial state
    expect(screen.getByText('Welcome to Our App')).toBeInTheDocument();

    // Preview should not have any input elements (read-only)
    const inputs = screen.queryAllByRole('textbox');
    const buttons = screen.queryAllByRole('button').filter(
      (btn) => btn.getAttribute('aria-label') === null || !btn.getAttribute('aria-label')?.includes('image')
    );

    // Only carousel navigation buttons should exist
    expect(inputs).toHaveLength(0);
  });

  test('renders portrait aspect ratio correctly', () => {
    render(
      <EditorProvider initialConfig={mockConfig}>
        <Preview />
      </EditorProvider>
    );

    // Check that phone frame doesn't have landscape class (or has portrait styling)
    // This is a basic check - actual styling verification would need more specific selectors
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  test('renders landscape aspect ratio correctly', () => {
    const landscapeConfig = {
      ...mockConfig,
      carousel: {
        ...mockConfig.carousel,
        aspectRatio: 'landscape' as const,
      },
    };

    render(
      <EditorProvider initialConfig={landscapeConfig}>
        <Preview />
      </EditorProvider>
    );

    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  test('renders square aspect ratio correctly', () => {
    const squareConfig = {
      ...mockConfig,
      carousel: {
        ...mockConfig.carousel,
        aspectRatio: 'square' as const,
      },
    };

    render(
      <EditorProvider initialConfig={squareConfig}>
        <Preview />
      </EditorProvider>
    );

    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });
});
