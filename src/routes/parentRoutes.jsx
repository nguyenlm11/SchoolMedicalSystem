import React from "react";
import { Route } from "react-router-dom";
import ParentLayout from "../components/layout/ParentLayout";
import ParentDashboard from "../pages/parent/ParentDashboard";
import HealthProfileList from "../pages/parent/HealthProfileList";
import StudentHealthProfile from "../pages/student/StudentHealthProfile";
import VaccinationSchedule from "../pages/parent/VaccinationSchedule";
import VaccinationDetail from "../pages/parent/VaccinationDetail";
import VaccinationResult from "../pages/parent/VaccinationResult";
import StudentHealthEvents from "../pages/student/StudentHealthEvents";
import HealthEventDetail from "../pages/nurse/HealthEventDetail";
import MedicationRequestCreate from "../pages/parent/MedicationRequestCreate";
import ParentProfile from "../pages/parent/ParentProfile";
import ParentMedicationRequestList from "../pages/parent/ParentMedicationRequestList";
import MedicationRequestDetail from "../pages/nurse/MedicationRequestDetail";
import ChangePassword from "../pages/auth/ChangePassword";
import HealthCheckSchedule from "../pages/parent/HealthCheckSchedule";
import HealthCheckDetail from "../pages/parent/HealthCheckDetail";
import StudentMedicationUsageHistory from "../pages/parent/StudentMedicationUsageHistory";
import MedicationUsageHistory from "../pages/nurse/MedicationUsageHistory";

const PlaceholderPage = ({ title }) => (
  <div className="p-8 text-center">{title}</div>
);

const parentRoutes = (
  <Route element={<ParentLayout />}>
    <Route path="/parent/dashboard" element={<ParentDashboard />} />
    <Route path="/parent/profile" element={<ParentProfile />} />
    <Route path="/parent/change-password" element={<ChangePassword />} />
    <Route path="/parent/health-profile/new" element={<PlaceholderPage title="Khai báo hồ sơ sức khỏe (đang phát triển)" />} />
    <Route path="/parent/health-profile" element={<HealthProfileList />} />
    <Route path="/parent/health-profile/:id" element={<StudentHealthProfile viewOnly={true} />} />
    <Route path="/parent/health-profile/edit/:id" element={<StudentHealthProfile />} />
    <Route path="/parent/student-health-events/:id" element={<StudentHealthEvents />} />
    <Route path="/parent/student-health-events-detail/:id" element={<HealthEventDetail />} />

    {/* Medication routes */}
    <Route path="/parent/medication/request" element={<MedicationRequestCreate />} />
    <Route path="/parent/medication/history" element={<ParentMedicationRequestList />} />
    <Route path="/parent/medication/history/:id" element={<MedicationRequestDetail />} />
    <Route path="/parent/medication/usage-history" element={<StudentMedicationUsageHistory />} />
    <Route path="/parent/medication-history/:id" element={<MedicationUsageHistory />} />
    <Route path="/parent/medication/detail/:id" element={<PlaceholderPage title="Chi tiết thuốc (đang phát triển)" />} />

    {/* Vaccination routes */}
    <Route path="/parent/vaccination/schedule" element={<VaccinationSchedule />} />
    <Route path="/parent/vaccination/details/:id" element={<VaccinationDetail />} />
    <Route path="/parent/vaccination/result/:id" element={<VaccinationResult />} />

    {/* Health check routes */}
    <Route path="/parent/health-check" element={<HealthCheckSchedule />} />
    <Route path="/parent/health-check/:id" element={<HealthCheckDetail />} />
    <Route path="/parent/health-check/:id/results" element={<PlaceholderPage title="Kết quả kiểm tra chi tiết (đang phát triển)" />} />
  </Route>
);

export default parentRoutes; 