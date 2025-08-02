import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = 'px-4 py-2 rounded font-semibold focus:outline-none transition';
  const variants = {
    primary: 'bg-orange text-foreground hover:bg-orange-dark',
    secondary: 'bg-ash text-foreground hover:bg-ivory',
  };
  const disabledStyles = 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-400 hover:bg-gray-300';
  const isDisabled = props.disabled;
  return (
    <button
      className={
        `${base} ${
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