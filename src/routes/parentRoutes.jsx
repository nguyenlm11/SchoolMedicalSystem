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

const PlaceholderPage = ({ title }) => (
  <div className="p-8 text-center">{title}</div>
);

const parentRoutes = (
  <Route element={<ParentLayout />}>
    <Route path="/parent/dashboard" element={<ParentDashboard />} />
    <Route path="/parent/health-profile/new" element={<PlaceholderPage title="Khai báo hồ sơ sức khỏe (đang phát triển)" />} />
    <Route path="/parent/health-profile" element={<HealthProfileList />} />
    <Route path="/parent/health-profile/:id" element={<StudentHealthProfile viewOnly={true} />} />
    <Route path="/parent/health-profile/edit/:id" element={<StudentHealthProfile />} />
    <Route path="/parent/student-health-events/:id" element={<StudentHealthEvents />} />
    <Route path="/parent/student-health-events-detail/:id" element={<HealthEventDetail />} />

    {/* Medication routes */}
    <Route path="/parent/medication/request" element={<PlaceholderPage title="Gửi thuốc (đang phát triển)" />} />
    <Route path="/parent/medication/history" element={<PlaceholderPage title="Lịch sử gửi thuốc (đang phát triển)" />} />
    <Route path="/parent/medication/detail/:id" element={<PlaceholderPage title="Chi tiết thuốc (đang phát triển)" />} />

    {/* Vaccination routes */}
    <Route path="/parent/vaccination/schedule" element={<VaccinationSchedule />} />
    <Route path="/parent/vaccination/details/:id" element={<VaccinationDetail />} />
    <Route path="/parent/vaccination/result/:id" element={<VaccinationResult />} />

    {/* Health check routes */}
    <Route path="/parent/health-check" element={<PlaceholderPage title="Xác nhận kiểm tra (đang phát triển)" />} />
    <Route path="/parent/health-check/results" element={<PlaceholderPage title="Xem kết quả kiểm tra (đang phát triển)" />} />
    <Route path="/parent/health-check/:id/results" element={<PlaceholderPage title="Kết quả kiểm tra chi tiết (đang phát triển)" />} />
  </Route>
);

export default parentRoutes; 