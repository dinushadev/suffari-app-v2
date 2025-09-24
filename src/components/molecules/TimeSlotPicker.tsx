import React, { JSX } from 'react';

export interface TimeSlotOption {
  label: string;
  value: string;
  description: string;
}

interface TimeSlotPickerProps {
  options: TimeSlotOption[];
  selected: string;
  onSelect: (value: string) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ options, selected, onSelect }) => {
  const slotIcons: Record<string, JSX.Element> = {
    morning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
    ),
    afternoon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707.707M12 21a9 9 0 01-9-9h0c.489 0 .973-.082 1.432-.246A10.02 10.02 0 0012 3c4.97 0 9 4.03 9 9s-4.03 9-9 9z"/></svg>
    ),
    night: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
    ),
    'full-day': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    ),
  };

  const selectedOption = options.find(option => option.value === selected);
  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2 mt-2 mb-2 select-none">
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={`flex flex-col items-center justify-center p-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 focus:outline-none col-span-1
                ${isSelected
                  ? 'bg-primary border-primary shadow-md scale-[1.03] text-primary-foreground' : 'bg-card border border-border hover:bg-secondary/80 hover:border-accent hover:scale-[1.01] text-muted-foreground'}
              `}
              onClick={() => onSelect(option.value)}
              tabIndex={0}
              style={{ userSelect: 'none' }}
            >
              <div className={`flex flex-col items-center justify-center gap-1 mb-1 text-center ${isSelected ? 'text-primary-foreground' : 'text-primary'}`}>
                {slotIcons[option.value]}
                <span className={`font-semibold text-xs sm:text-sm md:text-base leading-tight`}>
                  {option.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {selectedOption && (
        <div className="w-full text-center mt-2 select-text">
          <span className="text-sm sm:text-base text-muted-foreground font-normal mt-1">{selectedOption.description}</span>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker; 