export interface GuideAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface GuideUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  otherName?: string | null;
  phone: string;
  nic: string;
  profileImage: string | null;
  deviceToken: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuideBio {
  gender: string;
  birthDate: string;
  description: string;
  // Legacy fields for backward compatibility
  firstName?: string;
  lastName?: string;
  preferredName?: string;
}

export interface GuideLicense {
  type: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string;
  licenseNumber: string;
  frontImageUrl?: string | null;
  backImageUrl?: string | null;
}

export interface GuideResourceTypeFeature {
  id: string;
  title: string;
  description: string;
}

export interface GuideResourceType {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string | null;
  price: number;
  featureList: GuideResourceTypeFeature[];
  numberOfGuests: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  locations: unknown[];
}

export interface GuidePricing {
  type: "hourly" | "daily";
  amount: number;
  currency: string;
}

export interface Guide {
  id: string;
  user: GuideUser;
  speakingLanguages: string[];
  expertise: string[];
  contactDetails: {
    facebook: string;
    whatsapp: string;
    instagram: string;
  };
  address?: GuideAddress;
  bio: GuideBio;
  license: GuideLicense;
  profileImage: string | null;
  images: string[] | null;
  available: boolean;
  yearsOfExperience: number;
  rates: GuidePricing[];
  bookings: unknown[];
  resourceTypeId: string;
  resourceType: GuideResourceType;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  speaking_languages?: string[];
  pricing?: GuidePricing[];
  created_at?: string;
  updated_at?: string;
}
