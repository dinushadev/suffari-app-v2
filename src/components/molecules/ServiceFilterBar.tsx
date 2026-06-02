"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  TruckIcon,
  GlobeAltIcon,
  SunIcon,
  BeakerIcon,
  UserGroupIcon,
  MusicalNoteIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import type { ServiceCategory } from "@/types/service";

const LOCATIONS = [
  { code: "US", label: "United States", flag: "🇺🇸", sub: "Country" },
  // { code: "GB", label: "United Kingdom", flag: "🇬🇧", sub: "Country" },
  // { code: "AU", label: "Australia",      flag: "🇦🇺", sub: "Country" },
  // { code: "CA", label: "Canada",         flag: "🇨🇦", sub: "Country" },
  // { code: "IN", label: "India",          flag: "🇮🇳", sub: "Country" },
  // { code: "DE", label: "Germany",        flag: "🇩🇪", sub: "Country" },
  // { code: "FR", label: "France",         flag: "🇫🇷", sub: "Country" },
  // { code: "JP", label: "Japan",          flag: "🇯🇵", sub: "Country" },
  { code: "LK", label: "Sri Lanka",      flag: "🇱🇰", sub: "Country" },
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  DRIVERS_AND_CHAUFFEURS: TruckIcon,
  TOUR_GUIDES: GlobeAltIcon,
  OUTDOOR_ADVENTURE: SunIcon,
  WATER_FISHING: BeakerIcon,
  LOCAL_HELPERS: UserGroupIcon,
  EVENT_HOSTS: MusicalNoteIcon,
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const QUICK_CHIPS = ["Today", "Tomorrow", "This Weekend", "Next Week"];

const TIME_SLOTS = [
  { key: "Morning",   emoji: "🌅", range: "6am–12pm" },
  { key: "Afternoon", emoji: "☀️",  range: "12–5pm"  },
  { key: "Evening",   emoji: "🌙", range: "5pm+"     },
  { key: "All Day",   emoji: "🗓️", range: "Any"      },
];

const SPRING = "cubic-bezier(.34,1.56,.64,1)";

interface ServiceFilterBarProps {
  countryCode: string;
  onCountryChange: (code: string, label: string) => void;
  selectedDate: string;
  selectedTime: string;
  onDateTimeChange: (date: string, time: string) => void;
  categories: ServiceCategory[];
  selectedCategoryKey: string;
  onCategoryChange: (key: string) => void;
  onSearch: () => void;
}

export default function ServiceFilterBar({
  countryCode,
  onCountryChange,
  selectedDate,
  selectedTime,
  onDateTimeChange,
  categories,
  selectedCategoryKey,
  onCategoryChange,
  onSearch,
}: ServiceFilterBarProps) {
  const [activePanel, setActivePanel] = useState<"loc" | "dt" | "cat" | null>(null);
  const [locSearch, setLocSearch] = useState("");
  const [locLabel, setLocLabel] = useState(() => {
    const found = LOCATIONS.find((l) => l.code === countryCode);
    return found ? `${found.flag} ${found.label}` : "";
  });

  // Calendar state
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selDay, setSelDay] = useState<number | null>(null);
  const [selChip, setSelChip] = useState<string | null>(null);
  const [selTime, setSelTime] = useState<string | null>(null);
  const [dateChosen, setDateChosen] = useState(false);

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync locLabel when countryCode prop changes externally
  useEffect(() => {
    const found = LOCATIONS.find((l) => l.code === countryCode);
    if (found) setLocLabel(`${found.flag} ${found.label}`);
  }, [countryCode]);

  // Sync date/time display back from props
  useEffect(() => {
    if (selectedDate && selectedTime) {
      setDateChosen(true);
    }
  }, [selectedDate, selectedTime]);

  const focused = activePanel !== null;

  function toggle(panel: "loc" | "dt" | "cat") {
    setActivePanel((prev) => (prev === panel ? null : panel));
    if (panel !== "loc") setLocSearch("");
  }

  function closeAll() {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setActivePanel(null);
    setLocSearch("");
  }

  // Location
  const filteredLocations = useMemo(
    () =>
      LOCATIONS.filter(
        (l) =>
          !locSearch ||
          l.label.toLowerCase().includes(locSearch.toLowerCase()) ||
          l.sub.toLowerCase().includes(locSearch.toLowerCase())
      ),
    [locSearch]
  );

  function pickLoc(code: string, label: string, flag: string) {
    const display = `${flag} ${label}`;
    setLocLabel(display);
    onCountryChange(code, label);
    closeAll();
  }

  // Calendar
  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  }

  const calDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    return { firstDay, daysInMonth };
  }, [calYear, calMonth]);

  function isPastDay(d: number) {
    const dt = new Date(calYear, calMonth, d);
    const t = new Date(); t.setHours(0,0,0,0);
    return dt < t;
  }

  function pickDay(d: number) {
    setSelDay(d);
    setSelChip(null);
    setDateChosen(true);
  }

  function pickChip(chip: string) {
    setSelChip(chip);
    setSelDay(null);
    setDateChosen(true);
  }

  function pickTime(slot: string) {
    if (!dateChosen) return;
    setSelTime(slot);
    const dateStr = selChip ?? `${SHORT_MONTHS[calMonth]} ${selDay}`;
    onDateTimeChange(dateStr, slot);
    closeTimeoutRef.current = setTimeout(closeAll, 340);
  }

  // Display values
  const dtDisplayVal = useMemo(() => {
    if (selectedDate && selectedTime) return `${selectedDate} · ${selectedTime}`;
    return "Add date & time";
  }, [selectedDate, selectedTime]);

  const catDisplayVal = useMemo(() => {
    if (!selectedCategoryKey) return "All services";
    const cat = categories.find((c) => c.category_key === selectedCategoryKey);
    return cat?.category_name ?? "All services";
  }, [selectedCategoryKey, categories]);

  // Dropdown visibility helper
  const dropStyle = (open: boolean): React.CSSProperties => ({
    opacity: open ? 1 : 0,
    transform: open ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.97)",
    pointerEvents: open ? "all" : "none",
    transitionProperty: "opacity, transform",
    transitionDuration: "280ms",
    transitionTimingFunction: open ? SPRING : "ease-in",
  });

  return (
    <div className="relative inline-block">
      {/* Invisible click-away overlay */}
      {focused && (
        <div
          className="fixed inset-0 z-[35]"
          onClick={closeAll}
        />
      )}

      {/* Pill bar */}
      <div
        className="relative z-40 inline-flex items-stretch bg-white rounded-full border border-border overflow-visible"
        style={{
          boxShadow: focused
            ? "0 8px 40px rgba(0,0,0,0.22)"
            : "0 2px 16px rgba(0,0,0,0.09)",
          transform: focused ? "scale(1.03)" : "scale(1)",
          transition: `transform 350ms ${SPRING}, box-shadow 250ms ease`,
        }}
      >
        {/* Where */}
        <button
          onClick={() => toggle("loc")}
          className={`flex flex-col justify-center px-6 py-3 min-w-[148px] border-r border-border rounded-l-full transition-all duration-200 ${
            activePanel === "loc"
              ? "bg-background rounded-full z-10"
              : activePanel !== null
              ? "opacity-40 hover:opacity-70 hover:bg-muted/40"
              : "hover:bg-muted/40"
          }`}
        >
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-foreground">
            Where
          </span>
          <span
            className={`text-[13px] mt-0.5 transition-colors duration-200 ${
              locLabel ? "text-foreground font-semibold" : "text-muted-foreground"
            }`}
          >
            {locLabel || "Any location"}
          </span>
        </button>

        {/* Date & Time */}
        <button
          onClick={() => toggle("dt")}
          className={`flex flex-col justify-center px-6 py-3 min-w-[148px] border-r border-border transition-all duration-200 ${
            activePanel === "dt"
              ? "bg-background rounded-full z-10"
              : activePanel !== null
              ? "opacity-40 hover:opacity-70 hover:bg-muted/40"
              : "hover:bg-muted/40"
          }`}
        >
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-foreground">
            Date &amp; Time
          </span>
          <span
            className={`text-[13px] mt-0.5 transition-colors duration-200 ${
              selectedDate ? "text-foreground font-semibold" : "text-muted-foreground"
            }`}
          >
            {dtDisplayVal}
          </span>
        </button>

        {/* Category */}
        <button
          onClick={() => toggle("cat")}
          className={`flex flex-col justify-center px-6 py-3 min-w-[148px] transition-all duration-200 ${
            activePanel === "cat"
              ? "bg-background rounded-full z-10"
              : activePanel !== null
              ? "opacity-40 hover:opacity-70 hover:bg-muted/40"
              : "hover:bg-muted/40"
          }`}
        >
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-foreground">
            Category
          </span>
          <span
            className={`text-[13px] mt-0.5 transition-colors duration-200 ${
              selectedCategoryKey ? "text-foreground font-semibold" : "text-muted-foreground"
            }`}
          >
            {catDisplayVal}
          </span>
        </button>

        {/* Search button */}
        <button
          onClick={() => { onSearch(); closeAll(); }}
          className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 active:scale-95 rounded-full transition-all duration-200 my-1.5 mr-1.5"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
            <MagnifyingGlassIcon className="w-4 h-4 text-white" />
          </span>
          <span className="text-white text-[13px] font-bold">Search</span>
        </button>
      </div>

      {/* ── Location dropdown ── */}
      <div
        className="absolute top-[calc(100%+14px)] left-0 w-96 bg-card rounded-3xl border border-border p-6 z-50"
        style={{
          ...dropStyle(activePanel === "loc"),
          boxShadow: "0 20px 70px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-foreground mb-4">
          Where to?
        </p>
        <div className="flex items-center gap-2.5 border-2 border-primary rounded-2xl px-4 py-3 bg-primary/5 mb-3 focus-within:shadow-[0_0_0_4px_rgba(192,83,58,0.14)] transition-shadow">
          <MagnifyingGlassIcon className="w-4 h-4 text-primary flex-shrink-0" />
          <input
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            placeholder="Search country, state, city…"
            value={locSearch}
            onChange={(e) => setLocSearch(e.target.value)}
          />
        </div>
        <div className="space-y-0.5">
          {filteredLocations.map((loc) => (
            <button
              key={loc.code}
              onClick={() => pickLoc(loc.code, loc.label, loc.flag)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 hover:translate-x-0.5 transition-all duration-150 text-left"
            >
              <span className="text-2xl">{loc.flag}</span>
              <div>
                <p className="text-[13px] font-semibold text-foreground">{loc.label}</p>
                <p className="text-[11px] text-muted-foreground">{loc.sub}</p>
              </div>
            </button>
          ))}
          {filteredLocations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No results</p>
          )}
        </div>
      </div>

      {/* ── Date & Time dropdown ── */}
      <div
        className="absolute top-[calc(100%+14px)] left-36 w-[400px] bg-card rounded-3xl border border-border p-6 z-50"
        style={{
          ...dropStyle(activePanel === "dt"),
          boxShadow: "0 20px 70px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-foreground mb-3">
          When &amp; What time?
        </p>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`flex items-center gap-1.5 text-[11px] font-semibold transition-all duration-300 ${
              dateChosen ? "text-green-500" : "text-primary scale-105"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                dateChosen ? "bg-green-500" : "bg-primary"
              } transition-colors duration-300`}
            />
            Pick a date
          </div>
          <div className="w-5 h-px bg-border" />
          <div
            className={`flex items-center gap-1.5 text-[11px] font-semibold transition-all duration-300 ${
              dateChosen ? "text-primary scale-105" : "text-muted-foreground"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                dateChosen ? "bg-primary" : "bg-muted-foreground"
              }`}
            />
            Pick a time
          </div>
        </div>

        {/* Quick chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => pickChip(chip)}
              className={`border-[1.5px] rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                selChip === chip
                  ? "border-primary text-primary bg-primary/5 -translate-y-0.5 shadow-md"
                  : "border-border text-foreground"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Calendar */}
        <div className="mb-1">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-all duration-150 hover:scale-110"
            >
              <ChevronLeftIcon className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-[13px] font-bold text-foreground">
              {MONTH_NAMES[calMonth]} {calYear}
            </span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-all duration-150 hover:scale-110"
            >
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-[10px] font-bold text-muted-foreground py-1">
                {d}
              </div>
            ))}
            {Array.from({ length: calDays.firstDay }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: calDays.daysInMonth }, (_, i) => i + 1).map((d) => {
              const past = isPastDay(d);
              const selected = selDay === d && selChip === null;
              return (
                <button
                  key={d}
                  onClick={() => !past && pickDay(d)}
                  disabled={past}
                  className={`text-xs py-1.5 rounded-full transition-all duration-150 ${
                    past
                      ? "text-muted-foreground/40 cursor-not-allowed"
                      : selected
                      ? "bg-primary text-white font-bold scale-110 shadow-[0_4px_14px_rgba(192,83,58,0.35)]"
                      : "text-foreground hover:bg-muted hover:scale-110"
                  }`}
                  style={selected ? { transitionTimingFunction: SPRING } : undefined}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        <div
          className="border-t border-border pt-4 mt-2"
          style={{
            opacity: dateChosen ? 1 : 0.3,
            pointerEvents: dateChosen ? "all" : "none",
            transform: dateChosen ? "translateY(0)" : "translateY(6px)",
            transition: `opacity 350ms ${SPRING}, transform 350ms ${SPRING}`,
          }}
        >
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-2.5">
            Now pick a time
          </p>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.key}
                onClick={() => pickTime(slot.key)}
                className={`border-[1.5px] rounded-2xl py-3 px-1 text-center transition-all duration-200 ${
                  selTime === slot.key
                    ? "border-primary bg-primary/5 -translate-y-0.5 shadow-[0_6px_16px_rgba(192,83,58,0.2)]"
                    : "border-border hover:border-muted-foreground hover:-translate-y-0.5 hover:shadow-md"
                }`}
                style={{ transitionTimingFunction: SPRING }}
              >
                <div className="text-xl mb-1">{slot.emoji}</div>
                <div
                  className={`text-[10px] font-bold ${
                    selTime === slot.key ? "text-primary" : "text-foreground"
                  }`}
                >
                  {slot.key}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">{slot.range}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category dropdown ── */}
      <div
        className="absolute top-[calc(100%+14px)] left-[296px] w-[360px] bg-card rounded-3xl border border-border p-6 z-50"
        style={{
          ...dropStyle(activePanel === "cat"),
          boxShadow: "0 20px 70px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-foreground mb-4">
          Service type
        </p>
        <div className="grid grid-cols-2 gap-2">
          {/* All row */}
          <button
            onClick={() => { onCategoryChange(""); setTimeout(closeAll, 240); }}
            className={`col-span-2 flex items-center gap-3 border-[1.5px] rounded-2xl px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 ${
              !selectedCategoryKey
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-muted/40"
            }`}
          >
            <SparklesIcon className="w-5 h-5 flex-shrink-0" />
            <span className="text-[13px] font-semibold">All Services</span>
          </button>

          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.category_key] ?? SparklesIcon;
            const isActive = cat.category_key === selectedCategoryKey;
            return (
              <button
                key={cat.category_key}
                onClick={() => { onCategoryChange(cat.category_key); setTimeout(closeAll, 240); }}
                className={`flex items-center gap-2.5 border-[1.5px] rounded-2xl px-3 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  isActive
                    ? "border-primary bg-primary/5 -translate-y-0.5 shadow-[0_4px_16px_rgba(192,83,58,0.15)]"
                    : "border-border hover:border-muted-foreground hover:bg-muted/30"
                }`}
                style={{ transitionTimingFunction: SPRING }}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? "text-primary" : "text-foreground"
                  }`}
                />
                <span
                  className={`text-[12px] font-semibold ${
                    isActive ? "text-primary" : "text-foreground"
                  }`}
                >
                  {cat.category_name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
