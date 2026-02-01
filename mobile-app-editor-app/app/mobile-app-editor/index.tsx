import { Form } from "react-router";
import { EditorProvider, useEditor } from "./context/EditorContext";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import type { ConfigResponse } from "./types";

interface User {
  id: string;
  email: string;
}

interface MobileAppEditorProps {
  user?: User | null;
  initialConfig?: ConfigResponse | null;
  allConfigs?: ConfigResponse[];
}

function ConfigSelector({ allConfigs }: { allConfigs: ConfigResponse[] }) {
  const { setConfig } = useEditor();

  if (allConfigs.length === 0) return null;

  const handleConfigChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedConfig = allConfigs.find(c => c.id === e.target.value);
    if (selectedConfig) {
      setConfig(selectedConfig.data);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
      <label htmlFor="config-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Load Version:
      </label>
      <select
        id="config-select"
        onChange={handleConfigChange}
        defaultValue=""
        className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Current (Latest)</option>
        {allConfigs.map((config, index) => (
          <option key={config.id} value={config.id}>
            Version {allConfigs.length - index} - {new Date(config.updatedAt).toLocaleString()}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function MobileAppEditor({ user, initialConfig, allConfigs = [] }: MobileAppEditorProps) {
  return (
    <EditorProvider initialConfig={initialConfig?.data} configId={initialConfig?.id}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header with user info */}
        {user && (
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                  </div>
                </div>

                {/* Configuration Selector */}
                <ConfigSelector allConfigs={allConfigs} />
              </div>
              <Form method="post" action="/logout">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Sign Out
                </button>
              </Form>
            </div>
          </div>
        )}

        {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 p-4 sm:p-6 lg:p-8">
          {/* Editor Column */}
          <div className="order-2 lg:order-1 overflow-y-auto lg:pr-4">
            <Editor />
          </div>

          {/* Preview Column */}
          <div className="order-1 lg:order-2 flex justify-center items-start lg:sticky lg:top-8">
            <Preview />
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}
