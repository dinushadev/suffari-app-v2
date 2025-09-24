export interface Booking {
  id: string;
  userId: string;
  locationId: string;
  location: {
    id: string;
    name: string;
    address: string;
    description: string;
    about: string;
    images: string[];
    facilities: string[];
  };
  resourceId: string | null;
  resourceTypeId: string;
  resourceType: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
  resourceOwnerId: string | null;
  status: 'initiated' | 'confirmed' | 'canceled' | 'upcoming' | 'past'; // Broadened to include all possible statuses
  paymentAmount: string;
  schedule: {
    date: string;
    timeSlot: string;
  };
  pickupLocation: {
    placeId: string;
    coordinate: {
      lat: number;
      lng: number;
    };
    address: string;
    country: string;
  };
  group: {
    adults: number;
    children: number;
    size: number;
  };
  createdAt: string;
  updatedAt: string;
  startTime: string; // Derived property
  endTime: string; // Derived property
}
