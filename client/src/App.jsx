import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import "./Style.css"


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

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-otp" element={<ResetOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard/>} />
      <Route path="/admin/profile" element={<AdminProfile/>} />
      <Route path="/admin/customers" element={<CustomerManagement/>} />
      <Route path="/admin/customers/:id" element={<CustomerDetails />} />
      <Route path="/admin/categories" element={<CategoryManagement />} />
      <Route path="/admin/products" element={<ProductManagement />} />
      <Route path="/admin/products/add" element={<AddProduct />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:productId" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/order-confirmation" element={<OrderConfirmation />} />
      <Route path="/my-orders" element={<MyOrders />} />

    </Routes>
  );
}

export default App;
