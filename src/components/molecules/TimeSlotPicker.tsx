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

const slotIcons: Record<string, JSX.Element> = {
  morning: (
    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="#FDE68A"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 6.95l-1.414-1.414M6.464 6.464L5.05 5.05m12.02 0l-1.414 1.414M6.464 17.536l-1.414 1.414"/></svg>
  ),
  evening: (
    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="16" r="5" stroke="currentColor" strokeWidth="2" fill="#FDBA74"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2m0 18v2m11-11h-2M3 16H1m16.95 6.95l-1.414-1.414M6.464 10.464L5.05 9.05m12.02 0l-1.414 1.414M6.464 21.536l-1.414 1.414"/></svg>
  ),
  fullday: (
    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" fill="#FACC15"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 6.95l-1.414-1.414M6.464 6.464L5.05 5.05m12.02 0l-1.414 1.414M6.464 17.536l-1.414 1.414"/></svg>
  ),
};

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ options, selected, onSelect }) => {
  const selectedOption = options.find(option => option.value === selected);
  return (
    <div className="w-full">
      <div className="flex flex-row justify-center w-full gap-2 sm:gap-4 mt-2 mb-2 select-none">
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={`flex flex-col items-center justify-center px-3 sm:px-5 py-2 sm:py-3 rounded-t-xl transition-all duration-200 focus:outline-none min-w-[90px] sm:min-w-[120px] max-w-xs
                ${isSelected
                  ? 'border border-orange ring-2 ring-orange/30 scale-[1.03]' : 'hover:border border-orange hover:scale-[1.01]'}
              `}
              onClick={() => onSelect(option.value)}
              tabIndex={0}
              style={{ userSelect: 'none' }}
            >
              <div className="flex items-center gap-1 mb-1">
                {slotIcons[option.value]}
                <span className="font-semibold text-sm sm:text-base">{option.label}</span>
              </div>
            </button>
          );
        })}
      </div>
      {selectedOption && (
        <div className="w-full text-center mt-2 select-text">
          <span className="text-sm sm:text-base text-foreground/80">{selectedOption.description}</span>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker; 