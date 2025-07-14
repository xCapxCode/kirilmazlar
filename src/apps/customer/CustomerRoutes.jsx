import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Customer Pages
import ProductCatalog from "./pages/catalog";
import Cart from "./pages/cart";
import OrderHistory from "./pages/orders";
import CustomerProfile from "./pages/profile";

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="catalog" replace />} />
      <Route path="catalog" element={<ProductCatalog />} />
      <Route path="cart" element={<Cart />} />
      <Route path="orders" element={<OrderHistory />} />
      <Route path="profile" element={<CustomerProfile />} />
    </Routes>
  );
};

export default CustomerRoutes;
