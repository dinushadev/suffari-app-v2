"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/data/apiConfig";
import { useAssociateBooking } from "@/data/useAssociateBooking";
import { useOtpSend } from "@/data/useOtpSend";
import { useSearchParams } from "next/navigation";
import { generateSessionId } from "@/lib/utils";
import { useMergeGuestSession } from "@/data/useMergeGuestSession";
import { FullScreenLoader } from "@/components/atoms";
// Client-side component for checking pending booking
function PendingBookingNotice() {
  const [hasPendingBooking, setHasPendingBooking] = useState(false);

  useEffect(() => {
    // Check for pending booking data in client-side only
    const hasPending =
      typeof window !== "undefined" &&
      (localStorage.getItem("pendingBookingData") ||
        localStorage.getItem("pendingBooking"));

    setHasPendingBooking(!!hasPending);
  }, []);

  if (!hasPendingBooking) return null;

  return (
    <p className="text-center text-foreground font-medium mb-6">
      Please sign in to complete your booking.
    </p>
  );
}

function AuthPageContent() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [oauthLoading, setOauthLoading] = useState({
    google: false,
    facebook: false,
  });
  const router = useRouter();
  //const associateBooking = useAssociateBooking();
  const [otpSendLoading, setOtpSendLoading] = useState(false);
  const mergeGuestSessionMutation = useMergeGuestSession();

  // React Query hooks for OTP operations
  // const otpSendMutation = useOtpSend();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  useEffect(() => {
    const handleSessionAndMerge = async () => {
      console.log("handleSessionAndMerge ... called");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const guestSessionId =
        typeof window !== "undefined"
          ? localStorage.getItem("raahi_session_id")
          : null;

      if (session?.user?.id) {
        // User is logged in
        if (guestSessionId) {
          // Attempt to merge guest data if a guest session exists
          try {
            await mergeGuestSessionMutation.mutateAsync({
              userId: session.user.id,
              email: session.user.email,
              fullName: session.user.user_metadata?.full_name,
              sessionId: guestSessionId,
            });

            localStorage.removeItem("raahi_session_id");
            console.log("Guest session merged successfully!");
          } catch (err) {
            console.error("Error merging guest session:", err);
            setError((err as Error).message || "Failed to merge guest session");
          }
        }

        // Handle pending booking association
        const pendingDataStr = localStorage.getItem("pendingBookingData");
        if (pendingDataStr) {
          const pendingData = JSON.parse(pendingDataStr);
          const bookingId = pendingData.bookingId;
          try {
            //   await associateBooking.mutateAsync({ bookingId, userId: session.user.id });
            localStorage.removeItem("pendingBookingData");
            router.push(returnUrl);
          } catch (err) {
            setError((err as Error).message || "Failed to associate booking");
          }
        } else {
          router.push(returnUrl);
        }
      }
    };

    handleSessionAndMerge();
  }, [returnUrl]);

  const handleOAuth = async (provider: "google" | "facebook") => {
    setOauthLoading((prev) => ({ ...prev, [provider]: true }));
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth?returnUrl=${returnUrl}`,
      },
    });
    setOauthLoading((prev) => ({ ...prev, [provider]: false }));
    if (error) {
      setError(error.message);
    }
    // On success, Supabase will redirect automatically
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // await otpSendMutation.mutateAsync({ email });
      setOtpSendLoading(true);
      //  await otpSendMutation.mutateAsync({ email });
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          // set this to false if you do not want the user to be automatically signed up
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}${returnUrl}`,
        },
      });
      // After sending magic link, user will receive an email and then be redirected back to /auth
      // No need for OTP input on this page anymore.
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setOtpSendLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-background p-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2 drop-shadow-sm text-center">
        RAAHI
      </h1>
      <p className="mb-8 text-lg sm:text-xl text-foreground font-medium text-center max-w-xl drop-shadow-sm flex items-center justify-center gap-2">
        Conscious Travel
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-flame w-4 h-4 text-primary hover:text-foreground transition-colors duration-300 cursor-pointer"
          aria-hidden="true"
        >
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
        </svg>
        Responsible Tourism
      </p>
      <PendingBookingNotice />
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          className="flex items-center justify-center gap-2 w-full border border-gray-300 py-2 rounded font-semibold bg-white text-black hover:bg-gray-50 disabled:opacity-50"
          disabled={oauthLoading.google}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_17_40)">
              <path
                d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29H37.1C36.5 32.1 34.5 34.7 31.7 36.4V42H39.3C44 38 47.5 31.9 47.5 24.5Z"
                fill="#4285F4"
              />
              <path
                d="M24 48C30.6 48 36.2 45.9 39.3 42L31.7 36.4C30 37.5 27.7 38.3 24 38.3C17.7 38.3 12.3 34.2 10.4 28.7H2.5V34.4C5.6 41.1 13.1 48 24 48Z"
                fill="#34A853"
              />
              <path
                d="M10.4 28.7C9.9 27.6 9.6 26.4 9.6 25.1C9.6 23.8 9.9 22.6 10.4 21.5V15.8H2.5C0.8 19.1 0 22.9 0 25.1C0 27.3 0.8 31.1 2.5 34.4L10.4 28.7Z"
                fill="#FBBC05"
              />
              <path
                d="M24 9.7C27.7 9.7 30.3 11.1 31.6 12.2L39.4 5.1C36.2 2.2 30.6 0 24 0C13.1 0 5.6 6.9 2.5 13.6L10.4 19.3C12.3 13.8 17.7 9.7 24 9.7Z"
                fill="#EA4335"
              />
            </g>
            <defs>
              <clipPath id="clip0_17_40">
                <rect width="48" height="48" fill="white" />
              </clipPath>
            </defs>
          </svg>
          {oauthLoading.google ? "Redirecting..." : "Continue with Google"}
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("facebook")}
          className="flex items-center justify-center gap-2 w-full border border-gray-300 py-2 rounded font-semibold bg-white text-black hover:bg-gray-50 disabled:opacity-50"
          disabled={oauthLoading.facebook}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 16.9913 5.65686 21.1283 10.4375 21.8785V14.8906H7.89844V12H10.4375V9.79688C10.4375 7.29063 11.9304 5.90625 14.2146 5.90625C15.3084 5.90625 16.4531 6.10156 16.4531 6.10156V8.5625H15.1921C13.9499 8.5625 13.5625 9.33334 13.5625 10.1242V12H16.3359L15.8926 14.8906H13.5625V21.8785C18.3431 21.1283 22 16.9913 22 12Z"
              fill="#1877F2"
            />
          </svg>
          {oauthLoading.facebook ? "Redirecting..." : "Continue with Facebook"}
        </button>
        <div className="relative flex py-5 items-center w-full">
          <div className="flex-grow border-t border-muted"></div>
          <span className="flex-shrink mx-4 text-muted">OR</span>
          <div className="flex-grow border-t border-muted"></div>
        </div>
        <p className="text-center text-lg font-semibold text-foreground ">
          Email Magic Link
        </p>
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4 w-full">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded bg-foreground"
            required
          />
          <button
            type="submit"
            className="bg-background text-foreground py-2 rounded font-semibold disabled:opacity-50"
            disabled={otpSendLoading}
          >
            {otpSendLoading ? "Sending Magic Link..." : "Continue with Email"}
          </button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </form>
      </div>
    </main>
  );
}
export default function AuthPage() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background p-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-orange mb-2 drop-shadow-sm text-center">RAAHI</h1>
      <p className="mb-8 text-lg sm:text-xl text-foreground font-medium text-center max-w-xl drop-shadow-sm flex items-center justify-center gap-2">
        Conscious Travel
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flame w-4 h-4 text-[#E6D7C3] hover:text-[#D4C5A9] transition-colors duration-300 cursor-pointer" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
        Responsible Tourism
      </p>
      <div className="flex flex-col flex-grow w-full items-center justify-center">
        <Suspense fallback={<FullScreenLoader />}>
          <AuthPageContent />
        </Suspense>
      </div>
    </main>
  );
}
