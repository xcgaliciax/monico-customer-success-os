import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'md' | 'sm';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-monico-blue text-white hover:bg-[#124bc4]',
  secondary: 'border border-grey-3 bg-white text-ink hover:bg-grey-1',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'h-9 px-4 text-sm',
  sm: 'h-8 px-3 text-[13px]',
};

// Minimal stand-in for the monico Design System Button (spec §17: consumed, not
// rebuilt with alternative variants). Only primary/secondary — no tertiary/ghost/
// destructive variants exist in the approved Resumen/Adopción screens.
export function Button({ variant = 'secondary', size = 'md', children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={[
        'inline-flex flex-none items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-monico-blue focus-visible:ring-offset-2',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
      ].join(' ')}
    >
      {children}
    </button>
  );
}
