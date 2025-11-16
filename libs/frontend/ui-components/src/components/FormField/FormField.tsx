import { forwardRef, InputHTMLAttributes } from 'react';
import { Input, InputProps } from '../Input';
import { clsx } from 'clsx';

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
      <div className={clsx('flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <Input
          ref={ref}
          id={inputId}
          error={!!error}
          fullWidth={fullWidth}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...inputProps}
          {...props}
        />

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-gray-500">
            {hint}
          </p>
        )}

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-error-600 animate-slide-down"
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
