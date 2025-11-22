# Dark/Light Theme Implementation Guide

## Overview

A complete dark/light theme system has been implemented using your design system. Users can toggle between three theme modes:

- **Light** - Light color scheme
- **Dark** - Dark color scheme
- **System** - Follows OS/browser preferences

## Components & Hooks

### `useTheme()` Hook

Located in: `libs/frontend/ui-components/src/hooks/useTheme.ts`

Use this hook to access and manage the current theme:

```typescript
import { useTheme } from '@myapp/frontend/ui-components';

export function MyComponent() {
  const { theme, effectiveTheme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Effective theme: {effectiveTheme}</p>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
    </div>
  );
}
```

**Hook Returns:**

- `theme: 'light' | 'dark' | 'system'` - The selected theme
- `effectiveTheme: 'light' | 'dark'` - The actual theme being used (resolves 'system')
- `setTheme(newTheme)` - Function to change the theme

### `ThemeToggle` Component

Located in: `libs/frontend/ui-components/src/components/ThemeToggle.tsx`

A pre-built toggle component with light/dark/system buttons:

```typescript
import { ThemeToggle } from '@myapp/frontend/ui-components';

export function Header() {
  return (
    <header className="flex items-center justify-between">
      <h1>My App</h1>
      <ThemeToggle className="mr-4" />
    </header>
  );
}
```

**Props:**

- `className?: string` - Optional CSS classes to apply to the container

### `ThemeProvider` Component

Located in: `libs/frontend/ui-components/src/components/ThemeProvider.tsx`

Wrap your application with this component at the root level:

```typescript
import { ThemeProvider } from '@myapp/frontend/ui-components';
import App from './App';

function Root() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
```

## How It Works

### Theme Storage

Themes are persisted in Zustand store with localStorage middleware:

- **Store Location:** `libs/frontend/stores/src/lib/settings.store.ts`
- **Storage Key:** `user-settings`
- **Default Theme:** `light`

```typescript
interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  theme: 'light' | 'dark' | 'system'; // Theme setting
  language: string;
}
```

### Theme Application

When theme changes:

1. **Class Added to HTML Element**

   ```html
   <html class="dark">
     <!-- or -->
     <html class="light"></html>
   </html>
   ```

2. **Color-Scheme Meta Property Set**

   ```javascript
   document.documentElement.style.colorScheme = 'dark'; // or 'light'
   ```

3. **CSS Variables Applied** (for custom styling)

   ```javascript
   --color-bg-primary: value
   --color-text-primary: value
   // etc...
   ```

4. **Dark Mode Variants Activated** (Tailwind)
   - Tailwind's `dark:` prefix now applies with class-based dark mode
   - All `dark:` classes automatically apply when `<html class="dark">`

### System Theme Detection

When theme is set to 'system':

- Initial theme detection via media query: `window.matchMedia('(prefers-color-scheme: dark)')`
- Listens for OS/browser theme changes
- Automatically switches when user changes OS settings
- Falls back to light mode if detection unavailable

## Usage Examples

### Example 1: Using Theme in a Component

```typescript
import { useTheme } from '@myapp/frontend/ui-components';

export function UserProfile() {
  const { effectiveTheme } = useTheme();

  return (
    <div className={effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
      <h2 className={effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}>
        User Profile
      </h2>
    </div>
  );
}
```

### Example 2: Using Dark Mode Variants (Recommended)

Instead of conditionals, use Tailwind's `dark:` prefix:

```typescript
export function UserProfile() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <h2 className="text-gray-900 dark:text-white">
        User Profile
      </h2>
    </div>
  );
}
```

This approach is preferred because:

- Cleaner code
- No conditional logic needed
- Automatic theme switching
- Easier maintenance

### Example 3: Complete Integration

```typescript
import { ThemeToggle, useTheme } from '@myapp/frontend/ui-components';

export function Header() {
  const { theme } = useTheme();

  return (
    <header className="
      flex items-center justify-between
      bg-white dark:bg-gray-900
      border-b border-gray-200 dark:border-gray-700
      px-6 py-4
      transition-colors duration-300
    ">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        My App
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Theme: {theme}
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
```

## Color Variables

CSS custom properties are set for fine-grained control:

