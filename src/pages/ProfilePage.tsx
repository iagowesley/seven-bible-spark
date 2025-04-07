
import React from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const ProfilePage: React.FC = () => {
  // Now that we've removed authentication, redirect to the About page
  return <Navigate to="/sobre" replace />;
};

export default ProfilePage;
