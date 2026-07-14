export interface RouteItem {
  id: string;
  pickup: string;
  destination: string;
  priceOneWay: number;
  priceRoundTrip: number;
  duration: string;
  enabled: boolean;
}

export interface VehicleItem {
  id: string;
  plate: string;
  model: string;
  capacity: number;
  luggageCapacity: number;
  features: string[];
  image: string;
  description: string;
  status: 'Available' | 'Reserved' | 'Under Maintenance';
  priceAdjustment: number;
}

export interface DriverItem {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  languages: string[];
  license: string;
  photo: string;
  status: 'Available' | 'On Trip' | 'Off Duty';
  rating?: number;
}

export interface TransferBooking {
  id: string;
  reference_code: string;
  full_name: string;
  email: string;
  whatsapp_number: string;
  tour_name: string;
  preferred_date: string;
  preferred_time?: string;
  number_of_guests: number;
  pickup_location: string;
  destination_location?: string;
  message?: string;
  status: string;
  created_at: string;
  vehicle_id?: string;
  driver_id?: string;
  luggage_count?: number;
  flight_number?: string;
  ferry_details?: string;
  total_price?: number;
  payment_status?: string;
  details?: any;
}
