import { forwardRef, InputHTMLAttributes } from 'react';
import { designTokens, componentPresets, cn } from '../../lib/design-tokens';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, success, fullWidth, type = 'text', ...props }, ref) => {
    const inputClass = error
      ? componentPresets.input.error
      : success
        ? componentPresets.input.success
        : componentPresets.input.default;

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          inputClass,
          designTokens.transitions.normal,
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