```css
/* Light mode */
--color-bg-primary: #ffffff;
--color-bg-secondary: #f9fafb;
--color-text-primary: #111827;
--color-text-secondary: #6b7280;
--color-border: #e5e7eb;

/* Dark mode */
--color-bg-primary: #ffffff; /* Same, use dark: variant in Tailwind */
--color-bg-secondary: #f3f4f6;
--color-text-primary: #111827;
--color-text-secondary: #6b7280;
--color-border: #e5e7eb;
```

Access these in CSS:

```css
.my-component {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}
```

## Tailwind Dark Mode Integration

All Tailwind color utilities now support dark mode with class-based approach:

```html
<!-- Light Mode -->
<div class="bg-white text-gray-900">Light</div>

<!-- Dark Mode - Add dark: prefix -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Adapts to theme
</div>
```

### Common Dark Mode Patterns

**Cards:**

```typescript
<div className="
  bg-white dark:bg-gray-800
  border border-gray-200 dark:border-gray-700
  rounded-lg shadow-md dark:shadow-lg
">
  {/* content */}
</div>
```

**Text:**

```typescript
<h1 className="text-gray-900 dark:text-white">Heading</h1>
<p className="text-gray-600 dark:text-gray-400">Body text</p>
```

**Buttons:**

```typescript
<button className="
  bg-indigo-600 dark:bg-indigo-500
  text-white
  hover:bg-indigo-700 dark:hover:bg-indigo-600
">
  Click me
</button>
```

**Inputs:**

```typescript
<input className="
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-white
  border border-gray-300 dark:border-gray-600
  focus:border-indigo-500 dark:focus:border-indigo-400
" />
```

## Configuration

### Enabling Dark Mode in Apps

All apps already have dark mode enabled in their Tailwind config:

```javascript
// tailwind.config.js
export default {
  darkMode: 'class', // Uses class-based dark mode
  // ... rest of config
};
```

**Important:** `darkMode: 'class'` means:

- Dark mode is controlled by adding `class="dark"` to `<html>` element
- NOT by user OS preferences (that's handled by the 'system' theme option)

### Theme Persistence

Themes are automatically persisted to localStorage:

```javascript
// Persisted automatically
localStorage.setItem(
  'user-settings',
  JSON.stringify({
    theme: 'dark',
    // ... other settings
  })
);
```

Users' preferences are restored on page reload.

## Implementation Checklist

- [x] `useTheme()` hook created
- [x] `ThemeToggle` component created
- [x] `ThemeProvider` component created
- [x] Theme storage in settings store
- [x] Dark mode enabled in all Tailwind configs
- [x] System theme detection implemented
- [x] CSS variables setup for custom styling
- [x] Documentation complete

## Next Steps

1. **Add ThemeProvider to Root**
   - Wrap your app root with `<ThemeProvider>`
   - Usually in `main.tsx` or `App.tsx`

2. **Add ThemeToggle to Header/Navigation**
   - Import `ThemeToggle` component
   - Place in your header/navigation bar
   - Users can now switch themes

3. **Update Components with Dark Mode**
   - Add `dark:` variants to your components
   - Use Tailwind's dark mode prefix
   - Test in both light and dark modes

4. **Test Theme Switching**
   - Verify persistence (reload page, theme persists)
   - Test system mode (change OS theme, app follows)
   - Test manual mode (toggle between light/dark)

## Browser Support

- Modern browsers: Full support
- System theme detection: All modern browsers
- Fallback: Always defaults to light mode if detection fails
- Mobile: Fully supported on iOS, Android, etc.

## Performance Notes

- Theme switching uses CSS class toggle (efficient)
- No page reloads needed
- Minimal JavaScript overhead
- CSS transitions smooth the visual change
- LocalStorage used for persistence (< 1KB)

## Troubleshooting

### Theme not persisting

- Clear browser cache and localStorage
- Check browser DevTools → Application → Storage

### Dark mode not applying

- Verify `<html class="dark">` is present
- Check Tailwind config has `darkMode: 'class'`
- Rebuild CSS (run `npm run build`)

### System theme not detected

- Verify browser supports `prefers-color-scheme` media query
- Check OS has light/dark mode setting
- Try setting theme manually (not system)

## Future Enhancements

- [ ] Add more theme presets (e.g., 'auto', 'custom')
- [ ] Theme scheduling (auto-switch at specific times)
- [ ] Per-component theme overrides
- [ ] Theme animation customization
- [ ] Accessibility improvements (high contrast mode)
