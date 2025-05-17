'use client'

import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import SuperAdminDashboard from '@/views/dashboard/SuperAdmin'
import PayrollCostSummary from '@/views/dashboard/PayrollSummary'
import PayrollDashboard from '@/views/dashboard/Admin/PayrollDetails'
import AttendanceDetails from '@/views/dashboard/Admin/AttendanceDetails'
import AttendanceSummary from '@/views/dashboard/Employee/Attendance'
import LoansDetails from '@/views/dashboard/Admin/LoanDetails'
import ReimbursementDetails from '@/views/dashboard/Admin/ReimbursementDetails'
import DeclarationDetails from '@/views/dashboard/Admin/DeclarationDetails'
import DeclarationSummary from '@/views/dashboard/Employee/Declaration'
import GreetingSummary from '@/views/dashboard/Employee/Greeting'
import PayrollSummary from '@/views/dashboard/Employee/Payroll'
import Greeting from '@/views/dashboard/Admin/Greeting'
const DashboardAnalytics = () => {
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    if (userRole === "") {
      // Get user data from localStorage
      const user = JSON.parse(localStorage.getItem("user") || '{}')
      setUserRole(user.role || "") // Fallback to an empty string if role is not found
    }
  }, [userRole])

  const renderDashboard = () => {
    switch (userRole) {
      case '0':
        return (
          <Grid item xs={12}>
            <SuperAdminDashboard />
          </Grid>
        )
      case '1':
        return (
          <><Grid item xs={12}>
            <Greeting />
            <PayrollDashboard />
            <AttendanceDetails />
            <LoansDetails />
            <ReimbursementDetails />
            <DeclarationDetails />
          </Grid>

          </>
        )
      default:
        return (
          <>
            <Grid item xs={12}>
              <GreetingSummary />
              <PayrollSummary />
              <AttendanceSummary />
              <DeclarationSummary />
            </Grid>
          </>
        )
    }
  }

  return (
    <Grid container spacing={6}>
      {renderDashboard()}
    </Grid>
  )
}

export default DashboardAnalytics
