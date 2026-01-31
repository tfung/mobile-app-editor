export function Preview() {
  return (
    <div className="bg-white p-8 overflow-auto border-l border-gray-200">
      <h1 className="text-2xl font-bold mb-6">Preview</h1>

      {/* Mobile Phone Frame */}
      <div className="max-w-sm mx-auto bg-gray-100 rounded-3xl p-4 shadow-xl">
        <div className="bg-white rounded-2xl overflow-hidden shadow-inner">
          {/* Carousel Section */}
          <div className="bg-gray-200 h-64 flex items-center justify-center">
            <p className="text-gray-500">Carousel Preview</p>
          </div>

          {/* Text Section */}
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2" style={{ color: "#000000" }}>
              Sample Title
            </h2>
            <p className="text-sm" style={{ color: "#666666" }}>
              This is a sample description that will be displayed in the mobile app home screen.
            </p>
          </div>

          {/* CTA Button */}
          <div className="px-6 pb-6">
            <button
              className="w-full py-3 rounded-lg font-semibold"
              style={{ backgroundColor: "#007bff", color: "#ffffff" }}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
