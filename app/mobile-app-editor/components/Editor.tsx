import { useEditor } from '../context/EditorContext';

export function Editor() {
  const { config, updateTextSection, updateCTA, updateCarousel } = useEditor();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Editor</h2>

      {/* Carousel Section */}
      <section className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Image Carousel</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Aspect Ratio</label>
            <select
              value={config.carousel.aspectRatio}
              onChange={(e) =>
                updateCarousel({ aspectRatio: e.target.value as 'portrait' | 'landscape' | 'square' })
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
              <option value="square">Square</option>
            </select>
          </div>
        </div>
      </section>

      {/* Text Section */}
      <section className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Text Section</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={config.textSection.title}
              onChange={(e) => updateTextSection({ title: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={config.textSection.description}
              onChange={(e) => updateTextSection({ description: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title Color</label>
            <input
              type="color"
              value={config.textSection.titleColor}
              onChange={(e) => updateTextSection({ titleColor: e.target.value })}
              className="w-full h-10 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description Color</label>
            <input
              type="color"
              value={config.textSection.descriptionColor}
              onChange={(e) => updateTextSection({ descriptionColor: e.target.value })}
              className="w-full h-10 border rounded"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Call-to-Action Button</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Button Label</label>
            <input
              type="text"
              value={config.cta.label}
              onChange={(e) => updateCTA({ label: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Button URL</label>
            <input
              type="url"
              value={config.cta.url}
              onChange={(e) => updateCTA({ url: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Background Color</label>
            <input
              type="color"
              value={config.cta.backgroundColor}
              onChange={(e) => updateCTA({ backgroundColor: e.target.value })}
              className="w-full h-10 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Text Color</label>
            <input
              type="color"
              value={config.cta.textColor}
              onChange={(e) => updateCTA({ textColor: e.target.value })}
              className="w-full h-10 border rounded"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
