import { NextResponse } from "next/server";
import { supabase } from "@/data/apiConfig";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REVIEW_TEXT_MAX_LENGTH = 2000;
const REVIEWER_NAME_MAX_LENGTH = 200;

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  if (!token) {
    return NextResponse.json(
      { error: "Authorization required", message: "Missing or invalid Authorization header." },
      { status: 401 }
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Invalid or expired token." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON", message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Validation error", message: "Body must be an object." },
      { status: 400 }
    );
  }

  const {
    subject_type,
    subject_id,
    rating,
    review_text,
    reviewer_name,
  } = body as Record<string, unknown>;

  if (subject_type !== "provider") {
    return NextResponse.json(
      { error: "Validation error", message: "subject_type must be \"provider\"." },
      { status: 400 }
    );
  }

  if (typeof subject_id !== "string" || !UUID_REGEX.test(subject_id)) {
    return NextResponse.json(
      { error: "Validation error", message: "subject_id must be a valid UUID." },
      { status: 400 }
    );
  }

  const provider_id = subject_id;

  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "Validation error", message: "rating must be an integer between 1 and 5." },
      { status: 400 }
    );
  }

  if (typeof review_text !== "string" || review_text.trim().length === 0) {
    return NextResponse.json(
      { error: "Validation error", message: "review_text is required and cannot be empty." },
      { status: 400 }
    );
  }

  if (review_text.length > REVIEW_TEXT_MAX_LENGTH) {
    return NextResponse.json(
      {
        error: "Validation error",
        message: `review_text must be at most ${REVIEW_TEXT_MAX_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  if (typeof reviewer_name !== "string" || reviewer_name.trim().length === 0) {
    return NextResponse.json(
      { error: "Validation error", message: "reviewer_name is required and cannot be empty." },
      { status: 400 }
    );
  }

  if (reviewer_name.length > REVIEWER_NAME_MAX_LENGTH) {
    return NextResponse.json(
      {
        error: "Validation error",
        message: `reviewer_name must be at most ${REVIEWER_NAME_MAX_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  const row = {
    provider_id,
    rating,
    review_text: review_text.trim(),
    reviewer_name: reviewer_name.trim(),
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("reviews")
    .insert(row)
    .select("id, provider_id, rating, review_text, reviewer_name, created_at")
    .single();

  if (error) {
    console.error("Error inserting review:", error);
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
