# Theme System - Quick Integration Guide

## 3-Minute Setup

### 1. Wrap Your App Root (Shell Example)

**File**: `apps/shell/src/app/app.tsx` (or main root component)

```typescript
import { ThemeProvider } from '@myapp/frontend/ui-components';
import { DashboardLayout } from './layouts/DashboardLayout';

function App() {
  return (
    <ThemeProvider>
      <DashboardLayout />
    </ThemeProvider>
  );
}

export default App;
```

### 2. Add ThemeToggle to Header

**File**: `apps/shell/src/layouts/DashboardLayout.tsx` (or header component)

```typescript
import { ThemeToggle } from '@myapp/frontend/ui-components';

export function DashboardLayout() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <h1>Dashboard</h1>
      <ThemeToggle className="mr-4" />
    </header>
  );
}
```

### 3. Use Dark Variants in Components

Replace conditionals with Tailwind `dark:` prefix:

```typescript
// ❌ Before
<div className={theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>

// ✅ After
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

### 4. Repeat for Other MFEs

Apply same pattern to:

- `apps/chatbot-mfe/src/app/app.tsx`
- `apps/auth-mfe/src/app/app.tsx`
- `apps/profile-mfe/src/app/app.tsx`
- `apps/admin-mfe/src/app/app.tsx`

## Common Dark Mode Patterns

### Cards

```typescript
className =
  'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow dark:shadow-lg';
```

### Text

```typescript
className="text-gray-900 dark:text-white"  {/* headings */}
className="text-gray-600 dark:text-gray-400"  {/* body text */}
```

### Buttons

```typescript
className =
  'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600';
```

### Inputs

```typescript
className =
  'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400';
```

### Forms

```typescript
<label className="block text-gray-700 dark:text-gray-300 mb-2">
  Label
</label>
<input className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white" />
```

## Using the useTheme Hook

```typescript
import { useTheme } from '@myapp/frontend/ui-components';

function MyComponent() {
  const { theme, effectiveTheme, setTheme } = useTheme();

  return (
    <div>
      {/* Display current theme */}
      <p>Theme: {theme}</p>

      {/* Manual toggle if needed */}
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('system')}>System</button>

      {/* Conditional rendering (use sparingly) */}
      {effectiveTheme === 'dark' && <p>Currently dark mode!</p>}
    </div>
  );
}
```

## Verification Checklist

After integration:

- [ ] Add ThemeProvider to shell app.tsx
- [ ] Add ThemeToggle to shell header
- [ ] Build passes: `npm run build`
- [ ] Theme toggle appears in header
- [ ] Clicking buttons changes theme
- [ ] CSS class on `<html>` changes (inspect DevTools)
- [ ] Colors update immediately
- [ ] Refresh page: theme persists
- [ ] Change OS theme: system mode follows (if selected)
- [ ] Repeat for each MFE

## Test Commands

```bash
# Build all apps
npm run build

# Build just ui-components
npx nx build ui-components

# Run shell dev
npm run dev:shell

# Run chatbot-mfe dev
npm run dev:chatbot

# Check for TypeScript errors
npm run lint
```

## Debugging

### Theme toggle doesn't appear

- Verify `<ThemeProvider>` wraps root component
- Check import is correct: `@myapp/frontend/ui-components`
- Verify build: `npx nx build ui-components`

### Theme doesn't persist

- Check localStorage in DevTools → Application → Storage
- Verify `<ThemeProvider>` is in place
- Check browser console for errors

### Dark styles don't apply

- Verify `<html class="dark">` is present (DevTools)
- Verify Tailwind config has `darkMode: 'class'`
- Rebuild CSS: `npm run build`
- Clear browser cache

### System detection not working

- Check browser supports `prefers-color-scheme`
- Verify OS has light/dark mode setting
- Try manual theme switching first

## File References

- **Hook**: `libs/frontend/ui-components/src/hooks/useTheme.ts`
- **Component**: `libs/frontend/ui-components/src/components/ThemeToggle.tsx`
- **Provider**: `libs/frontend/ui-components/src/components/ThemeProvider.tsx`
- **Guide**: `THEME_SYSTEM_GUIDE.md`
- **Settings Store**: `libs/frontend/stores/src/lib/settings.store.ts`

## That's It! 🎉

Your theme system is ready. Start integrating and you'll have dark/light mode working across your entire frontend in minutes.

---

**Questions?** See `THEME_SYSTEM_GUIDE.md` for comprehensive documentation.
