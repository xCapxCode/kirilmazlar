import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import BottomTabNavigation from "../../../shared/components/ui/BottomTabNavigation";

// Seller Pages
import SellerDashboard from "./pages/dashboard";
import ProductManagement from "./pages/products";
import OrderManagement from "./pages/orders";
import CustomerManagement from "./pages/customers";
import GeneralSettings from "./pages/settings";

const SellerRoutes = () => {
  return (
    <>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="settings" element={<GeneralSettings />} />
      </Routes>
      <BottomTabNavigation />
    </>
  );
};

export default SellerRoutes;
