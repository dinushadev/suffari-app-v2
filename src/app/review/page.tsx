"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StarRatingInput } from "@/components/molecules";
import { ButtonV2, ErrorDisplay } from "@/components/atoms";
import { useSubmitReview } from "@/data/useSubmitReview";
import { useBookingDetails } from "@/data/useBookingDetails";
import { supabase } from "@/data/apiConfig";
import { cn } from "@/lib/utils";

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id") ?? searchParams.get("orderId") ?? "";
  const providerIdFallback = searchParams.get("provider_id") ?? "";
  const returnTo = searchParams.get("return") ?? "/";

  const {
    data: booking,
    isLoading: bookingLoading,
    isError: bookingError,
  } = useBookingDetails(orderId.trim());

  const providerId = (() => {
    if (orderId.trim() && booking) {
      return booking.locationId ?? booking.location?.id ?? "";
    }
    return providerIdFallback.trim();
  })();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [user, setUser] = useState<{ id: string; user_metadata?: { full_name?: string }; email?: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const submitReview = useSubmitReview();

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const name =
          session.user.user_metadata?.full_name ??
          session.user.user_metadata?.name ??
          session.user.email ??
          "";
        setReviewerName((prev) => (prev === "" ? name : prev));
      }
      setAuthChecked(true);
    };
    loadSession();
  }, []);

  const isFormValid =
    rating >= 1 && rating <= 5 && reviewText.trim().length > 0 && reviewerName.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerId) return;
    if (!isFormValid) return;
    if (!user) {
      router.push("/auth");
      return;
    }
    submitReview.mutate(
      {
        subject_type: "provider",
        subject_id: providerId,
        rating,
        review_text: reviewText.trim(),
        reviewer_name: reviewerName.trim(),
      },
      {
        onSuccess: () => {
          setTimeout(() => router.push(returnTo), 1500);
        },
      }
    );
  };

  const showOrderLoading = orderId.trim() && (bookingLoading || (!booking && !bookingError));
  const showOrderError = orderId.trim() && bookingError;
  const noValidContext = !providerId && authChecked && !showOrderLoading;

  if (!authChecked || showOrderLoading) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-foreground font-medium">Loading...</p>
      </main>
    );
  }

  if (showOrderError || noValidContext) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-lg rounded-2xl border border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Leave a review</CardTitle>
            <CardDescription>
              {orderId.trim() && bookingError
                ? "Invalid or missing order. Please open this page from your booking or a location."
                : "Please open this page from a location or guide so we know who you're reviewing."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-4 py-2 font-semibold hover:bg-primary/90 transition"
            >
              Back to home
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-lg mt-4 sm:mt-8">
        <Card className="rounded-2xl border border-border shadow-md overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl text-foreground">Leave a review</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your feedback helps others and improves our community.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {!user && (
              <div className="mb-6 p-4 rounded-lg border border-border bg-card text-card-foreground">
                <p className="text-sm font-medium text-foreground mb-2">
                  Sign in to leave a review
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  You need to be signed in to submit a review.
                </p>
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition"
                >
                  Sign in
                </Link>
              </div>
            )}

            {submitReview.error && (
              <div className="mb-6">
                <ErrorDisplay
                  error={submitReview.error}
                  onSignIn={() => router.push("/auth")}
                  onRetry={() => submitReview.reset()}
                  dismissible
                />
              </div>
            )}

            {submitReview.isSuccess && (
              <div className="mb-6 p-4 rounded-lg border border-border bg-accent/20 text-foreground">
                <p className="text-sm font-medium">Thank you! Your review has been submitted.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Redirecting you back...
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-foreground mb-2">
                  Rating
                </label>
                <StarRatingInput
                  value={rating}
                  onChange={setRating}
                  disabled={!user || submitReview.isPending}
                  aria-label="Rating 1 to 5 stars"
                />
                {rating === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">Select 1–5 stars</p>
                )}
              </div>

              <div>
                <label htmlFor="review_text" className="block text-sm font-medium text-foreground mb-2">
                  Your review
                </label>
                <textarea
                  id="review_text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  disabled={!user || submitReview.isPending}
                  placeholder="Share your experience..."
                  rows={4}
                  className={cn(
                    "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                  )}
                />
              </div>

              <div>
                <label htmlFor="reviewer_name" className="block text-sm font-medium text-foreground mb-2">
                  Your name
                </label>
                <Input
                  id="reviewer_name"
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  disabled={!user || submitReview.isPending}
                  placeholder="Your name"
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-3">
                <ButtonV2
                  type="submit"
                  disabled={!user || !isFormValid || submitReview.isPending}
                  loading={submitReview.isPending}
                  className="w-full rounded-xl py-3 text-base"
                >
                  Submit review
                </ButtonV2>
                <Link
                  href={returnTo}
                  className="text-center text-sm text-muted-foreground hover:text-foreground transition"
                >
                  Cancel and go back
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
