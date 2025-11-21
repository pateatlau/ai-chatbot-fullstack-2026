# Design System Migration Guide

## Phase 1: Foundation (Current)

This phase establishes the design system foundation and documents the approach.

### Completed

- ✅ Design tokens system (`design-tokens.ts`)
- ✅ Color system (`color-system.ts`)
- ✅ Spacing & layout system (`spacing-layout.ts`)
- ✅ Animations & states (`animations-states.ts`)
- ✅ Component presets
- ✅ `cn()` utility function
- ✅ Comprehensive documentation (`DESIGN_SYSTEM.md`)

### Next: Phase 2 - Core Component Refactoring

Priority order for refactoring existing components:

#### 1. Shell Components (Base Layer)

- [ ] `apps/shell/src/layouts/DashboardLayout.tsx` - Navigation/Layout
- [ ] `apps/shell/src/pages/DashboardPage.tsx` - Example implementation
- [ ] `apps/shell/src/pages/LoginPage.tsx` - Auth flow
- [ ] `apps/shell/src/pages/RegisterPage.tsx` - Auth flow

#### 2. Shared UI Components

- [ ] `libs/frontend/ui-components/src/components/Button.tsx` - Update to use presets
- [ ] `libs/frontend/ui-components/src/components/Card.tsx` - Update to use tokens
- [ ] `libs/frontend/ui-components/src/components/Input.tsx` - Update to use tokens
- [ ] `libs/frontend/ui-components/src/components/FormField.tsx` - Update to use tokens
- [ ] `libs/frontend/ui-components/src/components/Modal.tsx` - Update to use tokens

#### 3. Auth MFE

- [ ] Refactor all components to use design system
- [ ] Update colors and spacing
- [ ] Add consistent animations

#### 4. Chatbot MFE

- [ ] Refactor all components to use design system
- [ ] Message styling consistency
- [ ] Conversation layout patterns

#### 5. Profile MFE

- [ ] Profile page components
- [ ] Settings/preferences styling
- [ ] Security page components

#### 6. Admin MFE

- [ ] Dashboard page
- [ ] User management pages
- [ ] Analytics components

## Refactoring Checklist

When refactoring a component, follow this checklist:

### 1. Import Design System

```tsx
// ✅ New imports
import {
  designTokens,
  componentPresets,
  colorMap,
  layouts,
  animations,
  spacingSystem,
  cn,
} from '@myapp/frontend/ui-components';
```

### 2. Replace Color Values

- [ ] Replace `bg-*` classes with `colorMap.bg.*`
- [ ] Replace `text-*` classes with `colorMap.text.*` or `designTokens.textColors.*`
- [ ] Replace `border-*` classes with `colorMap.border.*`
- [ ] Replace `from-*` and `to-*` with `gradients.*`

### 3. Replace Spacing Values

- [ ] Replace `gap-*` with `designTokens.spacing.*`
- [ ] Replace `p-*` with `designTokens.padding.*`
- [ ] Replace `m-*` with `designTokens.margin.*`
- [ ] Use `layouts.gridResponsive.*` for grids

### 4. Replace Typography

- [ ] Replace hardcoded text classes with `designTokens.typography.*`
- [ ] Standardize heading levels

### 5. Add Animations/States

- [ ] Replace custom hover states with `animations.hover.*`
- [ ] Add focus states using `designTokens.states.focus`
- [ ] Replace transitions with `animations.transitions.*`

### 6. Use Component Presets

- [ ] Replace Button styling with `componentPresets.button.*`
- [ ] Replace Card styling with `componentPresets.card.*`
- [ ] Replace Input styling with `componentPresets.input.*`

### 7. Combine Classes

- [ ] Use `cn()` function to combine multiple classes
- [ ] Remove inline style concatenation

### 8. Test

- [ ] Verify responsive behavior on mobile/tablet/desktop
- [ ] Test keyboard navigation and focus states
- [ ] Check color contrast
- [ ] Verify animations performance

## Before & After Examples

### Example 1: Button Component

**Before (Manual Styling)**

