import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import React from "react";
/* eslint-disable @next/next/no-img-element */
import { Booking } from "@/types/booking";
import { ButtonV2 } from "@/components/atoms";
import { useRouter } from 'next/navigation';
import { formatInTimezone, getTimezoneAbbreviation } from '@/lib/timezoneUtils';
import { cn } from '@/lib/utils';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  StarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  MapPinIcon,
  BanknotesIcon,
  ClockIcon,
  TruckIcon,
  IdentificationIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

interface BookingCardProps {
  booking: Booking;
}

const statusConfig: Record<string, {
  border: string;
  bg: string;
  badge: string;
  label: string;
}> = {
  initiated: {
    border: "border-l-4 border-yellow-500 dark:border-yellow-600",
    bg: "",
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    label: "Initiated",
  },
  confirmed: {
    border: "border-l-4 border-blue-500 dark:border-blue-600",
    bg: "",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    label: "Paid",
  },
  fulfilled: {
    border: "border-l-4 border-green-500 dark:border-green-600",
    bg: "",
    badge: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    label: "Confirmed",
  },
  canceled: {
    border: "border-l-4 border-red-500 dark:border-red-600",
    bg: "",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    label: "Canceled",
  },
  upcoming: {
    border: "border-l-4 border-blue-500 dark:border-blue-600",
    bg: "",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    label: "Upcoming",
  },
  past: {
    border: "border-l-4 border-muted",
    bg: "bg-muted/20",
    badge: "bg-muted text-muted-foreground",
    label: "Past",
  },
};

function isValidImageUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  if (url.startsWith("/")) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const defaultStatusConfig = {
  border: "border-l-4 border-border",
  bg: "bg-muted/10",
  badge: "bg-muted text-foreground",
  label: "Unknown",
};

