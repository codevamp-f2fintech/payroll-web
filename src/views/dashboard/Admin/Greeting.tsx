import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  CircularProgress,
  Alert
} from "@mui/material";
import { employeesCountResponse } from "@/utility/apiResponse/employeesResponse";
import GroupIcon from '@mui/icons-material/Group';

const Greeting = () => {
  const [totalEmployeesCount, setTotalEmployeesCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchEmployeeCount(),
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const fetchEmployeeCount = async () => {
    try {
      const count = await employeesCountResponse();
      setTotalEmployeesCount(count);
    } catch (error) {
      console.error("Failed to fetch employee count:", error);
    }
  };

  // Get current time for greeting
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <Box sx={{ padding: 2, minHeight: "20vh" }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          py: 1
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", }}>
            Hello Admin! 👋
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
            {getCurrentGreeting()}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Dashboard Summary */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              mb: 1.5,
              mt: 1
            }}
          >
            Overview
          </Typography>

          {/* Employee Card */}
          <Card
            sx={{
              mb: 2,
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                backgroundColor: "#4A6FDC",
                borderTopLeftRadius: 3,
                borderBottomLeftRadius: 3
              }
            }}
          >
            <CardContent sx={{
              display: "flex",
              alignItems: "center",
              padding: "16px !important"
            }}>
              <Avatar
                sx={{
                  bgcolor: "#F5F7FF",
                  width: 35,
                  height: 35,
                  mr: 1
                }}
              >
                <GroupIcon fontSize="small" sx={{ color: '#4A6FDC' }} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">
                  Total Employees
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold", }}>
                {totalEmployeesCount}
              </Typography>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default Greeting;
