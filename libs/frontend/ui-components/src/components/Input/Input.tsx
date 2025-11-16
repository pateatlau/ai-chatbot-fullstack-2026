import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, fullWidth, type = 'text', ...props }, ref) => {
    const baseStyles =
      'px-3 py-2 border rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-gray-100 disabled:cursor-not-allowed';

    const normalStyles =
      'border-gray-300 focus:border-primary-500 focus:ring-primary-500';
    const errorStyles =
      'border-error-500 focus:border-error-500 focus:ring-error-500';

    return (
      <input
        ref={ref}
        type={type}
        className={clsx(
          baseStyles,
          error ? errorStyles : normalStyles,
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
