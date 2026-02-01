import { Form } from "react-router";
import { EditorProvider, useEditor } from "./context/EditorContext";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import type { ConfigResponse } from "./types";

interface User {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
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
    <div className="flex items-center gap-3">
      <label htmlFor="config-select" className="text-sm font-medium text-gray-700">
        Load Version:
      </label>
      <select
        id="config-select"
        onChange={handleConfigChange}
        defaultValue=""
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>

                {/* Configuration Selector */}
                <ConfigSelector allConfigs={allConfigs} />
              </div>
              <Form method="post" action="/logout">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Sign Out
                </button>
              </Form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-12 p-8">
          <div className="overflow-y-auto pr-4">
            <Editor />
          </div>
          <div className="flex justify-center items-start">
            <Preview />
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}
