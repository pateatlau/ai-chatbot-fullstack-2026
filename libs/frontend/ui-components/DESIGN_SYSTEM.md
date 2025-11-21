# Design System & Component Library

## Overview

This document outlines the unified design system that ensures consistent styling and UI/UX across all MFEs (Micro Front-ends) in the application. All styling must use design tokens and component presets from this system.

## Core Principles

1. **Single Source of Truth**: All design values defined in `@myapp/frontend/ui-components`
2. **Composability**: Use design tokens to compose styles, not ad-hoc Tailwind classes
3. **Consistency**: Every UI element across all MFEs uses the same design tokens
4. **Accessibility**: Built-in focus states, ARIA support, and semantic HTML
5. **Responsiveness**: Mobile-first design with predefined breakpoints
6. **Performance**: Optimized animations and transitions

## Design Tokens

Design tokens are the foundation of the design system. Located in `src/lib/design-tokens.ts`:

### Colors

```typescript
import { designTokens } from '@myapp/frontend/ui-components';

// Primary color palette
designTokens.colors.primary[50 - 900]; // bg-primary-*
designTokens.colors.success; // bg-green-*
designTokens.colors.warning; // bg-yellow-*
designTokens.colors.danger; // bg-red-*
designTokens.colors.neutral; // bg-gray-*
```

### Spacing

```typescript
// Use these instead of arbitrary gaps/padding
designTokens.spacing.xs; // gap-1 (4px)
designTokens.spacing.sm; // gap-2 (8px)
designTokens.spacing.md; // gap-3 (12px)
designTokens.spacing.lg; // gap-4 (16px)
designTokens.spacing.xl; // gap-6 (24px)

designTokens.padding.xs; // p-2
designTokens.padding.md; // p-4
designTokens.padding.lg; // p-6
```

### Typography

```typescript
// Predefined text scales
designTokens.typography.h1;
designTokens.typography.h2;
designTokens.typography.h3;
designTokens.typography.body;
designTokens.typography.bodySmall;
designTokens.typography.label;
```

### Border Radius

```typescript
designTokens.borderRadius.sm; // rounded-sm
designTokens.borderRadius.md; // rounded-md
designTokens.borderRadius.lg; // rounded-lg
designTokens.borderRadius.full; // rounded-full
```

### Shadows

```typescript
designTokens.shadows.sm; // shadow-sm
designTokens.shadows.md; // shadow
designTokens.shadows.lg; // shadow-lg
```

### Transitions

```typescript
designTokens.transitions.fast; // 150ms
designTokens.transitions.normal; // 300ms
designTokens.transitions.slow; // 500ms
```

## Color System

Located in `src/lib/color-system.ts`:

### Semantic Colors

```typescript
import { colorMap, iconColors, gradients } from '@myapp/frontend/ui-components';

// Use semantic names instead of direct colors
colorMap.bg.primary; // Primary background
colorMap.text.secondary; // Secondary text
colorMap.border.interactive; // Interactive borders

// Icon colors
iconColors.primary; // text-primary-600
iconColors.success; // text-green-600
iconColors.danger; // text-red-600

// Gradients
gradients.primary; // bg-linear-to-br from-primary-600...
gradients.subtle; // bg-linear-to-r from-primary-50...
```

## Spacing & Layout

Located in `src/lib/spacing-layout.ts`:

### Responsive Grids

```typescript
import { layouts } from '@myapp/frontend/ui-components';

layouts.gridResponsive['2Col']; // 1 col mobile, 2 col desktop
layouts.gridResponsive['3Col']; // 1 col mobile, 2 col tablet, 3 col desktop
layouts.gridResponsive['4Col']; // responsive 4-column grid
```

### Common Patterns

```typescript
layouts.vStack; // Vertical stack with gap-3
layouts.hStack; // Horizontal stack with center alignment
layouts.centerContent; // Flex center
layouts.centerBetween; // Flex space-between centered
```

### Responsive Utilities

```typescript
responsive.hideOnMobile; // hidden md:block
responsive.hideOnDesktop; // md:hidden
responsive.fullOnMobile; // w-full md:w-auto
responsive.stackOnMobile; // flex-col md:flex-row
```

## Animations & States

Located in `src/lib/animations-states.ts`:

### Interactive Animations

```typescript
import { animations } from '@myapp/frontend/ui-components';

animations.hover.scaleUp; // Hover scale animation
animations.hover.shadowUp; // Hover shadow animation
animations.active.scale; // Active state scale
animations.focus.ring; // Focus ring styling
```

### Predefined State Patterns

```typescript
import { statePatterns } from '@myapp/frontend/ui-components';

statePatterns.interactiveButton; // Complete button interaction states
statePatterns.interactiveCard; // Card hover + active states
statePatterns.focusableInput; // Input focus ring pattern
```

## Component Presets

Pre-composed combinations for common UI patterns:

```typescript
import { componentPresets } from '@myapp/frontend/ui-components';

// Button presets
componentPresets.button.primary; // Primary button with interactions
componentPresets.button.secondary; // Secondary button
componentPresets.button.outline; // Outline button

// Card presets
componentPresets.card.default; // Standard card with hover
componentPresets.card.interactive; // Clickable card with scale
componentPresets.card.elevated; // Card with more shadow

// Input presets
componentPresets.input.default; // Standard input
componentPresets.input.error; // Error state input
componentPresets.input.success; // Success state input
```

