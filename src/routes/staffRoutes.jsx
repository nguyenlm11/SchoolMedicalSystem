import React from "react";
import { Route } from "react-router-dom";
import UserProfilePage from "../pages/auth/UserProfilePage";
import NurseDashboard from "../pages/nurse/NurseDashboard";
import NurseMedicationPage from "../pages/nurse/NurseMedicationPage";
import NurseSupplyPage from "../pages/nurse/NurseSupplyPage";

const PlaceholderPage = ({ title }) => (
  <div className="p-8 text-center">{title}</div>
);

const staffRoutes = (
  <>
    {/* Staff Medication Routes */}
    <Route path="/schoolnurse/dashboard" element={<NurseDashboard />} />
    <Route path="/schoolnurse/medication/administer/:id" element={<PlaceholderPage title="Cho thuốc (đang phát triển)" />} />
    <Route path="/schoolnurse/medication" element={<NurseMedicationPage />} />
    <Route path="/schoolnurse/supply" element={<NurseSupplyPage />} />
    {/* Staff Profile Routes */}
    <Route path="/schoolnurse/profile" element={<UserProfilePage />} />
  </>
);

export default staffRoutes; 