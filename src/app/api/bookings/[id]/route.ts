import { NextResponse } from 'next/server';
import { supabase } from '@/data/apiConfig';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const bookingId = params.id;

  if (!bookingId) {
    return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'canceled' })
    .eq('id', bookingId);

  if (error) {
    console.error('Error canceling booking:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Booking cancelled successfully' });
}
