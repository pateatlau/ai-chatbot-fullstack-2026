import { useState } from 'react';

interface EventBusConfig {
  maxHistorySize: number;
  enableLogging: boolean;
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
  enablePerformanceTracking: boolean;
  environment: 'development' | 'production';
}

export function ConfigurationPanel() {
  const [config, setConfig] = useState<EventBusConfig>({
    maxHistorySize: 100,
    enableLogging: true,
    logLevel: 'info',
    enablePerformanceTracking: true,
    environment:
      import.meta.env.MODE === 'production' ? 'production' : 'development',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: Save to localStorage or event bus config
    localStorage.setItem('eventBusConfig', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaultConfig: EventBusConfig = {
      maxHistorySize: 100,
      enableLogging: true,
      logLevel: 'info',
      enablePerformanceTracking: true,
      environment:
        import.meta.env.MODE === 'production' ? 'production' : 'development',
    };
    setConfig(defaultConfig);
    localStorage.removeItem('eventBusConfig');
  };

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="max-w-2xl space-y-6">
        {/* Environment */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-3">Environment</h3>
          <div className="flex gap-3">
            <label className="flex items-center">
              <input
                type="radio"
                checked={config.environment === 'development'}
                onChange={() =>
                  setConfig({ ...config, environment: 'development' })
                }
                className="mr-2"
              />
              <span className="text-sm">Development</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={config.environment === 'production'}
                onChange={() =>
                  setConfig({ ...config, environment: 'production' })
                }
                className="mr-2"
              />
              <span className="text-sm">Production</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Current: <strong>{import.meta.env.MODE}</strong>
          </p>
        </div>

        {/* Event History */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-3">Event History</h3>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Max History Size
            </label>
            <input
              type="number"
              value={config.maxHistorySize}
              onChange={(e) =>
                setConfig({
                  ...config,
                  maxHistorySize: parseInt(e.target.value) || 100,
                })
              }
              min="10"
              max="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum number of events to keep in history (10-1000)
            </p>
          </div>
        </div>

        {/* Logging */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-3">Logging</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.enableLogging}
                onChange={(e) =>
                  setConfig({ ...config, enableLogging: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm">Enable Console Logging</span>
            </label>

            {config.enableLogging && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Log Level
                </label>
                <select
                  value={config.logLevel}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logLevel: e.target.value as EventBusConfig['logLevel'],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Performance Tracking */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-3">Performance</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.enablePerformanceTracking}
              onChange={(e) =>
                setConfig({
                  ...config,
                  enablePerformanceTracking: e.target.checked,
                })
              }
              className="mr-2"
            />
            <span className="text-sm">Enable Performance Tracking</span>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Track event execution time and listener performance
          </p>
        </div>

        {/* Production Settings */}
        {config.environment === 'production' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2 text-yellow-900">
              <span role="img" aria-label="Warning" className="mr-1">
                ⚠️
              </span>
              Production Recommendations
            </h3>
            <ul className="text-xs text-yellow-800 space-y-1">
              <li>• Set maxHistorySize to 50 or less</li>
              <li>• Disable console logging (enableLogging: false)</li>
              <li>• Use log level 'error' or 'warn' only</li>
              <li>• Consider disabling DevTools in production builds</li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {saved ? '✓ Saved!' : 'Save Configuration'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>

        {/* Current Config */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">Current Configuration</h3>
          <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
