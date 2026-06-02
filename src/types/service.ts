export interface ServiceItem {
  location_service_key: string;
  service_description: string;
  location_code: string;
  location_name: string;
  location_type: string;
}

export interface ServiceCategory {
  category_key: string;
  category_name: string;
  services: ServiceItem[];
}

export interface ServicesResponse {
  selected_location: {
    location_code: string;
    name: string;
    type: string;
  };
  categories: ServiceCategory[];
}
