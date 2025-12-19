import { useState, useEffect } from 'react';
import { EventHistoryViewer } from './EventHistoryViewer';
import { PerformanceMonitor } from './PerformanceMonitor';
import { ConfigurationPanel } from './ConfigurationPanel';

type Tab = 'history' | 'metrics' | 'config';

export function EventBusDevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 800, height: 600 });

  // Keyboard shortcut: Ctrl+Shift+E or Cmd+Shift+E
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors z-50"
        aria-label="Open Event Bus DevTools"
      >
        <span role="img" aria-label="Tools">
          🔧
        </span>{' '}
        DevTools
      </button>
    );
  }

  return (
    <div
      className="fixed bg-white border-2 border-gray-300 rounded-lg shadow-2xl flex flex-col z-50"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-300 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-lg" role="img" aria-label="Tools">
            🔧
          </span>
          <h2 className="font-bold">Event Bus DevTools</h2>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
            Development
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-75">Ctrl+Shift+E</span>
          <button
            onClick={() => setIsOpen(false)}
            className="px-2 py-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close DevTools"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span role="img" aria-label="History" className="mr-1">
            📜
          </span>
          Event History
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'metrics'
              ? 'bg-white border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span role="img" aria-label="Metrics" className="mr-1">
            📊
          </span>
          Performance
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'config'
              ? 'bg-white border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span role="img" aria-label="Configuration" className="mr-1">
            ⚙️
          </span>
          Configuration
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'history' && <EventHistoryViewer />}
        {activeTab === 'metrics' && <PerformanceMonitor />}
        {activeTab === 'config' && <ConfigurationPanel />}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={(e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startY = e.clientY;
          const startWidth = size.width;
          const startHeight = size.height;

          const handleMouseMove = (e: MouseEvent) => {
            setSize({
              width: Math.max(400, startWidth + (e.clientX - startX)),
              height: Math.max(300, startHeight + (e.clientY - startY)),
            });
          };

          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      >
        <svg
          className="w-full h-full text-gray-400"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M16 16V0h-1v15H0v1z" />
          <path d="M12 12V8h-1v4H8v1h4z" />
        </svg>
      </div>
    </div>
  );
}
