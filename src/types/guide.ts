export interface GuideAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface GuideBio {
  firstName: string;
  lastName: string;
  preferredName?: string;
  gender?: string;
  birthDate?: string;
  description?: string;
}

export interface GuideLicense {
  licenseNumber: string;
  type: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string;
  frontImageUrl?: string;
  backImageUrl?: string;
}

export interface GuideResourceType {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  numberOfGuests?: number;
  imageUrl?: string | null;
}

export interface Guide {
  id: string;
  speaking_languages: string[];
  expertise: string[];
  profileImage: string | null;
  available: boolean;
  bookings?: unknown[];
  contactDetails: {
    email: string;
    phone: string;
    whatsapp?: string;
  };
  address: GuideAddress;
  bio: GuideBio;
  license: GuideLicense;
  resourceType: GuideResourceType;
  resourceTypeId: string;
  images: string[];
  created_at: string;
  updated_at: string;
}
