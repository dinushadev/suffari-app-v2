import React from 'react';

interface GroupTypeOption {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  size: string; // Added group size
}

export const groupTypes: GroupTypeOption[] = [
  {
    label: 'Small',
    value: 'small',
    description: '1-2 Intimate experience, better wildlife spotting',
    icon: (
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="#DBEAFE"/><path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" /></svg>
    ),
    size: '1-2', // Added size
  },
  {
    label: 'Medium',
    value: 'medium',
    description: '3-6 Perfect for families and small groups',
    icon: (
      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="7" cy="8" r="3" stroke="currentColor" strokeWidth="2" fill="#BBF7D0"/><circle cx="17" cy="8" r="3" stroke="currentColor" strokeWidth="2" fill="#BBF7D0"/><circle cx="12" cy="14" r="4" stroke="currentColor" strokeWidth="2" fill="#BBF7D0"/></svg>
    ),
    size: '3-6', // Added size
  },
  {
    label: 'Large',
    value: 'large',
    description: '6+ Group adventures, requires multiple vehicles',
    icon: (
      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="13" width="7" height="5" rx="2" fill="#FED7AA" stroke="currentColor" strokeWidth="2"/><rect x="15" y="13" width="7" height="5" rx="2" fill="#FED7AA" stroke="currentColor" strokeWidth="2"/><rect x="7" y="7" width="10" height="7" rx="2" fill="#FDBA74" stroke="currentColor" strokeWidth="2"/></svg>
    ),
    size: '6+', // Added size
  },
];

interface GroupTypeSelectorProps {
  selected: string;
  onSelect: (value: string) => void;
}

const GroupTypeSelector: React.FC<GroupTypeSelectorProps> = ({ selected, onSelect }) => {
  const selectedOption = groupTypes.find(option => option.value === selected);

  return (
    <div className="w-full">
      <div className="flex flex-row justify-center w-full gap-2 sm:gap-4 mt-2 mb-2 select-none">
        {groupTypes.map((option) => {
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
                {option.icon}
                <span className="font-semibold text-sm sm:text-base">{option.label}</span>
              </div>
              <span className="text-xs sm:text-sm font-normal -mt-1">{option.size}</span>
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

export default GroupTypeSelector;