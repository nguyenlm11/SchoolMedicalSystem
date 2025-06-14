import React from "react";
import { Route } from "react-router-dom";
import ManagerLayout from "../components/layout/ManagerLayout";
import ParentManagement from "../pages/manager/ParentManagement";
import StudentManagement from "../pages/manager/StudentManagement";
import MedicineInventory from "../pages/manager/MedicineInventory";
import SupplyInventory from "../pages/manager/SupplyInventory";

const PlaceholderPage = ({ title }) => (
  <div className="h-full px-4 sm:px-6 lg:px-8 py-6">
    <div className="text-center text-xl font-semibold text-gray-600">{title}</div>
  </div>
);

const managerRoutes = (
  <Route element={<ManagerLayout />}>
    <Route path="/manager/dashboard" element={<PlaceholderPage title="Manager Dashboard (đang phát triển)" />} />
    <Route path="/manager/parent-management" element={<ParentManagement />} />
    <Route path="/manager/student-management" element={<StudentManagement />} />
    <Route path="/manager/medicine-inventory" element={<MedicineInventory />} />
    <Route path="/manager/supply-inventory" element={<SupplyInventory />} />
  </Route>
);

export default managerRoutes; 