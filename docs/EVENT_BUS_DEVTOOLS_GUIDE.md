# Event Bus DevTools User Guide

## Overview

The Event Bus DevTools provides a comprehensive debugging interface for monitoring and analyzing event-driven communication across your MFE application.

## Accessing DevTools

### Keyboard Shortcut

Press **Ctrl+Shift+E** (or **Cmd+Shift+E** on Mac) to toggle the DevTools panel.

### Visual Button

Click the **🔧 DevTools** button in the bottom-right corner of the screen (development mode only).

### Availability

DevTools is **only available in development mode** (`NODE_ENV=development`).

---

## Features

### 1. Event History Viewer

The Event History tab shows a chronological list of all emitted events.

#### Features:

- **Event List**: See all events with timestamps
- **Search**: Filter events by name or data content
- **Type Filter**: Filter by specific event types
- **Event Details**: Click any event to view:
  - Full event name
  - Timestamp (ISO format and local time)
  - Complete event data (JSON formatted)
  - Full event object

#### Color Coding:

- 🟢 **Green**: Login, create operations
- 🔴 **Red**: Logout, delete operations
- 🟡 **Yellow**: Update, change operations
- 🔵 **Blue**: General events

#### Actions:

- **Clear History**: Remove all events from history

#### Usage Example:

```typescript
// After emitting an event
eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, {
  userId: '123',
  email: 'user@example.com',
});

// 1. Open DevTools (Ctrl+Shift+E)
// 2. Go to "Event History" tab
// 3. See the USER_LOGGED_IN event with full data
// 4. Click to view detailed JSON
```

---

### 2. Performance Monitor

The Performance tab displays real-time metrics about event bus performance.

#### Metrics Displayed:

**Total Events**

- Count of all events in history
- Updates in real-time

**Events/Second**

- Throughput metric
- Events emitted in the last second
- Helps identify event storms

**Active Listeners**

- Total number of registered listeners
- Shows how many components are listening
- Helps identify memory leaks

**Memory Usage**

- Size of event history in KB
- Tracks memory footprint
- Useful for production optimization

**Avg Execution**

- Average listener execution time
- Future: Will track performance
- Currently: 0ms (pending implementation)

#### Event Breakdown:

- Bar chart showing event distribution
- Percentage of each event type
- Sorted by frequency (highest first)

#### Performance Tips:

The panel includes best practices:

- Keep event payloads small
- Unsubscribe listeners when components unmount
- Use throttling for high-frequency events
- Consider batching events when possible

---

### 3. Configuration Panel

The Configuration tab allows you to customize Event Bus behavior.

#### Settings:

**Environment**

- Development / Production mode
- Shows current `NODE_ENV`

**Event History**

- **Max History Size**: 10-1000 events (default: 100)
- Controls memory usage
- Older events are automatically pruned

**Logging**

- **Enable Console Logging**: Toggle logging
- **Log Level**: None, Error, Warn, Info, Debug
- Controls console output verbosity

**Performance Tracking**

- **Enable Performance Tracking**: Toggle metrics
- Tracks event execution time (future feature)

#### Production Recommendations:

When in production mode, the panel shows warnings:

- ⚠️ Set maxHistorySize to 50 or less
- ⚠️ Disable console logging
- ⚠️ Use log level 'error' or 'warn' only
- ⚠️ Consider disabling DevTools in production builds

#### Actions:

- **Save Configuration**: Persist to localStorage
- **Reset to Defaults**: Restore default settings

---

## Common Use Cases

### Debugging Event Flow

**Problem**: Event not triggering expected behavior

**Solution**:

1. Open DevTools (Ctrl+Shift+E)
2. Go to Event History
3. Perform the action (e.g., login)
4. Check if event appears in history
5. Verify event name and data payload
6. Check Performance tab for listener count

### Identifying Performance Issues

**Problem**: Application feels slow

**Solution**:

