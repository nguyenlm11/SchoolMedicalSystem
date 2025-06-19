import React from "react";
import { Route } from "react-router-dom";
import UserProfilePage from "../pages/auth/UserProfilePage";
import NurseDashboard from "../pages/nurse/NurseDashboard";
import NurseMedicationPage from "../pages/nurse/NurseMedicationPage";
import NurseSupplyPage from "../pages/nurse/NurseSupplyPage";
import MedicalItemDetail from "../pages/nurse/MedicalItemDetail";
import VaccinationManagement from "../pages/nurse/VaccinationManagement";
import VaccinationPlanCreate from "../pages/nurse/VaccinationPlanCreate";

const PlaceholderPage = ({ title }) => (
  <div className="p-8 text-center">{title}</div>
);

const staffRoutes = (
  <>
    {/* Staff Medication Routes */}
    <Route path="/schoolnurse/dashboard" element={<NurseDashboard />} />
    <Route path="/schoolnurse/medication/administer/:id" element={<PlaceholderPage title="Cho thuốc (đang phát triển)" />} />
    <Route path="/schoolnurse/medication" element={<NurseMedicationPage />} />
    <Route path="/schoolnurse/medical-items/:id" element={<MedicalItemDetail />} />
    <Route path="/schoolnurse/supply" element={<NurseSupplyPage />} />

    {/* Vaccination Routes */}
    <Route path="/schoolnurse/vaccination" element={<VaccinationManagement />} />
    <Route path="/schoolnurse/vaccination/create" element={<VaccinationPlanCreate />} />

    {/* Staff Profile Routes */}
    <Route path="/schoolnurse/profile" element={<UserProfilePage />} />
  </>
);

export default staffRoutes; 