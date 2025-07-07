import React from "react";
import { useAuth } from "../../utils/AuthContext";
import UnauthorizedPage from "../../pages/auth/UnauthorizedPage";
import MainLayout from "./MainLayout";

const StudentLayout = () => {
    const { user, hasRole, ROLES } = useAuth();

    if (!hasRole(ROLES.STUDENT)) {
        return <UnauthorizedPage currentRole={user?.role} />;
    }

    return <MainLayout />;
};

export default StudentLayout; 