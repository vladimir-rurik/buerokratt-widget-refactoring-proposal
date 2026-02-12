// components/atoms/Typography/types.ts
export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption';

export interface TypographyProps {
  variant?: TypographyVariant;
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}
