import React from 'react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, min, max }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <input
        type="date"
        className="appearance-none border-2 border-ash rounded-lg p-3 w-full h-12 text-lg text-foreground placeholder-ash bg-ivory shadow-sm focus:outline-none focus:ring-2 focus:ring-orange"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min}
        max={max}
      />
    </div>
  );
};

export default DatePicker; 