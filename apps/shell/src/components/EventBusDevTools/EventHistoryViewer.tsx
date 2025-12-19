import { useState, useMemo } from 'react';
import { getEventBus } from '@myapp/shared/event-bus';

interface EventHistoryViewerProps {
  maxEvents?: number;
}

interface EventBusEvent {
  name: string;
  data: any;
  timestamp: number;
}

export function EventHistoryViewer({
  maxEvents = 100,
}: EventHistoryViewerProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventBusEvent | null>(
    null
  );
  const [filter, setFilter] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');

  const eventBus = getEventBus();
  const history = eventBus.getEventHistory();

  // Get unique event types
  const eventTypes = useMemo(() => {
    const types = new Set(history.map((e: any) => e.name));
    return ['all', ...Array.from(types)];
  }, [history]);

  // Filter and limit events
  const filteredEvents = useMemo(() => {
    let filtered = history;

    // Filter by event type
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter((e: any) => e.name === eventTypeFilter);
    }

    // Filter by search term
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      filtered = filtered.filter((e: any) => {
        const eventStr = JSON.stringify(e).toLowerCase();
        return eventStr.includes(lowerFilter);
      });
    }

    // Limit to most recent events
    return filtered.slice(-maxEvents);
  }, [history, filter, eventTypeFilter, maxEvents]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  const getEventColor = (eventName: string) => {
    if (eventName.includes('LOGGED_IN') || eventName.includes('CREATED')) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    if (eventName.includes('LOGGED_OUT') || eventName.includes('DELETED')) {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    if (eventName.includes('UPDATED') || eventName.includes('CHANGED')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const clearHistory = () => {
    const history = eventBus.getEventHistory();
    history.length = 0;
    setSelectedEvent(null);
  };

  return (
    <div className="flex h-full">
      {/* Event List */}
      <div className="flex-1 flex flex-col border-r border-gray-200">
        {/* Toolbar */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Search events..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Events' : type}
                </option>
              ))}
            </select>
            <button
              onClick={clearHistory}
              className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
            >
              Clear
            </button>
          </div>
          <div className="text-xs text-gray-600">
            Showing {filteredEvents.length} of {history.length} events
          </div>
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">
                <span role="img" aria-label="Empty mailbox">
                  📭
                </span>
              </div>
              <div className="text-sm">No events to display</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredEvents.map((event: any, index: number) => (
                <div
                  key={`${event.timestamp}-${index}`}
                  onClick={() => setSelectedEvent(event)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 ${
                    selectedEvent?.timestamp === event.timestamp
                      ? 'bg-blue-50'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded border ${getEventColor(
                        event.name
                      )}`}
                    >
                      {event.name}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  {event.data && Object.keys(event.data).length > 0 && (
                    <div className="mt-1 text-xs text-gray-600 truncate">
                      {Object.keys(event.data).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Details */}
      <div className="w-1/2 flex flex-col bg-gray-50">
        {selectedEvent ? (
          <>
            <div className="p-3 border-b border-gray-200 bg-white">
              <h3 className="font-semibold text-sm">Event Details</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Event Name
                  </label>
                  <div
                    className={`inline-block px-3 py-1 text-sm font-medium rounded border ${getEventColor(
                      selectedEvent.name
                    )}`}
                  >
                    {selectedEvent.name}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Timestamp
                  </label>
                  <div className="text-sm text-gray-900 font-mono">
                    {new Date(selectedEvent.timestamp).toISOString()}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {formatTimestamp(selectedEvent.timestamp)}
                  </div>
                </div>

                {selectedEvent.data &&
                  Object.keys(selectedEvent.data).length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Event Data
                      </label>
                      <pre className="p-3 text-xs bg-white border border-gray-200 rounded overflow-x-auto">
                        {JSON.stringify(selectedEvent.data, null, 2)}
                      </pre>
                    </div>
                  )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Event Object
                  </label>
                  <pre className="p-3 text-xs bg-white border border-gray-200 rounded overflow-x-auto">
                    {JSON.stringify(selectedEvent, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">
                <span role="img" aria-label="Point left">
                  👈
                </span>
              </div>
              <div className="text-sm">Select an event to view details</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
