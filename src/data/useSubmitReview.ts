import { useMutation } from "@tanstack/react-query";
import { REVIEW_API_BASE_URL, supabase } from "./apiConfig";

export interface ReviewPayload {
  subject_type: "provider";
  subject_id: string;
  rating: number;
  review_text: string;
  reviewer_name: string;
}

export interface ReviewResponse {
  id: string;
  provider_id: string;
  rating: number;
  review_text: string;
  reviewer_name: string;
  created_at: string;
}

async function submitReview(payload: ReviewPayload): Promise<ReviewResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    const error = new Error("You need to sign in to leave a review.") as Error & {
      status?: number;
      type?: "authentication";
    };
    error.status = 401;
    error.type = "authentication";
    throw error;
  }

  const res = await fetch(`${REVIEW_API_BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : data?.error || "Failed to submit review.";
    const error = new Error(message) as Error & {
      status?: number;
      type?: "network" | "server" | "client" | "validation" | "authentication" | "authorization";
    };
    error.status = res.status;
    if (res.status === 401) error.type = "authentication";
    else if (res.status === 403) error.type = "authorization";
    else if (res.status >= 500) error.type = "server";
    else if (res.status === 400 || res.status === 422) error.type = "validation";
    else error.type = "client";
    throw error;
  }

  return data as ReviewResponse;
}

export function useSubmitReview() {
  return useMutation<ReviewResponse, Error, ReviewPayload>({
    mutationFn: submitReview,
  });
}
