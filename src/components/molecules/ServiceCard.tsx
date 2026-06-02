"use client";

import {
  TruckIcon,
  GlobeAltIcon,
  SunIcon,
  BeakerIcon,
  UserGroupIcon,
  MusicalNoteIcon,
  SparklesIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import type { ServiceItem } from "@/types/service";

const CATEGORY_GRADIENTS: Record<string, string> = {
  DRIVERS_AND_CHAUFFEURS: "from-slate-600 via-slate-700 to-slate-900",
  TOUR_GUIDES: "from-amber-400 via-orange-500 to-orange-700",
  OUTDOOR_ADVENTURE: "from-emerald-400 via-green-600 to-green-800",
  WATER_FISHING: "from-cyan-400 via-blue-500 to-blue-800",
  LOCAL_HELPERS: "from-violet-400 via-violet-600 to-purple-800",
  EVENT_HOSTS: "from-rose-400 via-rose-600 to-pink-800",
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  DRIVERS_AND_CHAUFFEURS: TruckIcon,
  TOUR_GUIDES: GlobeAltIcon,
  OUTDOOR_ADVENTURE: SunIcon,
  WATER_FISHING: BeakerIcon,
  LOCAL_HELPERS: UserGroupIcon,
  EVENT_HOSTS: MusicalNoteIcon,
};

interface ServiceCardProps {
  service: ServiceItem;
  categoryKey: string;
  index: number;
}

export function ServiceCard({ service, categoryKey, index }: ServiceCardProps) {
  const gradient = CATEGORY_GRADIENTS[categoryKey] ?? "from-primary via-primary/80 to-primary/60";
  const Icon = CATEGORY_ICONS[categoryKey] ?? SparklesIcon;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl cursor-pointer animate-fadeInUp shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

      {/* Decorative large icon */}
      <div className="absolute bottom-0 right-0 translate-x-4 translate-y-4 pointer-events-none">
        <Icon className="w-36 h-36 text-white/10 group-hover:text-white/15 transition-colors duration-500" />
      </div>

      {/* Shimmer overlay on hover */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 rounded-2xl" />

      {/* Card content */}
      <div className="relative z-10 flex flex-col h-full min-h-[220px] p-5">
        {/* Top: small icon badge */}
        <div className="flex items-start justify-between mb-auto">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Bottom: info */}
        <div className="mt-8">
          <p className="text-white font-bold text-base leading-snug line-clamp-2 mb-3 drop-shadow-sm">
            {service.service_description}
          </p>

          <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium">
            <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{service.location_name}</span>
            <span className="text-white/50">·</span>
            <span className="text-white/60 capitalize">
              {service.location_type.toLowerCase().replace("_", " ")}
            </span>
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors duration-150 backdrop-blur-sm rounded-full px-3.5 py-1.5">
            <span className="text-white text-xs font-semibold tracking-wide">Explore</span>
            <span className="text-white/70 text-xs">→</span>
          </div>
        </div>
      </div>

      {/* Hover lift — applied via parent wrapper */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-300" />
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="rounded-2xl bg-muted animate-pulse h-[220px]" />
  );
}
