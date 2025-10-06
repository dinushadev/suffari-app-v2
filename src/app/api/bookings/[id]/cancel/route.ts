import { NextResponse } from 'next/server';
import { supabase } from '@/data/apiConfig';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const bookingId = params.id;
  const { reason } = await request.json();

  if (!bookingId) {
    return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
  }

  if (!reason) {
    return NextResponse.json({ error: 'Cancellation reason is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'canceled', cancelReason: reason })
    .eq('id', bookingId);

  if (error) {
    console.error('Error canceling booking:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Booking cancelled successfully' });
}
