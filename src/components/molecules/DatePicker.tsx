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
      className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={e => onChange(e.target.value)}
      min={min}
      max={max}
    />
  );
};

export default DatePicker; 