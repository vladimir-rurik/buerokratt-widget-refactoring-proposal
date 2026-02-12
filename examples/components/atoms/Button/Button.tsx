// components/atoms/Button/Button.tsx
import { forwardRef } from 'react';
import { cn } from '@/core/utils';
import type { ButtonProps } from './types';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'btn',
          `btn--${variant}`,
          `btn--${size}`,
          isLoading && 'btn--loading',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <span className="btn__spinner" aria-hidden="true" />}
        {leftIcon && <span className="btn__icon btn__icon--left">{leftIcon}</span>}
        <span className="btn__content">{children}</span>
        {rightIcon && <span className="btn__icon btn__icon--right">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
