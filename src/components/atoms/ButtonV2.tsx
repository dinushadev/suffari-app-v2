import React from 'react';
import ThreeDotLoader from './ThreeDotLoader';

interface ButtonV2Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
}

const ButtonV2: React.FC<ButtonV2Props> = ({ children, variant = 'primary', size, className = '', loading = false, ...props }) => {
  const base = 'flex items-center justify-center px-4 py-2 font-semibold focus:outline-none transition';
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };
  const sizes = {
    default: 'h-10 px-4 py-2 rounded-full text-base',
    sm: 'h-9 px-3 rounded-full text-sm',
    lg: 'h-11 px-8 rounded-full text-lg',
    icon: 'h-10 w-10 rounded-full',
  };
  const isDisabled = props.disabled || loading;

  return (
    <button
      className={
        `${base} ${sizes[(size || 'default') as keyof typeof sizes]} ${
           variants[variant]
        } ${className}`
      }
      {...props}
      disabled={isDisabled}
    >
      {loading ? <ThreeDotLoader /> : children}
    </button>
  );
};

export default ButtonV2;
