import React from "react";
import { Route } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
// import UserManagement from "../pages/admin/UserManagement/index";
import UserList from "../pages/admin/UserList";
import StaffProfilePage from "../pages/admin/StaffProfilePage";
const adminRoutes = (
  <Route element={<AdminLayout />}>
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/admin/users" element={<UserList />}>
      <Route index element={<UserList />} />
    </Route>
    <Route path="/admin/users/:id" element={<StaffProfilePage />} />
  </Route>
);

export default adminRoutes; 