export const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const router = useRouter();
  const [loadingState, setLoadingState] = React.useState<Record<string, boolean>>({});

  const now = new Date();
  const bookingTime = new Date(booking.startTime);
  const bookingCreationTime = new Date(booking.createdAt);

  const timeUntilBooking =
    (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const timeSinceBookingCreation =
    (now.getTime() - bookingCreationTime.getTime()) / (1000 * 60);
  const isSameDayTrip = bookingTime.toDateString() === now.toDateString();

  let canCancel = false;
  if (
    booking.status === "confirmed" ||
    booking.status === "fulfilled" ||
    booking.status === "upcoming" ||
    booking.status === "initiated"
  ) {
    if (timeUntilBooking > 24) {
      canCancel = true;
    } else if (isSameDayTrip && timeSinceBookingCreation <= 5) {
      canCancel = true;
    } else if (booking.vendorCanceled) {
      canCancel = true;
    }
  }

  const bookingTimezone = booking.schedule?.timezone || 'Asia/Colombo';

  const isPastBooking =
    booking.status === "past" || new Date(booking.endTime).getTime() < now.getTime();

  const startMs = new Date(booking.startTime).getTime();
  const endMs = new Date(booking.endTime).getTime();
  const nowMs = now.getTime();
  const isOngoing = nowMs >= startMs && nowMs <= endMs;
  const showMessage = (isOngoing || isPastBooking) && booking.status !== "canceled";

  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  const isSameDate = startDate.toDateString() === endDate.toDateString();

  let formattedDateTime: string;
  if (isSameDate) {
    const formattedStartTime = formatInTimezone(
      booking.startTime, bookingTimezone, 'EEE, MMM d, yyyy h:mm a'
    );
    const formattedEndTime = formatInTimezone(
      booking.endTime, bookingTimezone, 'h:mm a'
    );
    formattedDateTime = `${formattedStartTime} - ${formattedEndTime}`;
  } else {
    const formattedStartDate = formatInTimezone(
      booking.startTime, bookingTimezone, 'EEE, MMM d, yyyy'
    );
    const formattedEndDate = formatInTimezone(
      booking.endTime, bookingTimezone, 'EEE, MMM d, yyyy'
    );
    formattedDateTime = `${formattedStartDate} - ${formattedEndDate}`;
  }

  const timezoneAbbr = getTimezoneAbbreviation(bookingTimezone, new Date(booking.startTime));

  const handleAction = async (actionId: string, path: string) => {
    if (loadingState[actionId]) return;
    setLoadingState(prev => ({ ...prev, [actionId]: true }));
    try {
      await router.push(path);
    } catch (error) {
      console.error(`Action ${actionId} failed:`, error);
      setLoadingState(prev => ({ ...prev, [actionId]: false }));
    }
  };

  const status = statusConfig[booking.status] || defaultStatusConfig;
  const locationImage = booking.location?.images?.[0] || "";
  const hasImage = isValidImageUrl(locationImage);

  const currency = booking.resourceType?.currency || "USD";
  const formattedPayment = booking.paymentAmount
    ? new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(booking.paymentAmount))
    : null;

  return (
    <Card
      className={cn(
        "mb-4 min-w-0 overflow-hidden transition-all duration-300 hover:shadow-lg",
        status.border,
        status.bg,
      )}
    >
      <div className={cn("flex flex-col", hasImage ? "sm:flex-row" : "")}>
        {/* Image section */}
        {hasImage ? (
          <div className="relative h-44 w-full sm:h-auto sm:w-48 md:w-56 shrink-0 overflow-hidden">
            <img
              src={locationImage}
              alt={booking.location?.name || "Location"}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/10" />
          </div>
        ) : (
          <div className="h-3 w-full sm:hidden bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-t-lg" />
        )}

        {/* Content section */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Header: title + status badge */}
          <CardContent className="pb-0 pt-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold leading-snug truncate">
                  {booking.resourceType?.name || "N/A"}
                </h3>
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {booking.location?.name || "N/A"}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize tracking-wide",
                  status.badge,
                )}
              >
                {status.label}
              </span>
            </div>
          </CardContent>

          {/* Grouped metadata */}
          <CardContent className="pb-0 pt-4 space-y-4">
            {/* Trip details */}
            <MetaGroup label="Trip">
              <MetaRow icon={CalendarDaysIcon} label={`${formattedDateTime} ${timezoneAbbr}`} />
              <MetaRow
                icon={UserGroupIcon}
                label={`${booking.group.adults} Adult${booking.group.adults !== 1 ? "s" : ""}${booking.group.children > 0 ? `, ${booking.group.children} Child${booking.group.children !== 1 ? "ren" : ""}` : ""}`}
              />
              <MetaRow icon={MapPinIcon} label={booking.pickupLocation.address} />
            </MetaGroup>

            {/* Vehicle & driver -- only when resource exists */}
            {booking.resource && (booking.resource.name || booking.resource.plateNumber || booking.resource.drivers?.[0]) && (
              <MetaGroup label="Vehicle & Driver">
                {booking.resource.name && (
                  <MetaRow icon={TruckIcon} label={booking.resource.name} />
                )}
                {booking.resource.plateNumber && (
                  <MetaRow icon={IdentificationIcon} label={booking.resource.plateNumber} />
                )}
                {booking.resource.drivers?.[0] && (
                  <MetaRow
                    icon={UserIcon}
                    label={`${booking.resource.drivers[0].firstName} ${booking.resource.drivers[0].lastName}`}
                  />
                )}
              </MetaGroup>
            )}

            {/* Payment & booking info */}
            <MetaGroup label="Payment">
              {formattedPayment && (
                <MetaRow icon={BanknotesIcon} label={formattedPayment} />
              )}
              <MetaRow
                icon={ClockIcon}
                label={`Booked ${formatInTimezone(booking.createdAt, bookingTimezone, 'MMM d, yyyy')}`}
                muted
              />
            </MetaGroup>
          </CardContent>

          {/* Action bar */}
          {booking.status !== "canceled" && (
            <CardFooter className="flex flex-wrap gap-2 border-t border-border/50 mt-4 pt-4 px-6 pb-5">
              {showMessage && (
                <ButtonV2
                  onClick={() => handleAction('message', `/booking/${booking.id}/message`)}
                  loading={loadingState['message']}
                  variant="primary"
                  size="sm"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1.5" />
                  Message host
                </ButtonV2>
              )}
              {!isPastBooking && (
                <ButtonV2
                  onClick={() => handleAction('cancel', `/booking/cancel/${booking.id}`)}
                  loading={loadingState['cancel']}
                  disabled={!canCancel || loadingState['cancel']}
                  variant="destructive"
                  size="sm"
                >
                  <XMarkIcon className="w-4 h-4 mr-1.5" />
                  Cancel booking
                </ButtonV2>
              )}
              {isPastBooking && (
                <ButtonV2
                  onClick={() => handleAction('review', `/review?order_id=${encodeURIComponent(booking.id)}&return=${encodeURIComponent("/booking/history")}`)}
                  loading={loadingState['review']}
                  variant="primary"
                  size="sm"
                >
                  <StarIcon className="w-4 h-4 mr-1.5" />
                  Write a review
                </ButtonV2>
              )}
            </CardFooter>
          )}
        </div>
      </div>
    </Card>
  );
};

function MetaGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
        {label}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
        {children}
      </div>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  muted = false,
}: {
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement> & { title?: string; titleId?: string }>;
  label: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", muted ? "text-muted-foreground/60" : "text-muted-foreground")} />
      <span className={cn("text-sm leading-snug truncate", muted ? "text-muted-foreground/80" : "text-foreground")}>
        {label}
      </span>
    </div>
  );
}
