export interface CartService {
  id: string;
  serviceId: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  person_name?: string;
  requiresBooking: boolean;
  bookingId?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  product_category: ProductType[];
}

export interface ProductType {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  discount_price: number;
  slug: string;
  sku?: string;
  product_image: string;
  visible?: boolean;
  menu_variation?: VariationType[];
  product_gallery?: ProductGalleryType[];
}

export interface VariationType {
  id: number;
  item: string;
  name: string;
  value_type: "radio" | "checkbox";
  required: boolean;
  menu_variation_info: MenuVariationType[];
}
export interface MenuVariationType {
  menu_variation_info: any;
  id: number;
  value: string;
  extra_price: number;
}

export interface ProductGalleryType {
  id: number;
  image: string;
}

export interface OrderItemData {
  item: number;
  quantity: number;
  item_variations: number[];
  notes?: string;
  person_name?: string;
  person_phone?: string;
  is_paid?: boolean;
  paid_amount?: number;
}
export interface OrderServiceData {
  service: number;
  quantity: number;
  notes?: string;
  person_name?: string;
  person_phone?: string;
  is_paid?: boolean;
  paid_amount?: number;
  booking_id?: number;
}

export interface OrderData {
  customer_name: string;
  customer_phone?: string;
  table_id?: number;
  tax_enabled: boolean;

  items?: OrderItemData[];
  order_services?: OrderServiceData[];
}

// New types for services
export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image?: string;
  is_active: boolean;
  services: Service[];
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_minutes: number;
  image?: string;
  requires_booking: boolean;

  category: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface ServiceBooking {
  id: number;
  service: Service;
  customer_name: string;
  customer_phone: string;
  scheduled_time: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  notes: string;
  created_at: string;
}

export interface ServiceCartItem {
  id: string;
  serviceId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  slug: string;
  requiresBooking: boolean;
  booking?: {
    scheduledTime: string;
    customerName: string;
    customerPhone: string;
    notes: string;
  };
}

// New types for tables
export interface TableArea {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  tables: Table[];
}

export interface Table {
  id: number;
  number: string;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "maintenance";
  qr_code?: string;
  is_active: boolean;
  area: {
    id: number;
    name: string;
  };
}

export interface TableArea {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  tables: Table[];
}

export interface OrderItem {
  id: number;
  quantity: number;
  notes: string;
  person_name: string;
  paid_amount: number;
  is_paid: boolean;
  item: ProductType;
  item_variations: MenuVariationType[];
}

export interface OrderService {
  id: number;
  quantity: number;
  notes: string;
  person_name: string;

  is_paid: boolean;
  service: Service;
}

export interface Order {
  id: number;
  ref_code: string;
  customer_name: string;
  customer_phone: string;
  payment_status: "pending" | "partial" | "paid" | "refunded";
  tax_enabled: boolean;
  tax_rate: number;
  created_at: string;
  table?: Table;
  order_items: OrderItem[];
  order_services: OrderService[];
  staff?: User;
  cancelled?: boolean;
}

export declare type APIErrorType = {
  message: string;
  extra: {
    fields?: {
      [key: string]: string;
    };
  };
};

export interface User {
  username: string | null;
  email: string | null;
  id: number | null;
  is_staff: boolean | null;
  is_superuser: boolean | null;
  role: string | null;
  first_name: string;
  last_name: string;
  is_admin?: boolean | null;
  date_joined: string | null;
}

export declare interface UserCredential {
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
}

export interface PaginationType<T> {
  limit: number;
  offset: number;
  count: number;
  next: string;
  previous: string;
  results: T[];
}
