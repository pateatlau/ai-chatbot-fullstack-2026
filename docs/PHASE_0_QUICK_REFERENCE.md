# Design System Phase 0 - Quick Reference

## Theme System Usage

### 1. Using ThemeProvider

**In Shell (apps/shell/src/app/app.tsx):**

```tsx
import { ThemeProvider } from '@myapp/frontend/ui-components';

<ThemeProvider defaultTheme="light" storageKey="app-theme">
  <App />
</ThemeProvider>;
```

**In Standalone MFE (e.g., apps/auth-mfe/src/app/standalone-wrapper.tsx):**

```tsx
import { ThemeProvider } from '@ai-chatbot/ui-components';

<ThemeProvider defaultTheme="light" storageKey="auth-mfe-theme">
  {children}
</ThemeProvider>;
```

### 2. Using Theme Hook

```tsx
import { useTheme } from '@myapp/frontend/ui-components';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
    </div>
  );
}
```

### 3. Using ThemeToggle Component

```tsx
import { ThemeToggle } from '@myapp/frontend/ui-components';

// Simple toggle button
<ThemeToggle />

// With label
<ThemeToggle showLabel={true} />

// With custom styling
<ThemeToggle className="my-custom-class" />
```

### 4. Using Navigation Component

```tsx
import { Navigation, NavLink } from '@myapp/frontend/ui-components';

const navLinks: NavLink[] = [
  { label: 'Dashboard', to: '/dashboard', icon: HomeIcon },
  { label: 'Profile', to: '/profile', icon: UserIcon },
  { label: 'Admin', to: '/admin', icon: ShieldCheckIcon, requiresAdmin: true },
];

<Navigation
  links={navLinks}
  currentPath={location.pathname}
  isAuthenticated={true}
  isAdmin={user?.role === 'admin'}
  userEmail={user?.email}
  onLogout={handleLogout}
/>;
```

### 5. Theme-Aware CSS Classes

**Using CSS Variables (Dynamic):**

```tsx
// These adapt automatically to light/dark theme
<div className="bg-bg-primary text-text-primary border-border-default">
  Content
</div>
```

**Using Tailwind Dark Mode:**

```tsx
// Explicit dark mode overrides
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

**Common Theme Classes:**

- Backgrounds: `bg-bg-primary`, `bg-bg-secondary`, `bg-bg-tertiary`
- Text: `text-text-primary`, `text-text-secondary`, `text-text-tertiary`
- Borders: `border-border-default`, `border-border-focus`, `border-border-hover`
- Interactive: `bg-interactive-primary hover:bg-interactive-primaryHover`

### 6. Theme Colors Reference

**Light Theme:**

- Primary Background: `#ffffff`
- Secondary Background: `#f9fafb`
- Primary Text: `#111827`
- Secondary Text: `#6b7280`
- Border: `#e5e7eb`

**Dark Theme:**

- Primary Background: `#111827`
- Secondary Background: `#1f2937`
- Primary Text: `#f9fafb`
- Secondary Text: `#d1d5db`
- Border: `#374151`

### 7. Responsive Breakpoints

- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

**Usage:**

```tsx
<div className="flex flex-col md:flex-row">
  <div className="w-full md:w-1/2">Content</div>
</div>
```

### 8. Migration Pattern

**Before (Hardcoded):**

```tsx
<div className="bg-gray-50 text-gray-900 border border-gray-200">Content</div>
```

**After (Theme-Aware):**

```tsx
<div className="bg-bg-secondary text-text-primary border border-border-default">
  Content
</div>
```

### 9. Testing Theme Switching

1. Start your app in development
2. Click the ThemeToggle button (sun/moon icon)
3. Verify:
   - Background colors change
   - Text colors change
   - Theme persists on page reload
   - localStorage contains theme preference

### 10. Common Patterns

**Card Component:**

```tsx
<div className="bg-bg-elevated border border-border-default rounded-lg shadow-sm p-4">
  Card Content
</div>
```

**Button Primary:**

```tsx
<button className="bg-interactive-primary hover:bg-interactive-primaryHover text-text-inverse px-4 py-2 rounded-lg">
  Click Me
</button>
```

**Input Field:**

```tsx
<input className="w-full px-3 py-2 bg-bg-primary text-text-primary border border-border-default rounded-md focus:border-border-focus" />
```

## Next: Phase 1

Once Phase 0 is verified working:

1. Update Shell layouts with Navigation component
2. Add ThemeToggle to navigation bars
3. Test theme persistence across navigation
4. Verify mobile responsive menu works
