import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import CookiePolicyPage from "./pages/CookiePolicyPage";

const LandingRoutes = () => {
  return (
    <Routes>
      <Route index element={<LandingPage />} />
      <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="terms-of-service" element={<TermsOfServicePage />} />
      <Route path="cookie-policy" element={<CookiePolicyPage />} />
    </Routes>
  );
};

export default LandingRoutes;
