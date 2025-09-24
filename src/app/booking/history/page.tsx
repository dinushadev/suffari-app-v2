"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookings } from "@/data/useBookings";
import { supabase } from "@/data/apiConfig"; // Import supabase
import Loader from "@/components/atoms/Loader";
import { BookingCard } from "@/components/molecules";

const BookingHistoryPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const { data: allBookingsData, isLoading, isError } = useBookings(userId || "", true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
      setLoadingSession(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loadingSession) {
    return <div className="flex justify-center items-center h-screen"><Loader /></div>;
  }

  if (!userId) {
    return <div className="container mx-auto py-8 text-center">Please log in to view your bookings.</div>;
  }

  const bookingsToDisplay = (allBookingsData?.bookings || []).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()); // Sort by date, newest first

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      {isLoading && <Loader />}
      {isError && <p className="text-red-500">Error loading bookings.</p>}
      {!isLoading && !isError && (bookingsToDisplay.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="grid gap-4">
          {bookingsToDisplay.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default BookingHistoryPage;
