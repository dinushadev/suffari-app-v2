import React from 'react';

export interface TimeSlotOption {
  label: string;
  value: string;
}

interface TimeSlotPickerProps {
  options: TimeSlotOption[];
  selected: string;
  onSelect: (value: string) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ options, selected, onSelect }) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`px-4 py-2 rounded border border-ash transition focus:outline-none ${selected === option.value ? 'bg-orange text-foreground border-orange' : 'bg-ivory text-foreground hover:bg-background'}`}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default TimeSlotPicker; 