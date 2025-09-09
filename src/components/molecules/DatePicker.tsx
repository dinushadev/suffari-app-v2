import React from 'react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, min, max }) => {
  return (
    <input
      type="date"
      className="border-2 border-ash rounded-lg p-3 w-full max-w-md mx-auto focus:outline-none focus:ring-2 focus:ring-orange text-lg text-foreground placeholder-ash bg-ivory shadow-sm"
      value={value}
      onChange={e => onChange(e.target.value)}
      min={min}
      max={max}
    />
  );
};

export default DatePicker; 