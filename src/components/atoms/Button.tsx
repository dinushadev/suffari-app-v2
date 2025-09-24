import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size, className = '', ...props }) => {
  const base = 'flex items-center justify-center px-4 py-2 font-semibold focus:outline-none transition';
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };
  const sizes = {
    default: 'h-10 px-4 py-2 rounded-full text-base',
    sm: 'h-9 px-3 rounded-full text-sm',
    lg: 'h-11 px-8 rounded-full text-lg',
    icon: 'h-10 w-10 rounded-full',
  };
  const disabledStyles = 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted';
  const isDisabled = props.disabled;
  return (
    <button
      className={
        `${base} ${sizes[(size || 'default') as keyof typeof sizes]} ${
          isDisabled
            ? disabledStyles
            : variants[variant]
        } ${className}`
      }
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;