import React from "react";
import { Route } from "react-router-dom";
import StaffLayout from "../components/layout/StaffLayout";
import UserProfilePage from "../pages/auth/UserProfilePage";
import NurseDashboard from "../pages/nurse/NurseDashboard";
import NurseMedicationPage from "../pages/nurse/NurseMedicationPage";
import NurseSupplyPage from "../pages/nurse/NurseSupplyPage";
import MedicalItemDetail from "../pages/nurse/MedicalItemDetail";
import VaccinationManagement from "../pages/nurse/VaccinationManagement";
import VaccinationPlanCreate from "../pages/nurse/VaccinationPlanCreate";
import VaccinationDetail from "../pages/nurse/VaccinationDetail";
import VaccinationProcess from "../pages/nurse/VaccinationProcess";
import HealthEventManagement from "../pages/nurse/HealthEventManagement";
import HealthEventCreate from "../pages/nurse/HealthEventCreate";
import HealthEventDetail from "../pages/nurse/HealthEventDetail";
import MedicationRequestManagement from "../pages/nurse/MedicationRequestManagement";
import MedicationRequestDetail from "../pages/nurse/MedicationRequestDetail";
import StudentHealthProfile from "../pages/student/StudentHealthProfile";
import ChangePassword from "../pages/auth/ChangePassword";
import MedicationUsageManagement from "../pages/nurse/MedicationUsageManagement";
import HealthCheckCategoryManagement from "../pages/nurse/HealthCheckCategoryManagement";
import HealthCheckPlanCreate from "../pages/nurse/HealthCheckPlanCreate";
import HealthCheckManagement from "../pages/nurse/HealthCheckManagement";

import HealthCheckDetail from "../pages/nurse/HealthCheckDetail";

import VaccineTypes from "../pages/nurse/VaccineTypes";
import MedicationUsageHistory from "../pages/nurse/MedicationUsageHistory";


const PlaceholderPage = ({ title }) => (
  <div className="p-8 text-center">{title}</div>
);

const staffRoutes = (
  <Route element={<StaffLayout />}>
    {/* Staff Medication Routes */}
    <Route path="/schoolnurse/dashboard" element={<NurseDashboard />} />
    <Route path="/schoolnurse/student-health-profile/:id" element={<StudentHealthProfile viewOnly={true} />} />
    <Route path="/schoolnurse/medication/administer/:id" element={<PlaceholderPage title="Cho thuốc (đang phát triển)" />} />
    <Route path="/schoolnurse/medication" element={<NurseMedicationPage />} />
    <Route path="/schoolnurse/medication-requests" element={<MedicationRequestManagement />} />
    <Route path="/schoolnurse/medication-requests/:id" element={<MedicationRequestDetail />} />
    <Route path="/schoolnurse/medication-usage" element={<MedicationUsageManagement />} />
    <Route path="/schoolnurse/medication-usage-history/:id" element={<MedicationUsageHistory />} />
    <Route path="/schoolnurse/medical-items/:id" element={<MedicalItemDetail />} />
    <Route path="/schoolnurse/supply" element={<NurseSupplyPage />} />

    {/* Vaccination Routes */}
    <Route path="/schoolnurse/vaccination" element={<VaccinationManagement />} />
    <Route path="/schoolnurse/vaccination/:id" element={<VaccinationDetail />} />
    <Route path="/schoolnurse/vaccination/:id/process" element={<VaccinationProcess />} />
    <Route path="/schoolnurse/vaccination/:id/process/:classId" element={<VaccinationProcess />} />
    <Route path="/schoolnurse/vaccination/create" element={<VaccinationPlanCreate />} />
    <Route path="/schoolnurse/vaccine-types" element={<VaccineTypes />} />

    {/* Health Check Routes */}
    <Route path="/schoolnurse/health-check" element={<HealthCheckManagement />} />
    <Route path="/schoolnurse/health-check/:id" element={<HealthCheckDetail />} />
    <Route path="/schoolnurse/health-check/create" element={<HealthCheckPlanCreate />} />
    <Route path="/schoolnurse/health-check-items" element={<HealthCheckCategoryManagement />} />

    {/* Health Event Routes */}
    <Route path="/schoolnurse/health-events/create" element={<HealthEventCreate />} />
    <Route path="/schoolnurse/health-events" element={<HealthEventManagement />} />
    <Route path="/schoolnurse/health-events/:id" element={<HealthEventDetail />} />

    {/* Staff Profile Routes */}
    <Route path="/schoolnurse/profile" element={<UserProfilePage />} />
    <Route path="/profile" element={<UserProfilePage />} />
    <Route path="/schoolnurse/change-password" element={<ChangePassword />} />
  </Route>
);

export default staffRoutes; 