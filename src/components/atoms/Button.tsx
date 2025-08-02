import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = 'px-4 py-2 rounded font-semibold focus:outline-none transition border border-ash';
  const variants = {
    primary: 'bg-secondary text-foreground hover:bg-orange-dark',
    secondary: 'bg-ash text-foreground hover:bg-ivory',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;