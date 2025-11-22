import { forwardRef, InputHTMLAttributes } from 'react';
import { Input, InputProps } from '../Input';
import { designTokens, cn } from '../../lib/design-tokens';
import { colorMap } from '../../lib/color-system';

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  fullWidth?: boolean;
  inputProps?: Omit<InputProps, 'error' | 'fullWidth'>;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      hint,
      required,
      fullWidth = true,
      id,
      className,
      inputProps,
      ...props
    },
    ref
  ) => {
    const inputId = id || `field-${label?.replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              designTokens.typography.label,
              colorMap.text.secondary,
              'mb-1'
            )}
          >
            {label}
            {required && (
              <span className={cn(colorMap.text.danger, 'ml-1')}>*</span>
            )}
          </label>
        )}

        <Input
          ref={ref}
          id={inputId}
          error={!!error}
          success={!error && hint ? false : undefined}
          fullWidth={fullWidth}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...inputProps}
          {...props}
        />

        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className={cn(
              designTokens.typography.caption,
              colorMap.text.muted,
              'mt-1'
            )}
          >
            {hint}
          </p>
        )}

        {error && (
          <p
            id={`${inputId}-error`}
            className={cn(
              designTokens.typography.caption,
              colorMap.text.danger,
              designTokens.transitions.normal,
              'mt-1'
            )}
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
