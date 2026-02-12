// components/atoms/Input/Input.tsx
import { forwardRef, useId } from 'react';
import { cn } from '@/core/utils';
import type { InputProps } from './types';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, ...props }, ref) => {
    const inputId = useId();

    return (
      <div className={cn('input-wrapper', error && 'input-wrapper--error')}>
        {label && (
          <label htmlFor={inputId} className="input__label">
            {label}
          </label>
        )}
        <div className="input__container">
          {leftIcon && <span className="input__icon input__icon--left">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input',
              leftIcon && 'input--has-left-icon',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightIcon && <span className="input__icon input__icon--right">{rightIcon}</span>}
        </div>
        {error && (
          <span id={`${inputId}-error`} className="input__error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
