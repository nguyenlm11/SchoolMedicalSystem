import React from "react";
import { useAuth } from "../../utils/AuthContext";
import UnauthorizedPage from "../../pages/auth/UnauthorizedPage";
import MainLayout from "./MainLayout";

const ParentLayout = () => {
    const { user, hasRole, ROLES } = useAuth();

    if (!hasRole(ROLES.PARENT)) {
        return <UnauthorizedPage currentRole={user?.role} />;
    }

    return <MainLayout />;
};

export default ParentLayout; 