import React from "react";
import { Route } from "react-router-dom";
import HomePage from "../components/home/HomePage";
import BlogPage from "../pages/blog/BlogPage";

const guestRoutes = (
  <>
    <Route path="/" element={<HomePage />} />
    <Route path="/blog" element={<BlogPage />} />
  </>
);

export default guestRoutes; 