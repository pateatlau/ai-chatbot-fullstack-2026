import { FC, ReactNode } from 'react';
import { designTokens, componentPresets, cn } from '../../lib/design-tokens';
import { colorMap } from '../../lib/color-system';

export interface CardProps {
  children: ReactNode;
  title?: string;
  footer?: ReactNode;
  variant?: 'default' | 'interactive' | 'elevated';
  className?: string;
  headerAction?: ReactNode;
}

export const Card: FC<CardProps> = ({
  children,
  title,
  footer,
  variant = 'default',
  className,
  headerAction,
}) => {
  const variantClass = {
    default: componentPresets.card.default,
    interactive: componentPresets.card.interactive,
    elevated: componentPresets.card.elevated,
  }[variant];

  return (
    <div className={cn('rounded-lg overflow-hidden', variantClass, className)}>
      {(title || headerAction) && (
        <div
          className={cn(
            'px-6 py-4 border-b',
            colorMap.border.default,
            'flex items-center justify-between'
          )}
        >
          {title && (
            <h3
              className={cn(designTokens.typography.h5, colorMap.text.primary)}
            >
              {title}
            </h3>
          )}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className={cn('px-6 py-4', 'text-gray-900')}>{children}</div>

      {footer && (
        <div
          className={cn(
            'px-6 py-4',
            colorMap.bg.secondary,
            'border-t',
            colorMap.border.default
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

Card.displayName = 'Card';
