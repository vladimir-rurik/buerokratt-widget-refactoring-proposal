// components/atoms/Typography/Typography.tsx
import { cn } from '@/core/utils';
import type { TypographyProps, TypographyVariant } from './types';

const variantToElement: Record<TypographyVariant, string> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  small: 'p',
  caption: 'span',
};

export function Typography({
  variant = 'body',
  children,
  className,
  as,
}: TypographyProps) {
  const Component = as ?? (variantToElement[variant] as 'p');

  return (
    <Component className={cn(`typography typography--${variant}`, className)}>
      {children}
    </Component>
  );
}
