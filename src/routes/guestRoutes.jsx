import React from "react";
import { Route } from "react-router-dom";
import HomePage from "../components/home/HomePage";
import BlogPage from "../pages/blog/BlogPage";
import BlogDetailPage from "../pages/blog/BlogDetailPage";

const guestRoutes = (
  <>
    <Route path="/" element={<HomePage />} />
    <Route path="/blog" element={<BlogPage />} />
    <Route path="/blog/:id" element={<BlogDetailPage />} />
  </>
);

export default guestRoutes; 