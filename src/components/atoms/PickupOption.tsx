import React from 'react';

interface PickupOptionProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  value: string;
  className?: string;
}

const PickupOption: React.FC<PickupOptionProps> = ({ icon, label, description, checked, onChange, value, className = '' }) => {
  return (
    <label className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer border-2 transition-colors min-w-0 w-full ${checked ? 'border-orange bg-orange/10' : 'border-ash bg-background hover:border-orange'} ${className}`}
      style={{ minWidth: 0 }}
    >
      <span className="w-7 h-7 flex items-center justify-center">{icon}</span>
      <span className="flex flex-col min-w-0 flex-1 w-full text-left">
        <span className="text-base font-medium text-foreground truncate">{label}</span>
        {description && <span className="text-xs text-foreground/60 mt-1 whitespace-normal break-words">{description}</span>}
      </span>
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        value={value}
        className="accent-orange ml-2"
        name="pickup-mode"
        style={{ minWidth: 0 }}
      />
    </label>
  );
};

export default PickupOption;