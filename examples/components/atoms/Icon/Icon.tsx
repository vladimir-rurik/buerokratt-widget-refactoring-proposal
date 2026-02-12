// components/atoms/Icon/Icon.tsx
import { cn } from '@/core/utils';
import type { IconProps } from './types';

export function Icon({ name, size = 24, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg
      className={cn('icon', `icon--${size}`, className)}
      aria-hidden={ariaHidden}
      focusable="false"
    >
      <use href={`#icon-${name}`} />
    </svg>
  );
}
