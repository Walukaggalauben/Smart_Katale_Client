import { API_URL } from "../configs";
import type { OrderData, OrderResponse } from "../types/orders.types";

export const checkout = async (orderData: OrderData): Promise<OrderResponse> => {
  try {
    const cleanedData = {
      first_name: orderData.first_name || '',
      last_name: orderData.last_name || '',
      email: orderData.email || '',
      phone_number: orderData.phone_number || '',
      payment_method: orderData.payment_method || 'cash',
      order_type: orderData.order_type || 'door_delivery',
      city: orderData.city || '',
      town: orderData.town || '',
      shipping_address: (orderData as OrderData & { shipping_address?: string }).shipping_address || '',
      total_price: Number(orderData.total_price) || 0,
      total_items: Number(orderData.total_items) || 0,
      items: (orderData.items || []).map(item => ({
        id: item.id,
        product_id: item.id, 
        quantity: item.quantity || 1,
        price: item.price || 0,
        price_at_time: item.price || 0
      }))
    };
    
    
    const response = await fetch(`${API_URL}/orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanedData),
    });

    const data = await response.json();
    console.log('Order response:', { 
      status: response.status, 
      data,
      hasItems: data.items ? data.items.length : 0 
    });

    if (!response.ok) {
      let errorMessage = 'Failed to place order';
      if (data && data.error) {
        errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      } else if (data && data.detail) {
        errorMessage = data.detail;
      }
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
};