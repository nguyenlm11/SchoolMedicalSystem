import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import MainLayout from "./components/layout/MainLayout";
import { authRoutes, adminRoutes, managerRoutes, parentRoutes, studentRoutes, staffRoutes, guestRoutes } from "./routes";

function App() {
  return (
    <div>
      <Routes>
        {authRoutes}
        {adminRoutes}
        {managerRoutes}
        <Route element={<MainLayout />}>
          {guestRoutes}
          {parentRoutes}
          {studentRoutes}
          {staffRoutes}
        </Route>
      </Routes>
    </div>
  );
}

export default App;