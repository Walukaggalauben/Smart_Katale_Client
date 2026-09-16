
export interface OrderData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  payment_method: string;
  order_type: string;
  city: string;
  town: string;
  shipping_address?: string;
  total_price: number | string;
  total_items: number | string;
  items?: Array<{
    id: string;
    quantity: number;
    price: number;
  }>;
}

export interface OrderResponse {
  id: string;
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  payment_method: string;
  order_type: string;
  city: string;
  town: string;
  status: string;
  total_price: number;
  total_items: number;
  created_at: string;
}
export type Order = 'asc' | 'desc';
export type TableType = 'orders' | 'products' | 'customers';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type ProductStatus = 'Brand New' | 'Uk Used' | '';

