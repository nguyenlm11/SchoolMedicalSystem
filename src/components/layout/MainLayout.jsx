import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./navbar/Navbar";
import Footer from "./footer/Footer";

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow mt-16">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;