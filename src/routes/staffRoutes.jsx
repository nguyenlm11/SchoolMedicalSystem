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
    <Route path="/staff/medication/inventory" element={<PlaceholderPage title="Kho thuốc (đang phát triển)" />} />
    <Route path="/staff/medication/inventory/add" element={<PlaceholderPage title="Thêm thuốc (đang phát triển)" />} />
    <Route path="/staff/medication/inventory/detail/:id" element={<PlaceholderPage title="Chi tiết thuốc (đang phát triển)" />} />
    <Route path="/staff/medication/inventory/edit/:id" element={<PlaceholderPage title="Chỉnh sửa thuốc (đang phát triển)" />} />
    <Route path="/staff/medication/inventory/transaction" element={<PlaceholderPage title="Giao dịch kho (đang phát triển)" />} />
    <Route path="/staff/medication/inventory/transaction/:id" element={<PlaceholderPage title="Chi tiết giao dịch (đang phát triển)" />} />
    <Route path="/staff/medication/inventory/history" element={<PlaceholderPage title="Lịch sử giao dịch (đang phát triển)" />} />

    {/* Staff Health Events Routes */}
    <Route path="/staff/health-events" element={<PlaceholderPage title="Danh sách sự kiện y tế (đang phát triển)" />} />
    <Route path="/staff/health-events/new" element={<PlaceholderPage title="Thêm sự kiện mới (đang phát triển)" />} />
    <Route path="/staff/health-events/:id" element={<PlaceholderPage title="Chi tiết sự kiện y tế (đang phát triển)" />} />
    <Route path="/staff/health-events/edit/:id" element={<PlaceholderPage title="Chỉnh sửa sự kiện y tế (đang phát triển)" />} />
    <Route path="/staff/health-events/:id/supplies" element={<PlaceholderPage title="Vật tư y tế cho sự kiện (đang phát triển)" />} />

    {/* Staff Vaccination Management Routes */}
    <Route path="/staff/vaccination" element={<PlaceholderPage title="Quản lý tiêm chủng (đang phát triển)" />} />
    <Route path="/staff/vaccination/flow" element={<PlaceholderPage title="Quy trình tiêm chủng (đang phát triển)" />} />

    {/* Staff Health Check Management Routes */}
    <Route path="/staff/health-check" element={<PlaceholderPage title="Quản lý kiểm tra (đang phát triển)" />} />
    <Route path="/staff/health-check/new" element={<PlaceholderPage title="Lên lịch kiểm tra mới (đang phát triển)" />} />
    <Route path="/staff/health-check/:checkId" element={<PlaceholderPage title="Thực hiện kiểm tra (đang phát triển)" />} />
    <Route path="/staff/health-check/:checkId/results" element={<PlaceholderPage title="Kết quả kiểm tra (đang phát triển)" />} />
    <Route path="/staff/health-check/:checkId/edit" element={<PlaceholderPage title="Chỉnh sửa kiểm tra (đang phát triển)" />} />

    {/* Staff Profile Routes */}
    <Route path="/staff/profile" element={<UserProfilePage />} />
  </>
);

export default staffRoutes; 