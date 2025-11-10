export interface Booking {
  id: string;
  userId: string;
  locationId: string;
  resourceTypeId: string;
  resourceType: { id: string; name: string; description: string; category: string };
  location: { id: string; name: string; address: string; description: string; about: string; images: string[]; facilities: string[]; };
  resourceId: string | null;
  resourceOwnerId: string | null;
  status: 'initiated' | 'confirmed' | 'canceled' | 'upcoming' | 'past'; // Broadened to include all possible statuses
  paymentAmount: string;
  schedule: { 
    date?: string; 
    timeSlot?: string;
    startDateTime?: string;
    endDateTime?: string;
    timezone?: string; // IANA timezone identifier (e.g., 'Asia/Colombo')
  };
  pickupLocation: { placeId: string; coordinate: { lat: number; lng: number }; address: string; country: string };
  group: { adults: number; children: number; size: number };
  createdAt: string;
  updatedAt: string;
  startTime: string; // Derived property
  endTime: string; // Derived property
  creationTime: string; // Add creationTime
  vendorCanceled: boolean; // Add vendorCanceled
  customer: {
    name: string;
    email: string;
    phone: string | null;
    sessionId: string;
  };
}
