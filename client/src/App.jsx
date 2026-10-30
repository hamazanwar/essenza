import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import "./Style.css";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import VerifyEmail from "./components/auth/VerifyEmail";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetOtp from "./components/auth/ResetOtp";
import ResetPassword from "./components/auth/ResetPassword";
import Home from "./components/home/Home";
import Profile from "./components/profile/Profile";
import About from "./components/about contact/About";
import Contact from "./components/about contact/Contact";
import AdminLogin from "./admin/auth/AdminLogin";
import AdminDashboard from "./admin/dashboard/AdminDashboard";
import AdminProfile from "./admin/profile/AdminProfile";
import CustomerManagement from "./admin/customer/CustomerManagement";
import CustomerDetails from "./admin/customer/CustomerDetails";
import CategoryManagement from "./admin/category/CategoryManagement";
import ProductManagement from "./admin/product/ProductManagement";
import AddProduct from "./admin/product/AddProduct";
import Shop from "./components/shop/Shop";
import ProductDetails from "./components/product/ProductDetails";
import Cart from "./components/cart/Cart";
import Wishlist from "./components/wishlist/Wishlist";
import Checkout from "./components/ckeckout/Checkout";
import Payment from "./components/payment/Payment";
import OrderConfirmation from "./components/order/OrderConfirmation";
import MyOrders from "./components/order/MyOrders";
import AdminOrderManagement from "./admin/order/AdminOrderManagement";
import OrderDetails from "./components/order/OrderDetails";
import CouponManagement from "./admin/coupon/CouponManagement";
import Wallet from "./components/wallet/Wallet";
import OfferManagement from "./admin/offer/OfferManagement";
import AdminReviews from "./admin/review/AdminReviews";
import AdminSalesReport from "./admin/sales/AdminSalesReport";
import AdminProfileEdit from "./admin/profile/AdminProfileEdit";
import AdminReturnManagement from "./admin/return/AdminReturnManagement";


function GuestOnly({ children }) {
  const token = sessionStorage.getItem("token");

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AdminGuestOnly({ children }) {
  const adminToken = sessionStorage.getItem("adminToken");

  if (adminToken) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

// Only logged-in users can access user pages
function UserOnly({ children }) {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Only logged-in admins can access admin pages
function AdminOnly({ children }) {
  const adminToken = sessionStorage.getItem("adminToken");

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

// Protect temporary authentication flows
function FlowProtected({ children, storageKey }) {
  const token = sessionStorage.getItem("token");

  if (token) {
    return <Navigate to="/" replace />;
  }

  const hasAccess = sessionStorage.getItem(storageKey) === "true";

  if (!hasAccess) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route
        path="/register"
        element={
          <GuestOnly>
            <Register />
          </GuestOnly>
        }
      />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/admin/login"
        element={
          <AdminGuestOnly>
            <AdminLogin />
          </AdminGuestOnly>
        }
      />
     <Route
  path="/verify-email"
  element={
    <FlowProtected storageKey="verificationStarted">
      <VerifyEmail />
    </FlowProtected>
  }
/>

<Route
  path="/forgot-password"
  element={
    <FlowProtected storageKey="forgotPasswordStarted">
      <ForgotPassword />
    </FlowProtected>
  }
/>

<Route
  path="/reset-otp"
  element={
    <FlowProtected storageKey="resetOtpStarted">
      <ResetOtp />
    </FlowProtected>
  }
/>

<Route
  path="/reset-password"
  element={
    <FlowProtected storageKey="resetPasswordStarted">
      <ResetPassword />
    </FlowProtected>
  }
/>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<UserOnly><Profile /></UserOnly>} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/admin/dashboard" element={<AdminOnly><AdminDashboard /></AdminOnly>} />
      <Route path="/admin/profile" element={<AdminOnly><AdminProfile /></AdminOnly>} />
     <Route path="/admin/customers" element={<AdminOnly><CustomerManagement /></AdminOnly>} />
      <Route path="/admin/customers/:id" element={<AdminOnly><CustomerDetails /></AdminOnly>} />
<Route path="/admin/categories" element={<AdminOnly><CategoryManagement /></AdminOnly>} />
      <Route path="/admin/products" element={<AdminOnly><ProductManagement /></AdminOnly>} />
      <Route path="/admin/products/add" element={<AdminOnly><AddProduct /></AdminOnly>} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:productId" element={<ProductDetails />} />
      <Route path="/cart" element={<UserOnly><Cart /></UserOnly>} />
      <Route path="/wishlist" element={<UserOnly><Wishlist /></UserOnly>} />
     <Route path="/checkout" element={<UserOnly><Checkout /></UserOnly>} />
      <Route path="/payment" element={<UserOnly><Payment /></UserOnly>} />
      <Route path="/order-confirmation" element={<UserOnly><OrderConfirmation /></UserOnly>} />
 <Route path="/my-orders" element={<UserOnly><MyOrders /></UserOnly>} />
      <Route path="/admin/orders" element={<AdminOnly><AdminOrderManagement /></AdminOnly>} />
   <Route path="/my-orders/:orderId" element={<UserOnly><OrderDetails /></UserOnly>} />
     <Route path="/admin/coupons" element={<AdminOnly><CouponManagement /></AdminOnly>} />
      <Route path="/wallet" element={<UserOnly><Wallet /></UserOnly>} />
     <Route path="/admin/offers" element={<AdminOnly><OfferManagement /></AdminOnly>} />
     <Route path="/admin/reviews" element={<AdminOnly><AdminReviews /></AdminOnly>} />
      <Route path="/admin/sales-report" element={<AdminOnly><AdminSalesReport /></AdminOnly>} />
      <Route path="/admin/profile/edit" element={<AdminOnly><AdminProfileEdit /></AdminOnly>} />
      <Route path="/admin/returns" element={<AdminOnly><AdminReturnManagement /></AdminOnly>} />
    </Routes>
  );
}

export default App;
