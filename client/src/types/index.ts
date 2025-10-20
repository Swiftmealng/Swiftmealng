export interface Order {
  orderNumber: string;
  status: 'placed' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered';
  estimatedDeliveryTime: string;
  isDelayed: boolean;
  delayMinutes?: number;
  rider?: Rider;
  items?: OrderItem[];
  deliveryAddress?: Address;
}

export interface Rider {
  name: string;
  phone: string;
  photo?: string;
  currentLocation?: Location;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  area: string;
  city: string;
  coordinates: [number, number];
}

export interface Location {
  lat: number;
  lng: number;
}