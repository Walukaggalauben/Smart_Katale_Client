import { Route, Routes, Navigate } from "react-router-dom";
import Auth from "./pages/auth";
import Home from "./layouts/main_layout";
import Shop from "./pages/shop";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/product_details";
import Compare from "./pages/compare";
import Iphone18Series from "./pages/iphone_18_series";
import OrderSuccess from "./pages/order_success";
import MyProfile from "./pages/my_profile";
import ManagerDashBoard from "./pages/manager_home";
import Unauthorized from "./pages/404";
import { useAppSelector } from "./types/hooks.types";
import ProtectedRoute from "./layouts/protected";
import { Box, Typography } from "@mui/joy";

function App() {
  const {loading } = useAppSelector((state) => state.user);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor:"#0e0d0d7c", 
        height: '100vh', 
        flexDirection:'column'
      }}>
        <Typography level="h4">Authenticating...</Typography>
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public routes - accessible to everyone */}
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/iphone-18-series" element={<Iphone18Series />} />

      {/* Main app routes with Home layout */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute 
            redirectIfManager="/admin" 
          >
            <Home />
          </ProtectedRoute>
        }
      >
        {/* Protected routes - require authentication (customers only) */}
        <Route element={<ProtectedRoute requiredRole="customer" />}>
          <Route path="/my-profile" element={<MyProfile />} />
        </Route>
       
        <Route index element={<Shop />} />
        <Route path="shop" element={<Shop />} />
        <Route path="cart" element={<Cart />} />
        <Route path="compare" element={<Compare />} />
        <Route path="product-details/:id" element={<ProductDetails />} />
      </Route>

      {/* Auth routes - only for non-authenticated users (guests) */}
      <Route element={<ProtectedRoute requiresGuest redirectTo="/" />}>
        <Route path="/accounts/login" element={<Auth />} />
        <Route path="/accounts/register" element={<Auth />} />
        <Route path="/accounts" element={<Navigate to="/accounts/login" replace />} />
      </Route>

      {/* Admin routes - require manager role (separate layout) */}
      <Route element={<ProtectedRoute requiredRole="manager" />}>
        <Route path="/admin" element={<ManagerDashBoard />} />
      </Route>

      {/* Unauthorized page */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* 404 - Not Found */}
      <Route path="*" element={
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          gap: 2
        }}>
          <Typography level="h1">404</Typography>
          <Typography level="h3">Page Not Found</Typography>
          <Typography level="body-lg">
            The page you're looking for doesn't exist.
          </Typography>
        </Box>
      } />
    </Routes>
  );
}

export default App;