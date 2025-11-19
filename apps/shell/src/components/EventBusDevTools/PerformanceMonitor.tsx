import { useState, useEffect } from 'react';
import { getEventBus } from '@myapp/shared/event-bus';

interface PerformanceMetrics {
  totalEvents: number;
  eventsPerSecond: number;
  averageExecutionTime: number;
  listenerCount: number;
  memoryUsage: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalEvents: 0,
    eventsPerSecond: 0,
    averageExecutionTime: 0,
    listenerCount: 0,
    memoryUsage: 0,
  });

  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const eventBus = getEventBus();
    const history = eventBus.getEventHistory();

    // Calculate metrics
    const updateMetrics = () => {
      const now = Date.now();
      const oneSecondAgo = now - 1000;

      // Events in last second
      const recentEvents = history.filter(
        (e: any) => e.timestamp > oneSecondAgo
      );

      // Get stats from event bus
      const stats = eventBus.getStats();

      // Count events by type
      const counts: Record<string, number> = {};
      history.forEach((e: any) => {
        counts[e.name] = (counts[e.name] || 0) + 1;
      });

      setMetrics({
        totalEvents: stats.totalEvents,
        eventsPerSecond: recentEvents.length,
        averageExecutionTime: 0, // TODO: Add execution time tracking
        listenerCount: stats.totalListeners,
        memoryUsage: JSON.stringify(history).length / 1024, // KB
      });

      setEventCounts(counts);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="space-y-4">
        {/* Overall Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">
              Total Events
            </div>
            <div className="text-3xl font-bold text-blue-900">
              {metrics.totalEvents}
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-600 font-medium">
              Events/Second
            </div>
            <div className="text-3xl font-bold text-green-900">
              {metrics.eventsPerSecond}
            </div>
          </div>

          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="text-sm text-indigo-600 font-medium">
              Active Listeners
            </div>
            <div className="text-3xl font-bold text-indigo-900">
              {metrics.listenerCount}
            </div>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">
              Memory Usage
            </div>
            <div className="text-3xl font-bold text-purple-900">
              {metrics.memoryUsage.toFixed(1)} KB
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium">
              Avg Execution
            </div>
            <div className="text-3xl font-bold text-yellow-900">
              {metrics.averageExecutionTime.toFixed(2)} ms
            </div>
          </div>
        </div>

        {/* Event Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-3">Event Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(eventCounts).length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                No events recorded
              </div>
            ) : (
              Object.entries(eventCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([name, count]) => {
                  const percentage = (count / metrics.totalEvents) * 100;
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">
                          {name}
                        </span>
                        <span className="text-gray-600">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Performance Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2 text-amber-900">
            <span role="img" aria-label="Lightbulb" className="mr-1">
              💡
            </span>
            Performance Tips
          </h3>
          <ul className="text-xs text-amber-800 space-y-1">
            <li>• Keep event payloads small to reduce memory usage</li>
            <li>• Unsubscribe listeners when components unmount</li>
            <li>• Use throttling for high-frequency events</li>
            <li>• Consider batching events when possible</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
