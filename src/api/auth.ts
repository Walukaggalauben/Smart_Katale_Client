import { API_URL } from "../configs";
import axios from 'axios'

const authConfig = () => {
  const token = sessionStorage.getItem('access_token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};
import type {CustomerAddressCardsProps, CustomerPaymnentCardsProps } from "../interfaces/users.interfaces";
import type { OrderDataProps, OrdersProps } from "../interfaces/orders.interfaces";
import type { ProductDataProps } from "../interfaces/products.interfaces";


export const UserLogin = async (credentials: {[key: string] : string}) => {
    try {
        const response = await fetch(`${API_URL}/accounts/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials),
        });
  
        const data = await response.json();
        return data;
      

    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }}

export const UserRegister  = async(formdata: {[key: string]: string}):Promise<any> => {

    try {
        const response = await fetch(`${API_URL}/accounts/register/`,{
            method:'POST',
            headers:{
                "Content-Type":'application/json'
            },
            body: JSON.stringify(formdata)
           
        },)

    return  response
        
    //    }
    } catch (error) {
        throw new Error('An Error Occurred')
    }

} 

export const FetchCustomerData = async(id:number | null |string) => {
    const payment_cards:CustomerPaymnentCardsProps = {count:0,details:[]}
    const addresses:CustomerAddressCardsProps = {count:0,details:[]}
    const orders:OrdersProps = {pending_orders:0,details:[]}
   
    try {
 const [
      CardsResponse,

      AddressResponse,

      OrdersResponse,


    ] = await Promise.allSettled([
      axios.get(`${API_URL}/accounts/${id}/card-details/`, authConfig()),

      axios.get(`${API_URL}/accounts/${id}/address-details/`, authConfig()),

      axios.get(`${API_URL}/accounts/${id}/order/`, authConfig()),

   
    ]);

    if (CardsResponse.status === 'fulfilled') {
      payment_cards.count = CardsResponse.value.data.length;
      payment_cards.details = CardsResponse.value.data

      
    } else {
      console.error('Failed to fetch User Cards:', CardsResponse.reason);
    }

    if (AddressResponse.status === 'fulfilled') {
      addresses.count = AddressResponse.value.data.length;
      addresses.details=AddressResponse.value.data

      
    } else {
      console.error('Failed to fetch Customer Addresses:', AddressResponse.reason);
    }
    if (OrdersResponse.status === 'fulfilled') {
        let pending = OrdersResponse.value.data.filter((ord:any) => ord.status === 'pending')
      orders.pending_orders = pending.length;
      orders.details=OrdersResponse.value.data

      
    } else {
      console.error('Failed to fetch Customer Orders:', OrdersResponse.reason);
    }














const response = {
      success: true,
      Cards: payment_cards,
      Addresses:addresses,
      Orders:orders,
      timestamp: new Date().toISOString()
    };
    return response





    } catch (error) {
       console.error(error) 
    }
}

export const FetchManagerData = async () => {



  try {
    let productsData:ProductDataProps = {products:[],summary:{},sales:{}};
    let ordersData:OrderDataProps = {pending:{count:0,details:[]},order_details:[],top_orders:[],summary:{delivered_orders:0,last_delivery_date:''}};

    const [
      productsResponse,
      productAnalysisResponse,

      get_top_5_orders,
      orders_analysis,
      get_pending_orders,
      all_orders,

      get_total_sales

    ] = await Promise.allSettled([
      axios.get(`${API_URL}/products/`),
      axios.get(`${API_URL}/analysis/products`),

      axios.get(`${API_URL}/orders/top_5_orders`),
      axios.get(`${API_URL}/analysis/orders/`),
      axios.get(`${API_URL}/orders/get_pending_orders/`),
      axios.get(`${API_URL}/orders/`),

      axios.get(`${API_URL}/analysis/sales`),
    ]);

    // Process Products Data
    if (productsResponse.status === 'fulfilled') {
      productsData.products = productsResponse.value.data;
      
    } else {
      console.error('Failed to fetch products:', productsResponse.reason);
    }
    if (productAnalysisResponse.status === 'fulfilled') {
       productsData.summary = productAnalysisResponse.value.data;
      
    } else {
      console.error('Failed to fetch product analysis:', productAnalysisResponse.reason);
    }

    // // Process Orders Data
    if (get_top_5_orders.status === 'fulfilled') {
      ordersData.top_orders = get_top_5_orders.value.data.data;
} else {
      console.error('Failed to fetch orders:', get_top_5_orders.reason);
    }
    if (all_orders.status === 'fulfilled') {
      ordersData.order_details = all_orders.value.data;
} else {
      console.error('Failed to fetch orders:', all_orders.reason);
    }
    if (get_pending_orders.status === 'fulfilled') {
      ordersData.pending.count = get_pending_orders.value.data.count;
      ordersData.pending.details = get_pending_orders.value.data.data;
} else {
      console.error('Failed to fetch orders:', get_pending_orders.reason);
    }
    if (orders_analysis.status === 'fulfilled') {
      ordersData.pending.count = orders_analysis.value.data.pending_orders;
      ordersData.summary.delivered_orders = orders_analysis.value.data.delivered_orders;
      ordersData.summary.last_delivery_date = orders_analysis.value.data.last_order_time;
} else {
      console.error('Failed to fetch orders:', orders_analysis.reason);
    }

// Sales
if (get_total_sales.status === 'fulfilled'){
    productsData.sales = get_total_sales.value.data
}else{
console.error('Failed to fetch data:', get_total_sales.reason);
    
}
    const response = {
      success: true,
      products: productsData,
      orders:ordersData,
      timestamp: new Date().toISOString()
    };
    return response

  } catch (error) {
    console.error('Error fetching manager data:', error);
    return {
      success: false,
    };
  }
};