## Usage Guidelines

### ✅ DO: Use Design Tokens

```tsx
// CORRECT
import { designTokens, cn } from '@myapp/frontend/ui-components';

export function MyComponent() {
  return (
    <div
      className={cn(
        'bg-white',
        designTokens.padding.lg,
        designTokens.shadows.md
      )}
    >
      <h2 className={designTokens.typography.h2}>Title</h2>
      <p className={designTokens.typography.body}>Description</p>
    </div>
  );
}
```

### ❌ DON'T: Use Arbitrary Tailwind Classes

```tsx
// INCORRECT
export function MyComponent() {
  return (
    <div className="bg-white p-6 shadow">
      <h2 className="text-2xl font-bold">Title</h2>
      <p className="text-base leading-relaxed">Description</p>
    </div>
  );
}
```

### ✅ DO: Use Semantic Colors

```tsx
// CORRECT
import { colorMap } from '@myapp/frontend/ui-components';

<div className={colorMap.bg.primary}>
  <p className={colorMap.text.secondary}>Text</p>
</div>;
```

### ❌ DON'T: Use Raw Color Values

```tsx
// INCORRECT
<div className="bg-blue-50">
  <p className="text-gray-600">Text</p>
</div>
```

### ✅ DO: Use Layout Presets

```tsx
// CORRECT
import { layouts } from '@myapp/frontend/ui-components';

<div className={layouts.gridResponsive['3Col']}>
  {items.map((item) => (
    <Card key={item.id}>{item}</Card>
  ))}
</div>;
```

### ❌ DON'T: Create Custom Grid Classes

```tsx
// INCORRECT
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map((item) => (
    <Card key={item.id}>{item}</Card>
  ))}
</div>
```

## Common Implementation Patterns

### Hero Section

```tsx
import {
  designTokens,
  gradients,
  layouts,
} from '@myapp/frontend/ui-components';
import { cn } from '@myapp/frontend/ui-components';

export function HeroSection() {
  return (
    <div className={cn(gradients.primary, designTokens.padding.xl)}>
      <div className={layouts.container}>
        <h1 className={cn(designTokens.typography.h1, 'text-white')}>
          Welcome
        </h1>
      </div>
    </div>
  );
}
```

### Responsive Card Grid

```tsx
import {
  layouts,
  designTokens,
  animations,
} from '@myapp/frontend/ui-components';
import { cn } from '@myapp/frontend/ui-components';

export function CardGrid() {
  return (
    <div
      className={cn(layouts.gridResponsive['3Col'], designTokens.spacing.lg)}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            componentPresets.card.interactive,
            animations.transitions.normal
          )}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
```

### Button Group

```tsx
import { animations, statePatterns } from '@myapp/frontend/ui-components';
import { designTokens, cn } from '@myapp/frontend/ui-components';

export function ButtonGroup() {
  return (
    <div className={designTokens.spacing.md}>
      <button
        className={cn(
          statePatterns.interactiveButton,
          designTokens.buttonVariants.primary
        )}
      >
        Primary
      </button>
      <button
        className={cn(
          statePatterns.interactiveButton,
          designTokens.buttonVariants.secondary
        )}
      >
        Secondary
      </button>
    </div>
  );
}
```

### Form Input

```tsx
import { designTokens, animations } from '@myapp/frontend/ui-components';
import { cn } from '@myapp/frontend/ui-components';

export function FormInput() {
  return (
    <input
      type="text"
      className={cn(
        designTokens.inputBase,
        animations.transitions.normal,
        designTokens.states.focus
      )}
      placeholder="Enter value..."
    />
  );
}
```

## Implementing in MFEs

All MFEs should follow these steps:

1. **Import Design System** at the top of each component file:

   ```tsx
   import {
     designTokens,
     componentPresets,
     colorMap,
     layouts,
     cn,
   } from '@myapp/frontend/ui-components';
   ```

2. **Replace All Inline Styles** with design tokens and presets

3. **Use the `cn()` Function** to combine multiple classes:

   ```tsx
   className={cn(
     designTokens.padding.lg,
     designTokens.shadows.md,
     colorMap.bg.primary
   )}
   ```

4. **Follow Naming Patterns** for consistency across all MFEs

## Extending the Design System

To add new design tokens or patterns:

1. **Update the appropriate file** in `src/lib/`:
   - Colors → `color-system.ts`
   - Spacing/Layout → `spacing-layout.ts`
   - Animations/States → `animations-states.ts`
   - Generic tokens → `design-tokens.ts`

2. **Export** from the module

3. **Add to index.ts** if it's a new module

4. **Document** the new pattern in this file

5. **Update all MFEs** to use the new token

## Performance Considerations

- All design tokens are static and tree-shakeable
- Use `cn()` utility for efficient class merging
- Prefer CSS transitions over JavaScript animations
- Use Tailwind's responsive prefixes (not media queries)
- Keep component files under 500 lines

## Accessibility

All design tokens include:

- High contrast color ratios (WCAG AA compliant)
- Clear focus states with visible rings
- Semantic HTML structure
- Proper spacing for touch targets (48px minimum)
- Semantic color usage (not just visual)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 14+, Android 5+)
