import { NextResponse } from 'next/server';
import { supabase } from '@/data/apiConfig';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  let query = supabase
    .from('bookings') // Assuming you have a 'bookings' table in Supabase
    .select('id, resourceName, locationName, startTime, endTime, status') // Select relevant fields
    .eq('userId', userId);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data });
}

