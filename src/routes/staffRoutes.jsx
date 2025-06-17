import React from "react";
import { Route } from "react-router-dom";
import UserProfilePage from "../pages/auth/UserProfilePage";

const PlaceholderPage = ({ title }) => (
  <div className="p-8 text-center">{title}</div>
);

const staffRoutes = (
  <>
    {/* Staff Medication Routes */}
    <Route path="/staff/medication/administer/:id" element={<PlaceholderPage title="Cho thuốc (đang phát triển)" />} />
    <Route path="/staff/medication" element={<PlaceholderPage title="Kho thuốc (đang phát triển)" />} />
    <Route path="/staff/supply" element={<PlaceholderPage title="Kho vật tư y tế (đang phát triển)" />} />
    {/* Staff Profile Routes */}
    <Route path="/staff/profile" element={<UserProfilePage />} />
  </>
);

export default staffRoutes; 