```tsx
export function Button({ variant, size, children, ...props }) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border border-gray-300 text-gray-900 hover:bg-gray-50',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

**After (Using Design Tokens)**

```tsx
import {
  designTokens,
  componentPresets,
  cn,
} from '@myapp/frontend/ui-components';

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) {
  const variantClass = designTokens.buttonVariants[variant];
  const sizeClass = designTokens.buttonSizes[size];

  return (
    <button
      className={cn(designTokens.buttonBase, variantClass, sizeClass)}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Example 2: Card Component

**Before**

```tsx
export function Card({ children, interactive = false }) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${
        interactive
          ? 'cursor-pointer hover:shadow-lg hover:border-blue-300'
          : ''
      } transition-all`}
    >
      {children}
    </div>
  );
}
```

**After**

```tsx
import { componentPresets, cn } from '@myapp/frontend/ui-components';

export function Card({ children, interactive = false }) {
  return (
    <div
      className={cn(
        componentPresets.card.default,
        interactive && componentPresets.card.interactive
      )}
    >
      {children}
    </div>
  );
}
```

### Example 3: Page Layout

**Before**

```tsx
export function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Content */}
      </div>
    </div>
  );
}
```

**After**

```tsx
import { layouts, designTokens, cn } from '@myapp/frontend/ui-components';

export function DashboardPage() {
  return (
    <div className={cn(layouts.container, designTokens.spacing.lg)}>
      <div className={layouts.gridResponsive['4Col']}>{/* Content */}</div>
    </div>
  );
}
```

## Common Patterns to Update

### Pattern 1: Hero Section

```tsx
// OLD
<div className="bg-linear-to-r from-blue-600 to-blue-700 p-8 text-white">

// NEW
import { gradients, designTokens, cn } from '@myapp/frontend/ui-components';
<div className={cn(gradients.primary, designTokens.padding.xl, 'text-white')}>
```

### Pattern 2: Stat Card

```tsx
// OLD
<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md">

// NEW
import { componentPresets } from '@myapp/frontend/ui-components';
<div className={componentPresets.card.default}>
```

### Pattern 3: Form Input

```tsx
// OLD
<input className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500">

// NEW
import { designTokens } from '@myapp/frontend/ui-components';
<input className={cn(designTokens.inputBase, designTokens.states.focus)}>
```

### Pattern 4: Responsive Grid

```tsx
// OLD
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

// NEW
import { layouts } from '@myapp/frontend/ui-components';
<div className={layouts.gridResponsive['3Col']}>
```

## Implementation Strategy

### Week 1: Foundation & Core Components

- Day 1-2: Deploy design system (COMPLETED)
- Day 3-4: Refactor shell components (DashboardLayout, DashboardPage)
- Day 5: Refactor UI component library (Button, Card, Input, FormField, Modal)

### Week 2: MFE Refactoring

- Day 1: Auth MFE
- Day 2: Chatbot MFE
- Day 3: Profile MFE
- Day 4: Admin MFE
- Day 5: QA and polish

### Week 3: Testing & Documentation

- Day 1-2: E2E testing with new design system
- Day 3-4: Visual regression testing
- Day 5: Documentation updates

## Rollback Plan

If issues arise:

1. Revert only the affected file (not the entire design system)
2. Keep design system modules as-is
3. Gradually re-apply the change with fixes

## Validation Checklist

After refactoring each component:

- [ ] All text is readable (WCAG AA color contrast)
- [ ] Hover states work and are visible
- [ ] Focus states are clear
- [ ] Mobile layout is responsive
- [ ] No console errors or warnings
- [ ] Animations are smooth (no jank)
- [ ] Touch targets are at least 44x44px
- [ ] Loading/disabled states are clear
- [ ] All interactions work on keyboard
- [ ] Design matches design system visuals

## Documentation Updates

Update these files as new patterns emerge:

1. `DESIGN_SYSTEM.md` - Core patterns and usage
2. This migration guide - Progress tracking
3. Individual component READMEs - Component-specific guidelines
4. `libs/frontend/ui-components/README.md` - Library overview

## Questions & Support

When refactoring:

1. Check `DESIGN_SYSTEM.md` for the pattern
2. Look at similar components already refactored
3. Use the Before & After examples as templates
4. Test on mobile devices

## Success Metrics

- ✅ All components use design tokens (0 arbitrary classes)
- ✅ Consistent spacing across all MFEs
- ✅ Consistent colors across all MFEs
- ✅ All animations use animation tokens
- ✅ 100% accessibility compliance
- ✅ 0 console warnings about style conflicts