1. Open Performance Monitor
2. Check Events/Second metric
3. Look for event storms (>10 events/sec)
4. Review Event Breakdown for frequent events
5. Check Memory Usage
6. Optimize high-frequency events

### Verifying Event Listeners

**Problem**: Unsure if listeners are properly cleaned up

**Solution**:

1. Note Active Listeners count
2. Navigate to a page
3. Check listener count (should increase)
4. Navigate away
5. Check listener count (should decrease)
6. If count doesn't decrease, memory leak detected

### Testing Event Payloads

**Problem**: Need to verify event data structure

**Solution**:

1. Emit test event
2. Open Event History
3. Click the event
4. Review JSON payload in detail view
5. Verify all required fields present
6. Check data types and format

---

## Keyboard Shortcuts

| Shortcut                            | Action                |
| ----------------------------------- | --------------------- |
| **Ctrl+Shift+E** (Mac: Cmd+Shift+E) | Toggle DevTools panel |

---

## Panel Controls

### Resizing

- Drag bottom-right corner to resize panel
- Minimum size: 400x300px

### Moving

- Currently fixed position (bottom-left)
- Future: Drag header to move

### Tabs

- Click tab headers to switch views
- History / Performance / Configuration

---

## Best Practices

### Development Workflow

1. **Keep DevTools Open**: Monitor events in real-time
2. **Check After Actions**: Verify events after user actions
3. **Review Periodically**: Check Performance tab regularly
4. **Clear History**: Clear when switching test scenarios

### Debugging Tips

1. **Use Search**: Filter by event type or data
2. **Watch Timestamps**: Verify event order
3. **Check Payloads**: Ensure complete data
4. **Monitor Listeners**: Watch for leaks

### Performance Optimization

1. **Monitor Events/Second**: Keep under 10 for UI interactions
2. **Check Memory Usage**: Keep history small in production
3. **Review Breakdown**: Identify frequently emitted events
4. **Optimize Hot Paths**: Reduce unnecessary events

---

## Troubleshooting

### DevTools Not Showing

**Issue**: DevTools button not visible

**Solutions**:

- Check `NODE_ENV=development`
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors

### Events Not Appearing

**Issue**: Events missing from history

**Solutions**:

- Verify `enableHistory: true` in configuration
- Check maxHistorySize hasn't been exceeded
- Ensure event is actually being emitted
- Check Configuration tab settings

### Performance Metrics Zero

**Issue**: All metrics show zero

**Solutions**:

- No events emitted yet (normal on fresh load)
- History disabled in configuration
- Clear browser cache and reload

### Listener Count Incorrect

**Issue**: Listener count doesn't match expectations

**Solutions**:

- Check components are properly mounted
- Verify useEffect cleanup functions exist
- Review component unmount behavior
- Check for multiple subscriptions

---

## API Reference

### Event Bus Methods Used

```typescript
// Get event history
const history = eventBus.getEventHistory();

// Get statistics
const stats = eventBus.getStats();

// Clear history
eventBus.clearHistory();
```

### Configuration Storage

DevTools stores configuration in `localStorage`:

```typescript
// Key
'eventBusConfig'

// Value structure
{
  maxHistorySize: number,
  enableLogging: boolean,
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug',
  enablePerformanceTracking: boolean,
  environment: 'development' | 'production'
}
```

---

## Future Enhancements

### Planned Features:

- [ ] Execution time tracking
- [ ] Event replay functionality
- [ ] Export event history to JSON
- [ ] Advanced filtering (regex, date range)
- [ ] Listener details view
- [ ] Event flow visualization
- [ ] Performance profiling
- [ ] Custom event annotations

---

## Support

For issues or feature requests, see:

- Main documentation: `docs/EVENT_BUS_DOCUMENTATION_INDEX.md`
- Quick start: `docs/EVENT_BUS_QUICK_START.md`
- API reference: Event Bus implementation

---

**Version**: 1.0.0  
**Last Updated**: Phase 5 completion  
**Maintainers**: Event Bus Team
