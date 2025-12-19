# Design System & Component Library

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Quick Start Guide](#quick-start-guide)
4. [Available Modules](#available-modules)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)
7. [Migration Guide](#migration-guide)
8. [Token Reference](#token-reference)
9. [Troubleshooting](#troubleshooting)
10. [Additional Resources](#additional-resources)

---

## Overview

This design system provides design tokens, color utilities, layout patterns, and pre-built components to ensure consistent, accessible, and maintainable UI across all Micro Front-ends (MFEs) in the application.

### Important Rule

All styling **must** use design tokens from `@myapp/frontend/ui-components`. Direct use of Tailwind utility classes (such as `bg-blue-50`, `text-gray-600`, `p-4`) is **not allowed**, except for basic layout utilities (`flex`, `grid`, `gap-*`, `space-*`).

---

## Core Principles

1. **Single Source of Truth** - All design values are defined in `@myapp/frontend/ui-components`
2. **Composability** - Combine design tokens using the `cn()` utility function
3. **Consistency** - Every UI element across all MFEs uses identical design tokens
4. **Accessibility** - Built-in WCAG AA compliant colors, focus states, and ARIA support
5. **Responsiveness** - Mobile-first design with predefined breakpoints
6. **Performance** - Tree-shakeable tokens and optimized transitions

---

## Quick Start Guide

### Step 1: Import the Design System

In any component file, import what you need:

```tsx
import {
  // Design tokens - core styling values
  designTokens,
  
  // Color utilities - semantic color names
  colorMap,
  
  // Layout patterns - grids, flex, containers
  layouts,
  
  // Spacing utilities (optional)
  spacingSystem,
  
  // Animation utilities (optional)
  animations,
  
  // Utility function - combines classes safely
  cn,
  
  // Pre-built components (optional)
  Button,
  Card,
  Input,
} from '@myapp/frontend/ui-components';
```

### Step 2: Use Design Tokens

Replace all hardcoded Tailwind classes with design tokens:

```tsx
// WRONG - Don't use hardcoded classes
<div className="bg-gray-50 p-6 text-gray-900">
  <h2 className="text-2xl font-bold mb-4">Title</h2>
</div>

// CORRECT - Use design tokens
<div className={cn(colorMap.bg.secondary, designTokens.padding.lg)}>
  <h2 className={cn(designTokens.typography.h2, colorMap.text.primary, 'mb-4')}>
    Title
  </h2>
</div>
```

### Step 3: Combine Classes with cn()

The `cn()` function safely combines multiple class strings:

```tsx
<button
  className={cn(
    designTokens.buttonBase,           // Base button styles
    designTokens.buttonVariants.primary, // Primary variant
    designTokens.buttonSizes.md,       // Medium size
    'w-full'                            // Custom width (layout utility OK)
  )}
>
  Click Me
</button>
```

---

## Available Modules

### 1. designTokens - Core Design Values

Located in `src/lib/design-tokens.ts`. This is the foundation of the design system.

**Available properties:**
- `colors` - Background colors (primary, secondary, success, danger, warning, neutral)
- `textColors` - Text color values
- `spacing` - Gap utilities for flex/grid
- `padding` - Padding values (xs, sm, md, lg, xl, compact, normal, spacious)
- `typography` - Complete typography scale (h1-h6, body, label, caption)
- `buttonBase` - Base button structure
- `buttonSizes` - Button size variants (xs, sm, md, lg)
- `buttonVariants` - Button style variants (primary, secondary, outline, danger, etc.)
- `cardBase` - Base card structure
- `inputBase` - Base input structure
- `shadows` - Shadow scale (xs, sm, md, lg, xl)
- `borderRadius` - Border radius values
- `transitions` - Transition timings
- `states` - Interactive states (hover, focus, active, disabled)
- `flex` - Flex utilities
- `grid` - Grid layouts
- `sizes` - Container size constraints
- `container` - Main container wrapper
- `section` - Section spacing

### 2. colorMap - Semantic Color System

Located in `src/lib/color-system.ts`. Provides semantic color names.

**Why use semantic colors?**

Instead of `bg-gray-50` or `text-gray-600`, use semantic names that describe the purpose, not the appearance:

```tsx
// Don't use - tied to specific color
<div className="bg-gray-50">
  <p className="text-gray-600">Text</p>
</div>

// Use semantic names - easier to theme
<div className={colorMap.bg.secondary}>
  <p className={colorMap.text.secondary}>Text</p>
</div>
```

**Available color maps:**

```typescript
// Background colors
colorMap.bg.primary       // bg-primary-50 (light indigo)
colorMap.bg.secondary     // bg-gray-50 (light gray)
colorMap.bg.muted         // bg-gray-100 (muted gray)
colorMap.bg.interactive   // bg-primary-600 (interactive indigo)
colorMap.bg.danger        // bg-red-50 (light red)
colorMap.bg.success       // bg-green-50 (light green)
colorMap.bg.warning       // bg-yellow-50 (light yellow)

// Text colors
colorMap.text.primary     // text-gray-900 (dark gray)
colorMap.text.secondary   // text-gray-600 (medium gray)
colorMap.text.muted       // text-gray-500 (muted gray)
colorMap.text.light       // text-gray-400 (light gray)
colorMap.text.inverse     // text-white
colorMap.text.interactive // text-primary-600 (interactive indigo)
colorMap.text.danger      // text-red-600 (error/danger)
colorMap.text.success     // text-green-600 (success)
colorMap.text.warning     // text-yellow-600 (warning)

// Border colors
colorMap.border.default     // border-gray-200
colorMap.border.interactive // border-primary-300
colorMap.border.focus       // border-primary-500
colorMap.border.danger      // border-red-300
colorMap.border.success     // border-green-300
colorMap.border.warning     // border-yellow-300

// Status badge colors (combined bg + text)
colorMap.status.info     // bg-blue-100 text-blue-800
colorMap.status.success  // bg-green-100 text-green-800
colorMap.status.warning  // bg-yellow-100 text-yellow-800
colorMap.status.error    // bg-red-100 text-red-800
```

### 3. layouts - Layout Patterns

Located in `src/lib/spacing-layout.ts`. Provides responsive layout utilities.

```typescript
// Containers
layouts.container        // max-w-7xl with responsive padding
layouts.containerSmall   // max-w-4xl with responsive padding
layouts.containerLarge   // max-w-full with responsive padding

// Responsive Grids
layouts.gridResponsive['2Col']  // 1 col mobile, 2 col desktop
layouts.gridResponsive['3Col']  // 1 col mobile, 2 col tablet, 3 col desktop
layouts.gridResponsive['4Col']  // 1 col mobile, 2 col tablet, 4 col desktop

// Flex Patterns
layouts.flex            // Basic flex container
layouts.between         // Flex with space-between and center alignment
layouts.centerContent   // Centered content
layouts.centerBetween   // Space-between with center alignment

// Stack Patterns
layouts.vStack          // Vertical stack with gap-3
layouts.vStackLarge     // Vertical stack with gap-6
layouts.hStack          // Horizontal stack with gap-3
layouts.hStackLarge     // Horizontal stack with gap-6
```

### 4. spacingSystem - Spacing Utilities

```typescript
// Padding
spacingSystem.padding.xs   // p-2
spacingSystem.padding.sm   // p-3
spacingSystem.padding.md   // p-4
spacingSystem.padding.lg   // p-6
spacingSystem.padding.xl   // p-8

// Gap (for flex/grid containers)
spacingSystem.gap.xs       // gap-1
spacingSystem.gap.sm       // gap-2
spacingSystem.gap.md       // gap-3
spacingSystem.gap.lg       // gap-4
spacingSystem.gap.xl       // gap-6
```

### 5. animations - Animation & State Utilities

Located in `src/lib/animations-states.ts`:

```typescript
// Transitions
animations.transitions.fast     // 150ms transition
animations.transitions.normal   // 300ms transition
animations.transitions.slow     // 500ms transition

// Hover Effects
animations.hover.scaleUp        // Hover scale up
animations.hover.shadowUp       // Hover shadow increase
animations.hover.brighten       // Hover opacity change

// Focus States
animations.focus.ring           // Focus ring (primary-500)
animations.focus.visible        // Focus-visible ring

// Pre-composed Patterns
statePatterns.interactiveButton // Complete button interaction states
statePatterns.interactiveCard   // Card hover + active states
statePatterns.focusableInput    // Input focus pattern
```

### 6. componentPresets - Pre-composed Components

Pre-built combinations for common patterns:

```typescript
// Buttons
componentPresets.button.primary    // Primary button (all states included)
componentPresets.button.secondary  // Secondary button
componentPresets.button.outline    // Outline button
componentPresets.button.small      // Small primary button
componentPresets.button.large      // Large primary button

// Cards
componentPresets.card.default      // Standard card
componentPresets.card.interactive  // Clickable card with hover
componentPresets.card.elevated     // Card with more shadow

// Inputs
componentPresets.input.default     // Standard input
componentPresets.input.error       // Error state input
componentPresets.input.success     // Success state input
```

---

## Usage Examples

### Example 1: Page Header

```tsx
import { designTokens, colorMap, cn } from '@myapp/frontend/ui-components';

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8">
      <h1 className={cn(designTokens.typography.h2, colorMap.text.primary, 'mb-2')}>
        {title}
      </h1>
      <p className={cn(designTokens.typography.body, colorMap.text.secondary)}>
        {description}
      </p>
    </div>
  );
}
```

### Example 2: Responsive Card Grid

```tsx
import { layouts, designTokens, colorMap, cn } from '@myapp/frontend/ui-components';

export function CardGrid({ items }: { items: Item[] }) {
  return (
    <div className={layouts.gridResponsive['3Col']}>
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            designTokens.cardBase,
            designTokens.cardHover,
            designTokens.padding.lg
          )}
        >
          <h3 className={cn(designTokens.typography.h4, colorMap.text.primary, 'mb-2')}>
            {item.title}
          </h3>
          <p className={cn(designTokens.typography.bodySmall, colorMap.text.secondary)}>
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Button Group

```tsx
import { designTokens, layouts, cn } from '@myapp/frontend/ui-components';

export function ActionButtons() {
  return (
    <div className={layouts.hStack}>
      <button
        className={cn(
          designTokens.buttonBase,
          designTokens.buttonVariants.primary,
          designTokens.buttonSizes.md
        )}
      >
        Save Changes
      </button>
      <button
        className={cn(
          designTokens.buttonBase,
          designTokens.buttonVariants.outline,
          designTokens.buttonSizes.md
        )}
      >
        Cancel
      </button>
    </div>
  );
}
```

### Example 4: Form Input with Label

```tsx
import { designTokens, colorMap, cn } from '@myapp/frontend/ui-components';

export function FormField({ label, error }: { label: string; error?: string }) {
  return (
    <div className="space-y-2">
      <label className={cn(designTokens.typography.label, colorMap.text.primary)}>
        {label}
      </label>
      <input
        type="text"
        className={cn(
          designTokens.inputBase,
          error && designTokens.inputError,
          designTokens.transitions.normal
        )}
      />
      {error && (
        <p className={cn(designTokens.typography.bodySmall, colorMap.text.danger)}>
          {error}
        </p>
      )}
    </div>
  );
}
```

### Example 5: Status Badge

```tsx
import { colorMap, designTokens, cn } from '@myapp/frontend/ui-components';

export function StatusBadge({ status }: { status: 'success' | 'warning' | 'error' | 'info' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full',
        designTokens.padding.compact,
        colorMap.status[status]
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
```

### Example 6: Data Table

```tsx
import { designTokens, colorMap, cn } from '@myapp/frontend/ui-components';

export function DataTable({ data }: { data: User[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className={colorMap.bg.secondary}>
          <tr>
            <th
              className={cn(
                designTokens.typography.label,
                colorMap.text.primary,
                designTokens.padding.normal
              )}
            >
              Name
            </th>
            <th
              className={cn(
                designTokens.typography.label,
                colorMap.text.primary,
                designTokens.padding.normal
              )}
            >
              Email
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td
                className={cn(
                  designTokens.typography.body,
                  designTokens.padding.normal
                )}
              >
                {user.name}
              </td>
              <td
                className={cn(
                  designTokens.typography.bodySmall,
                  colorMap.text.secondary,
                  designTokens.padding.normal
                )}
              >
                {user.email}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Best Practices

### Common Patterns

**Pattern 1: Page Container**
```tsx
<div className={cn(layouts.container, designTokens.section)}>
  {/* Page content */}
</div>
```

**Pattern 2: Section Spacing**
```tsx
<div className="space-y-6">
  <Section1 />
  <Section2 />
  <Section3 />
</div>
```

**Pattern 3: Conditional Styling**
```tsx
<button
  className={cn(
    designTokens.buttonBase,
    isLoading
      ? designTokens.buttonVariants.secondary
      : designTokens.buttonVariants.primary,
    designTokens.buttonSizes.md
  )}
  disabled={isLoading}
>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

**Pattern 4: Interactive Card**
```tsx
<div
  className={cn(
    designTokens.cardBase,
    'cursor-pointer transition-all duration-200',
    'hover:shadow-lg hover:border-primary-300 active:scale-99'
  )}
  onClick={handleClick}
>
  {content}
</div>
```

### Do's and Don'ts

**Colors**

DO:
```tsx
<div className={colorMap.bg.secondary}>
  <p className={colorMap.text.secondary}>Text</p>
</div>
```

DON'T:
```tsx
<div className="bg-gray-50">
  <p className="text-gray-600">Text</p>
</div>
```

**Typography**

DO:
```tsx
<h2 className={cn(designTokens.typography.h2, colorMap.text.primary)}>
  Title
</h2>
```

DON'T:
```tsx
<h2 className="text-3xl font-bold text-gray-900">
  Title
</h2>
```

**Buttons**

DO:
```tsx
<button
  className={cn(
    designTokens.buttonBase,
    designTokens.buttonVariants.primary,
    designTokens.buttonSizes.md
  )}
>
  Click Me
</button>
```

DON'T:
```tsx
<button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
  Click Me
</button>
```

**Spacing**

DO:
```tsx
<div className={designTokens.padding.lg}>
  Content
</div>
```

DON'T:
```tsx
<div className="p-6">
  Content
</div>
```

---

## Migration Guide

### Migrating Existing Components

Follow these steps to migrate a component with hardcoded Tailwind classes:

**Step 1: Add Design System Imports**
```tsx
import { designTokens, colorMap, layouts, cn } from '@myapp/frontend/ui-components';
```

**Step 2: Replace Background Colors**
```tsx
// Before
<div className="bg-gray-50">

// After
<div className={colorMap.bg.secondary}>
```

**Step 3: Replace Text Colors**
```tsx
// Before
<p className="text-gray-600">

// After
<p className={colorMap.text.secondary}>
```

**Step 4: Replace Typography**
```tsx
// Before
<h2 className="text-2xl font-bold">

// After
<h2 className={designTokens.typography.h2}>
```

**Step 5: Replace Padding/Spacing**
```tsx
// Before
<div className="p-6">

// After
<div className={designTokens.padding.lg}>
```

**Step 6: Replace Buttons**
```tsx
// Before
<button className="px-4 py-2 bg-indigo-600 text-white rounded-md">

// After
<button className={cn(
  designTokens.buttonBase,
  designTokens.buttonVariants.primary,
  designTokens.buttonSizes.md
)}>
```

---

## Token Reference

### Typography Tokens

```typescript
designTokens.typography.h1             // text-4xl md:text-5xl font-bold leading-tight
designTokens.typography.h2             // text-3xl md:text-4xl font-bold leading-tight
designTokens.typography.h3             // text-2xl md:text-3xl font-semibold leading-tight
designTokens.typography.h4             // text-xl md:text-2xl font-semibold leading-snug
designTokens.typography.h5             // text-lg md:text-xl font-semibold
designTokens.typography.h6             // text-base md:text-lg font-semibold
designTokens.typography.body           // text-base leading-relaxed
designTokens.typography.bodyLarge      // text-lg md:text-xl leading-relaxed
designTokens.typography.bodySmall      // text-sm leading-relaxed
designTokens.typography.bodyExtraSmall // text-xs leading-relaxed
designTokens.typography.label          // text-sm font-medium
designTokens.typography.caption        // text-xs font-medium
```

### Spacing Tokens

```typescript
// Padding
designTokens.padding.xs       // p-2
designTokens.padding.sm       // p-3
designTokens.padding.md       // p-4
designTokens.padding.lg       // p-6
designTokens.padding.xl       // p-8
designTokens.padding.compact  // px-3 py-2
designTokens.padding.normal   // px-4 py-3
designTokens.padding.spacious // px-6 py-4

// Gap (for flex/grid containers)
designTokens.spacing.xs       // gap-1 (4px)
designTokens.spacing.sm       // gap-2 (8px)
designTokens.spacing.md       // gap-3 (12px)
designTokens.spacing.lg       // gap-4 (16px)
designTokens.spacing.xl       // gap-6 (24px)
designTokens.spacing['2xl']   // gap-8 (32px)
designTokens.spacing['3xl']   // gap-12 (48px)
```

### Button Tokens

```typescript
// Base structure (always include this)
designTokens.buttonBase

// Sizes
designTokens.buttonSizes.xs   // px-2 py-1 text-xs
designTokens.buttonSizes.sm   // px-3 py-2 text-sm
designTokens.buttonSizes.md   // px-4 py-2 text-base
designTokens.buttonSizes.lg   // px-6 py-3 text-lg

// Variants
designTokens.buttonVariants.primary      // Indigo primary button
designTokens.buttonVariants.secondary    // Gray secondary button
designTokens.buttonVariants.outline      // Outline button
designTokens.buttonVariants.ghost        // Ghost button (no background)
designTokens.buttonVariants.danger       // Red danger button
designTokens.buttonVariants.success      // Green success button
designTokens.buttonVariants.lightBlueBg  // Blue variant button
```

### Card & Input Tokens

```typescript
// Cards
designTokens.cardBase   // Base card structure
designTokens.cardHover  // Hover effect for cards

// Inputs
designTokens.inputBase    // Base input structure
designTokens.inputError   // Error state styling
designTokens.inputSuccess // Success state styling
```

### Layout Tokens

```typescript
// Containers
designTokens.container    // mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl
designTokens.section      // py-6 md:py-8 lg:py-12

// Grid Layouts
designTokens.grid.cols1   // grid grid-cols-1
designTokens.grid.cols2   // grid grid-cols-1 md:grid-cols-2
designTokens.grid.cols3   // grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
designTokens.grid.cols4   // grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4
designTokens.grid.gap     // gap-4 md:gap-6

// Flex Utilities
designTokens.flex.center     // flex items-center justify-center
designTokens.flex.between    // flex items-center justify-between
designTokens.flex.start      // flex items-start justify-start
designTokens.flex.end        // flex items-end justify-end
designTokens.flex.col        // flex flex-col
designTokens.flex.colCenter  // flex flex-col items-center justify-center
```

### Shadow & Border Tokens

```typescript
// Shadows
designTokens.shadows.xs    // shadow-sm
designTokens.shadows.sm    // shadow-sm
designTokens.shadows.md    // shadow
designTokens.shadows.lg    // shadow-lg
designTokens.shadows.xl    // shadow-xl

// Border Radius
designTokens.borderRadius.none  // rounded-none
designTokens.borderRadius.sm    // rounded-sm
designTokens.borderRadius.base  // rounded
designTokens.borderRadius.md    // rounded-md
designTokens.borderRadius.lg    // rounded-lg
designTokens.borderRadius.xl    // rounded-xl
designTokens.borderRadius.full  // rounded-full

// Border Styles
designTokens.border.light   // border border-gray-200
designTokens.border.normal  // border border-gray-300
designTokens.border.bold    // border-2 border-gray-400
designTokens.border.primary // border border-primary-200
designTokens.border.focus   // border border-primary-500
```

### State Tokens

```typescript
// Interactive States
designTokens.states.hover    // hover:opacity-90 hover:shadow-md
designTokens.states.active   // active:scale-95
designTokens.states.disabled // disabled:opacity-50 disabled:cursor-not-allowed
designTokens.states.focus    // focus:outline-none focus:ring-2 focus:ring-primary-500...
designTokens.states.focusVisible // focus-visible:outline-none focus-visible:ring-2...

// Transitions
designTokens.transitions.fast   // transition-all duration-150
designTokens.transitions.normal // transition-all duration-300
designTokens.transitions.slow   // transition-all duration-500
```

### Size Constraints

```typescript
// Component Max Widths
designTokens.sizes.xs    // w-full sm:max-w-xs
designTokens.sizes.sm    // w-full sm:max-w-sm
designTokens.sizes.md    // w-full sm:max-w-md
designTokens.sizes.lg    // w-full sm:max-w-lg
designTokens.sizes.xl    // w-full sm:max-w-xl
designTokens.sizes['2xl'] // w-full sm:max-w-2xl
```

### Animation Reference

```typescript
// Transition Timings
animations.transitions.fast     // transition-all duration-150 ease-in-out
animations.transitions.normal   // transition-all duration-300 ease-in-out
animations.transitions.slow     // transition-all duration-500 ease-in-out

// Hover Effects
animations.hover.scaleUp     // hover:scale-105 transition-transform duration-200
animations.hover.scaleDown   // hover:scale-95 transition-transform duration-200
animations.hover.shadowUp    // hover:shadow-lg transition-shadow duration-200
animations.hover.brighten    // hover:opacity-90 transition-opacity duration-200
animations.hover.darken      // hover:opacity-75 transition-opacity duration-200

// Focus & Active States
animations.focus.ring        // focus:outline-none focus:ring-2 focus:ring-primary-500...
animations.focus.visible     // focus-visible:outline-none focus-visible:ring-2...
animations.active.scale      // active:scale-95 transition-transform duration-100
animations.active.shadow     // active:shadow-inner transition-shadow duration-100

// Pre-composed State Patterns
statePatterns.interactiveButton  // Complete button interaction (hover + active + focus + disabled)
statePatterns.interactiveCard    // Card hover + active states
statePatterns.focusableInput     // Input focus ring pattern
statePatterns.editableText       // Editable text hover + focus
```

### Responsive Utilities

```typescript
responsive.hideOnMobile    // hidden md:block
responsive.hideOnDesktop   // md:hidden
responsive.fullOnMobile    // w-full md:w-auto
responsive.stackOnMobile   // flex flex-col md:flex-row
responsive.mobileFirst     // block md:flex
```

---

## Troubleshooting

### Issue: Colors not applying correctly

**Problem:** `designTokens.colors.neutral[200]` doesn't work

```tsx
// This returns an object, not a string
<div className={designTokens.colors.neutral[200]} />
```

**Solution:** Use `colorMap` instead

```tsx
// Use semantic color names
<div className={colorMap.bg.muted} />

// Or for specific cases, use plain Tailwind
<div className="bg-gray-200" />
```

### Issue: Layout not responsive

**Problem:** Grid not responding to screen size

```tsx
// Don't create custom grids
<div className="grid grid-cols-3" />
```

**Solution:** Use responsive grid patterns

```tsx
// Use predefined responsive grids
<div className={layouts.gridResponsive['3Col']} />
```

### Issue: Button styles conflicting

**Problem:** Custom classes override design tokens

```tsx
// Don't mix custom styles with design tokens
<button className={cn(designTokens.buttonBase, 'bg-blue-500')}>
```

**Solution:** Use button variants properly

```tsx
// Use complete button pattern
<button className={cn(
  designTokens.buttonBase,
  designTokens.buttonVariants.primary,
  designTokens.buttonSizes.md
)}>
```

### Issue: cn() function not found

**Problem:** Forgot to import `cn`

```tsx
// Missing import
import { designTokens, colorMap } from '@myapp/frontend/ui-components';
```

**Solution:** Always import `cn` utility

```tsx
// Include cn in imports
import { designTokens, colorMap, cn } from '@myapp/frontend/ui-components';
```

---

## Additional Resources

### File Structure

```
libs/frontend/ui-components/src/
├── components/           # Pre-built React components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── ...
├── lib/                  # Design system core
│   ├── design-tokens.ts  # Core tokens (typography, spacing, etc.)
│   ├── color-system.ts   # Semantic color mappings
│   ├── spacing-layout.ts # Layout patterns
│   └── animations-states.ts # Animation & state utilities
└── index.ts              # Public API exports
```

### Import Organization

Group your imports logically:

```tsx
// External dependencies
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Design system
import {
  designTokens,
  colorMap,
  layouts,
  cn,
  Button,
  Card,
} from '@myapp/frontend/ui-components';

// Internal stores/hooks
import { useAuthStore } from '@myapp/frontend/stores';
import { useToast } from '@myapp/frontend/hooks';

// Local utilities
import { formatDate } from '../utils';
```

### Important Rules

1. **Never use raw Tailwind color classes** like `bg-blue-50`, `text-gray-600`
   - Use `colorMap.bg.*` and `colorMap.text.*` instead

2. **Never use raw typography classes** like `text-2xl font-bold`
   - Use `designTokens.typography.*` instead

3. **Never use raw padding/spacing classes** like `p-6`, `gap-4` (for component padding)
   - Use `designTokens.padding.*` and `spacingSystem.*` instead
   - Exception: Basic layout utilities like `gap-*`, `space-*` in flex/grid containers are acceptable

4. **Never create custom button styles**
   - Use `designTokens.buttonBase` + `buttonVariants` + `buttonSizes`

5. **Always use `cn()` to combine classes**
   - Safely handles conditional classes and deduplication

6. **Keep layout utilities simple**
   - Basic flex/grid utilities (`flex`, `grid`, `gap-4`, `space-y-6`) are acceptable
   - For complex layouts, use `layouts.*` patterns

### Quick Reference

**Find a background color**
→ Use `colorMap.bg.*`

**Find text color**
→ Use `colorMap.text.*`

**Find a heading**
→ Use `designTokens.typography.h1` through `h6`

**Find body text**
→ Use `designTokens.typography.body` (or `bodySmall`, `bodyLarge`)

**Find a button**
→ Use `designTokens.buttonBase` + `buttonVariants.*` + `buttonSizes.*`

**Find padding**
→ Use `designTokens.padding.*`

**Find a card**
→ Use `designTokens.cardBase` (+ `cardHover` for hover effects)

**Find an input**
→ Use `designTokens.inputBase`

**Find a responsive grid**
→ Use `layouts.gridResponsive['2Col']` (or `3Col`, `4Col`)

**Find flex layout**
→ Use `layouts.between`, `layouts.centerContent`, or `layouts.hStack`

**Find a status badge**
→ Use `colorMap.status.success` (or `error`, `warning`, `info`)

### Minimal Component Template

```tsx
import { designTokens, colorMap, cn } from '@myapp/frontend/ui-components';

export function MyComponent() {
  return (
    <div className={cn(colorMap.bg.secondary, designTokens.padding.lg)}>
      <h2 className={cn(designTokens.typography.h2, colorMap.text.primary)}>
        Title
      </h2>
      <p className={cn(designTokens.typography.body, colorMap.text.secondary)}>
        Description
      </p>
    </div>
  );
}
```

### Extending the Design System

To add new design tokens:

1. Update the appropriate file in `src/lib/`:
   - `design-tokens.ts` - Core tokens (typography, spacing, buttons, etc.)
   - `color-system.ts` - Color mappings and semantic names
   - `spacing-layout.ts` - Layout patterns and spacing
   - `animations-states.ts` - Animation and state utilities

2. Export from the module and add to `index.ts` if needed

3. Document the new token in this file

4. Update all MFEs to use the new token (if applicable)

### Performance Considerations

- All design tokens are static and tree-shakeable
- Use `cn()` utility for efficient class merging
- Prefer CSS transitions over JavaScript animations
- Use Tailwind's responsive prefixes instead of media queries
- Keep component files under 500 lines

### Accessibility

All design tokens include:

- High contrast color ratios (WCAG AA compliant)
- Clear focus states with visible rings
- Semantic HTML structure
- Proper spacing for touch targets (minimum 48px)
- Semantic color usage (not just visual)

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 14+, Android 5+)

### Related Documentation

- **Component Library**: See individual component files in `/src/components/` for usage
- **TypeScript Types**: All design tokens are typed for IDE autocomplete
- **Tailwind Config**: Base configuration in `tailwind.config.js` at project root

### Need Help?

1. Check this documentation first - most common patterns are covered
2. Look at existing components - see how other pages use the design system
3. Check the source code - design token files have inline comments
4. Ask the team - if something is unclear or missing

### Version History

- **v2.0** (Nov 2025) - Complete design system migration with semantic colors
- **v1.5** - Added animation and state utilities
- **v1.0** - Initial design system with basic tokens

---

**Last Updated:** November 22, 2025  
**Maintainer:** Frontend Team  
**Status:** Production Ready
