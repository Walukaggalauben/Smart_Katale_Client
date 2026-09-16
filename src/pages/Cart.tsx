import { Box, Typography, Button, Card, Grid, Divider, Modal, ModalDialog } from '@mui/joy';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../types/hooks.types';
import { updateQuantity, removeFromCart, clearCart } from  '../Slices/CartSlice';
import { FaArrowLeft, FaShoppingBag } from 'react-icons/fa';
import CartProduct from '../components/ui/cart_product';
import SmartForm from '../components/common/form';
import { useToast } from '../utils/toast-context';
import { checkout } from '../api/order';
import { UnAuthUserCheckOutFormFields } from '../configs/form_fields';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const { items, totalAmount, totalItems } = useAppSelector((state) => state.cart);
  
  const [checkOutForm, setCheckOutForm] = useState(false);
  const [clearCartOpen, setClearCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Updated to match backend field names (camelCase)
  const usercheckoutData: { 
    first_name: string; 
    last_name: string; 
    phone_number: string; 
    email: string;
    payment_method: string;
    order_type: string;
    city: string;
    town: string;
    address:string;
  } = {
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    payment_method: '',
    order_type: '',
    city: '',
    town: '',
    address:''
  };
  
  const [formData, setFormData] = React.useState<{ [key: string]: string }>(usercheckoutData);

  const isFormValid = () => {
    return Object.entries(formData).every(([_key, value]) => value !== "");
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
    addToast({ message: 'Item removed from cart', color: 'neutral' });
  };
const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setIsLoading(true);

  try {
    // Validate all required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'phone_number', 
                           'payment_method', 'order_type', 'city', 'town','address'];
    
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());
    
    if (missingFields.length > 0) {
      addToast({ 
        message: `Please fill in: ${missingFields.join(', ')}`, 
        color: 'warning' 
      });
      setIsLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email?.trim() || '')) {
      addToast({ 
        message: 'Please enter a valid email address', 
        color: 'warning' 
      });
      setIsLoading(false);
      return;
    }

    // Validate phone number (exactly 10 digits)
    const phoneRegex = /^\d{10}$/;
    const cleanedPhone = (formData.phone_number || '').trim().replace(/\D/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      addToast({ 
        message: 'Please enter a valid phone number (10 digits)', 
        color: 'warning' 
      });
      setIsLoading(false);
      return;
    }

    // Validate that cart is not empty
    if (!items || items.length === 0) {
      addToast({ 
        message: 'Your cart is empty', 
        color: 'warning' 
      });
      setIsLoading(false);
      return;
    }

    // Prepare items data with proper structure
    const itemsData = items.map((item:any) => ({
      id: item.id,
      quantity: item.quantity || 1,
      price: item.price || 0,
      price_at_time: item.price || 0
    }));


    // Prepare order data with snake_case for backend
    const orderData = {
      first_name: (formData.first_name || '').trim(),
      last_name: (formData.last_name || '').trim(),
      email: (formData.email || '').trim(),
      phone_number: cleanedPhone,
      payment_method: formData.payment_method || 'cash',
      order_type: formData.order_type || 'door_delivery',
      city: (formData.city || '').trim(),
      town: (formData.town || '').trim(),
      shipping_address: (formData.address || '').trim(),
      total_price: (totalAmount) || 0,
      total_items: Number(totalItems) || 0,
      items: itemsData
    };

    console.log('Submitting order with data:', orderData);

    // Use the checkout endpoint directly
    const createdOrder = await checkout(orderData);
    
    dispatch(clearCart());
    
    addToast({ 
      message: `Order #${createdOrder.order_number || createdOrder.id} placed successfully!`, 
      color: 'success' 
    });
    
    navigate('/order-success', { 
      state: { 
        orderId: createdOrder.id,
        orderNumber: createdOrder.order_number,
        totalAmount: createdOrder.total_price,
        customerName: `${orderData.first_name} ${orderData.last_name}`
      } 
    });

  } catch (error) {
    console.error('Checkout error:', error);
    
    let errorMessage = 'Failed to place order. Please try again.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    addToast({ 
      message: errorMessage, 
      color: 'danger' 
    });
  } finally {
    setIsLoading(false);
    setCheckOutForm(false);
  }
};
  const handleClearCart = () => {
    dispatch(clearCart());
    setClearCartOpen(false);
    addToast({ message: 'Cart cleared successfully', color: 'success' });
  };

  const subtotal = totalAmount;

  if (items.length === 0) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, textAlign: 'center' }}>
        <Box sx={{ p: 6 }}>
          <FaShoppingBag size={64} style={{ margin: '0 auto 20px', color: '#ccc' }} />
          <Typography level="h3" sx={{ mb: 2 }}>
            Your cart is empty
          </Typography>
          <Typography level="body-lg" sx={{ mb: 4, color: 'text.secondary' }}>
            Looks like you haven't added any items to your cart yet.
          </Typography>
          <Button
            size="lg"
            color="success"
            variant="solid"
            onClick={() => navigate('/shop')}
            startDecorator={<FaArrowLeft />}
          >
            Continue Shopping
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography level="h2" sx={{ mb: 3 }}>
        Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
      </Typography>

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid xs={12} md={8}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography level="title-lg">Cart Items</Typography>
              <Button
                color="danger"
                variant="plain"
                size="sm"
                onClick={() => setClearCartOpen(true)}
              >
                Clear Cart
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {items.map((item:any) => (
              <CartProduct
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}

            <Box sx={{ mt: 3 }}>
              <Button
                color="neutral"
                variant="plain"
                startDecorator={<FaArrowLeft />}
                onClick={() => navigate('/shop')}
              >
                Continue Shopping
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid xs={12} md={4}>
          <Card variant="outlined" sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Typography level="title-lg" sx={{ mb: 2 }}>
              Order Summary
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography level="body-md">Subtotal</Typography>
                <Typography level="body-md" fontWeight="bold">
                  UGX {subtotal.toFixed(0)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography level="body-md">Items</Typography>
                <Typography level="body-md" fontWeight="bold">
                  {totalItems}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography level="title-md">Total</Typography>
              <Typography level="title-lg" sx={{ color: '#004526', fontWeight: 800 }}>
                UGX {subtotal.toLocaleString()}
              </Typography>
            </Box>

            <Button
              size="lg"
              color="warning"
              variant="solid"
              fullWidth
              onClick={() => setCheckOutForm(true)}
            >
              Continue to Shipping
            </Button>

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'grid', gap: 0.8 }}>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                • Delivery details are collected securely at checkout
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                • Review your order before placing it
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                • Order confirmation is shown after successful submission
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Checkout Modal */}
      {checkOutForm && (
        <Modal open={checkOutForm} onClose={() => setCheckOutForm(false)}>
          <ModalDialog
            aria-labelledby="checkout-modal"
            layout="center"
            size="md"
            sx={{ maxHeight: '90vh', overflow: 'auto' }}
          >
            <Typography 
              id="checkout-modal" 
              level="h2" 
              color="success" 
              sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}
            >
              Checkout
            </Typography>
            
            <SmartForm  
              formControls={UnAuthUserCheckOutFormFields}
              isLoading={isLoading}
              buttonText="Place Order"
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              variant="solid"
              isBtnDisabled={!isFormValid()}
              message="PLACING ORDER..."
            />

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
              <Button 
                sx={{ width: '75%' }} 
                variant="solid" 
                color="danger" 
                onClick={() => setCheckOutForm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </Box>
            
            <Typography level="body-sm" sx={{ alignSelf: 'center', color: 'text.secondary', mt: 2 }}>
              By clicking "Place Order", you agree to our Terms of Service and Privacy Policy.
            </Typography>
          </ModalDialog>
        </Modal>
      )}

      {/* Clear Cart Confirmation Modal */}
      <Modal open={clearCartOpen} onClose={() => setClearCartOpen(false)}>
        <ModalDialog
          aria-labelledby="delete-modal"
          layout="center"
          size="sm"
        >
          <Typography id="delete-modal" level="h4" color="danger">
            Clear Cart
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography level="body-md">
            Are you sure you want to remove all items? This action cannot be undone.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="plain" color="neutral" onClick={() => setClearCartOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="solid" 
              color="danger" 
              onClick={handleClearCart}
            >
              Clear Cart
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default Cart;