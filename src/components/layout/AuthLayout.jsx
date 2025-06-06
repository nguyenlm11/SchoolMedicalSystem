import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
    return (
        <div className="min-h-screen w-screen overflow-hidden">
            <Outlet />
        </div>
    );
};

export default AuthLayout;