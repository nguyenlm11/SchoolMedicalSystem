import React from "react";
import { useAuth } from "../../utils/AuthContext";
import UnauthorizedPage from "../../pages/auth/UnauthorizedPage";
import MainLayout from "./MainLayout";

const StaffLayout = () => {
    const { user, hasRole, ROLES } = useAuth();

    if (!hasRole(ROLES.SCHOOLNURSE)) {
        return <UnauthorizedPage currentRole={user?.role} />;
    }

    return <MainLayout />;
};

export default StaffLayout; 