import { FC, ReactNode } from 'react';
import { clsx } from 'clsx';

export interface CardProps {
  children: ReactNode;
  title?: string;
  footer?: ReactNode;
  variant?: 'default' | 'bordered' | 'elevated';
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
  const variantStyles = {
    default: 'bg-white',
    bordered: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
  };

  return (
    <div
      className={clsx(
        'rounded-lg overflow-hidden',
        variantStyles[variant],
        className
      )}
    >
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className="px-6 py-4">{children}</div>

      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.displayName = 'Card';
