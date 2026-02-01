import { useFetcher } from 'react-router';
import { useEditor } from '../context/EditorContext';

export function Editor() {
  const { config, updateTextSection, updateCTA, updateCarousel } = useEditor();
  const fetcher = useFetcher();

  const inputClasses = "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";
  const sectionClasses = "bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200";

  const handleSave = () => {
    const formData = new FormData();
    formData.append('config', JSON.stringify(config));
    fetcher.submit(formData, { method: 'post' });
  };

  const isSaving = fetcher.state === 'submitting';
  const saveResult = fetcher.data as { success?: boolean; message?: string; error?: string } | undefined;

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Configuration Editor</h2>
          <p className="text-gray-500 mt-1">Customize your mobile app home screen</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
          {saveResult && (
            <div className={`text-sm ${saveResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {saveResult.success ? saveResult.message : saveResult.error}
            </div>
          )}
        </div>
      </div>

      {/* Carousel Section */}
      <section className={sectionClasses}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🎠</span>
          Image Carousel
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelClasses}>Aspect Ratio</label>
            <select
              value={config.carousel.aspectRatio}
              onChange={(e) =>
                updateCarousel({ aspectRatio: e.target.value as 'portrait' | 'landscape' | 'square' })
              }
              className={inputClasses}
            >
              <option value="portrait">Portrait (9:16)</option>
              <option value="landscape">Landscape (16:9)</option>
              <option value="square">Square (1:1)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Text Section */}
      <section className={sectionClasses}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Text Section
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelClasses}>Title</label>
            <input
              type="text"
              value={config.textSection.title}
              onChange={(e) => updateTextSection({ title: e.target.value })}
              className={inputClasses}
              placeholder="Enter your title"
            />
          </div>
          <div>
            <label className={labelClasses}>Description</label>
            <textarea
              value={config.textSection.description}
              onChange={(e) => updateTextSection({ description: e.target.value })}
              className={inputClasses}
              rows={3}
              placeholder="Enter your description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Title Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.textSection.titleColor}
                  onChange={(e) => updateTextSection({ titleColor: e.target.value })}
                  className="h-11 w-16 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={config.textSection.titleColor}
                  onChange={(e) => updateTextSection({ titleColor: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Description Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.textSection.descriptionColor}
                  onChange={(e) => updateTextSection({ descriptionColor: e.target.value })}
                  className="h-11 w-16 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={config.textSection.descriptionColor}
                  onChange={(e) => updateTextSection({ descriptionColor: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="#666666"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={sectionClasses}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔘</span>
          Call-to-Action Button
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelClasses}>Button Label</label>
            <input
              type="text"
              value={config.cta.label}
              onChange={(e) => updateCTA({ label: e.target.value })}
              className={inputClasses}
              placeholder="Get Started"
            />
          </div>
          <div>
            <label className={labelClasses}>Button URL</label>
            <input
              type="url"
              value={config.cta.url}
              onChange={(e) => updateCTA({ url: e.target.value })}
              className={inputClasses}
              placeholder="https://example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Background Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.cta.backgroundColor}
                  onChange={(e) => updateCTA({ backgroundColor: e.target.value })}
                  className="h-11 w-16 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={config.cta.backgroundColor}
                  onChange={(e) => updateCTA({ backgroundColor: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="#007AFF"
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Text Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.cta.textColor}
                  onChange={(e) => updateCTA({ textColor: e.target.value })}
                  className="h-11 w-16 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={config.cta.textColor}
                  onChange={(e) => updateCTA({ textColor: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
