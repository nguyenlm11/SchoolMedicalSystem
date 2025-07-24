import React from "react";
import { Route } from "react-router-dom";
import StudentLayout from "../components/layout/StudentLayout";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentHealthProfile from "../pages/student/StudentHealthProfile";
import StudentMedication from "../pages/student/StudentMedication";
import StudentHealthEvents from "../pages/student/StudentHealthEvents";
import StudentProfile from "../pages/student/StudentProfile";
import ChangePassword from "../pages/auth/ChangePassword";
import MedicationUsageSchedule from "../pages/student/MedicationUsageSchedule";
import StudentVaccinationSchedule from "../pages/student/StudentVaccinationSchedule";
import MedicationUsageHistory from '../pages/nurse/MedicationUsageHistory.jsx';

const PlaceholderPage = ({ title }) => (
  <div className="p-8 text-center">{title}</div>
);

const studentRoutes = (
  <Route element={<StudentLayout />}>
    <Route path="/student/dashboard" element={<StudentDashboard />} />
    <Route path="/student/health-profile" element={<StudentHealthProfile viewOnly={true} />} />
    <Route path="/student/medication-usage" element={<MedicationUsageSchedule />} />
    <Route path="/student/medication-history/:id" element={<MedicationUsageHistory />} />
    <Route path="/student/vaccination-schedule" element={<StudentVaccinationSchedule />} />
    <Route path="/student/report-symptom" element={<PlaceholderPage title="Báo cáo triệu chứng (đang phát triển)" />} />
    <Route path="/student/request-visit" element={<PlaceholderPage title="Yêu cầu gặp y tá (đang phát triển)" />} />
    <Route path="/student/health-events" element={<StudentHealthEvents />} />
    <Route path="/student/profile" element={<StudentProfile />} />
    <Route path="/student/change-password" element={<ChangePassword />} />
  </Route>
);

export default studentRoutes; 