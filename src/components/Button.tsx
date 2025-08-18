import { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

interface ButtonProps extends BaseButtonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  href?: never;
}

interface LinkButtonProps extends BaseButtonProps {
  href: string;
  onClick?: never;
  type?: never;
  disabled?: boolean;
}

const getVariantClasses = (variant: ButtonVariant) => {
  const variants = {
    primary: 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500 shadow-md hover:shadow-lg',
    secondary: 'bg-rose-100 text-rose-700 hover:bg-rose-200 focus:ring-rose-300',
    outline: 'border-2 border-rose-500 text-rose-600 hover:bg-rose-50 focus:ring-rose-300',
    ghost: 'text-rose-600 hover:bg-rose-50 focus:ring-rose-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-md hover:shadow-lg'
  };
  return variants[variant];
};

const getSizeClasses = (size: ButtonSize) => {
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  return sizes[size];
};

const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  href,
  disabled,
  ...props
}: ButtonProps | LinkButtonProps) {
  const classes = `
    ${baseClasses}
    ${getVariantClasses(variant)}
    ${getSizeClasses(size)}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (href) {
    return (
      <Link 
        href={href}
        className={classes}
        {...(disabled && { 
          onClick: (e) => e.preventDefault(),
          'aria-disabled': true 
        })}
      >
        {children}
      </Link>
    );
  }

  return (
    <button 
      className={classes}
      disabled={disabled}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}

// 圖示按鈕元件
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: ReactNode;
  'aria-label': string;
}

export function IconButton({ 
  icon, 
  variant = 'ghost', 
  size = 'md', 
  className = '',
  ...props 
}: IconButtonProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12'
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${iconSizes[size]} p-0 ${className}`}
      {...props}
    >
      {icon}
    </Button>
  );
}