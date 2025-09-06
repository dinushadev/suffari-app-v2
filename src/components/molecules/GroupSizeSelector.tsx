import React from 'react';

interface GroupSizeSelectorProps {
  adults: number;
  numChildren: number; // Renamed from children
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  maxAdults?: number;
  maxChildren?: number;
}

const GroupSizeSelector: React.FC<GroupSizeSelectorProps> = ({
  adults,
  numChildren, // Renamed from children
  onAdultsChange,
  onChildrenChange,
  maxAdults = 12,
  maxChildren = 12,
}) => {
  const handleIncrement = (
    value: number,
    setter: (value: number) => void,
    max: number
  ) => {
    if (value < max) {
      setter(value + 1);
    }
  };

  const handleDecrement = (
    value: number,
    setter: (value: number) => void
  ) => {
    if (value > 0) {
      setter(value - 1);
    }
  };

  const CounterInput = ({
    label,
    value,
    onChange,
    max,
    icon,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    max: number;
    icon: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between p-4 bg-ivory rounded-2xl border-2 border-ash hover:border-orange/50 transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center bg-orange/10 rounded-full">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-xs text-foreground/70">
            {label === 'Adults' ? 'Ages 13+' : 'Ages 2-12'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleDecrement(value, onChange)}
          disabled={value === 0}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-ash hover:bg-ash/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
          aria-label={`Decrease ${label.toLowerCase()} count`}
        >
          <svg
            className="w-5 h-5 text-foreground/70"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </button>
        <div className="w-12 text-center">
          <span className="text-lg font-semibold text-foreground">{value}</span>
        </div>
        <button
          type="button"
          onClick={() => handleIncrement(value, onChange, max)}
          disabled={value === max}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-orange hover:bg-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
          aria-label={`Increase ${label.toLowerCase()} count`}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );

  const totalGuests = adults + numChildren; // Updated from children

  return (
    <div className="w-full space-y-3">
      <CounterInput
        label="Adults"
        value={adults}
        onChange={onAdultsChange}
        max={maxAdults}
        icon={
          <svg
            className="w-5 h-5 text-orange"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
      />
      <CounterInput
        label="Children"
        value={numChildren} // Updated from children
        onChange={onChildrenChange}
        max={maxChildren}
        icon={
          <svg
            className="w-5 h-5 text-orange"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        }
      />
      {totalGuests > 0 && (
        <div className="mt-4 p-3 bg-orange/10 rounded-lg text-center">
          <p className="text-sm text-foreground/80">
            Total guests: <span className="font-semibold">{totalGuests}</span>
            {totalGuests > 6 && (
              <span className="block text-xs text-foreground/60 mt-1">
                Large groups may require multiple vehicles
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default GroupSizeSelector;
