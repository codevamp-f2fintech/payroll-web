'use client'

import { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid'
import SalaryPackage from '@/views/dashboard/SalaryPackage';
import OfferLetter from '@/views/dashboard/OfferLetter';
import IncrementLetter from '@/views/dashboard/IncrementLetter';
import WarningLetter from '@/views/dashboard/WarningLetter';
// import PaymentHistory from '@/views/dashboard/PaymentHistory';
import AdminDashboard from '@/views/dashboard/AdminDashboard';
import PaymentHistory from '@/views/dashboard/IncrementLetter';

const DashboardAnalytics = () => {
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    if (userRole === "") {
      // Get user data from localStorage
      const user = JSON.parse(localStorage.getItem("user") || '{}');
      setUserRole(user.role || ""); // Fallback to an empty string if role is not found
    }
  }, [userRole]);

  return (
    <Grid container spacing={6}>
      {userRole === '1' ? (
        // Render Admin Dashboard if userRole is '1'
        <Grid item xs={12}>
          <AdminDashboard />
        </Grid>
      ) : (
        // Render other components for other roles
        <>
          <Grid item xs={12} md={6}>
            <SalaryPackage />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <OfferLetter />
          </Grid>
          <Grid item xs={12} md={5} lg={5}>
            <PaymentHistory />
          </Grid>
          <Grid item xs={12} md={7} lg={7}>
            <WarningLetter />
          </Grid>
          {/* Add any additional components below */}
        </>
      )}
    </Grid>
  );
};

export default DashboardAnalytics;
