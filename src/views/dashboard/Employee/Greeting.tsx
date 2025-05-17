'use client';

import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, CircularProgress, Grid } from '@mui/material';

const GreetingSummary = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userString = localStorage.getItem('user');
        const user = JSON.parse(userString || '{}');

        if (user.id) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/employees/get/${user.id}`);

          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }

          const data = await response.json();
          setEmployeeData(data.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Format the current date
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  if (loading) {
    return (
      <Box
        sx={{
          flex: 1,
          p: 2,
          bgcolor: '#F8F9FB',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px'
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          flex: 1,
          p: 2,
          bgcolor: '#F8F9FB',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px'
        }}
      >
        <Typography sx={{ color: 'error.main', fontWeight: 500, fontSize: '1rem' }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, p: 2, }}>
      <Card
        sx={{
          borderRadius: 3,
          p: 2,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                mb: 0.5
              }}
            >
              {getCurrentGreeting()}{employeeData ? `, ${employeeData.first_name} ${employeeData.last_name}` : ''} 👋
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#666666' }}
            >
              Welcome to your dashboard
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              variant="body2"
              sx={{
                color: '#666666',
                fontWeight: 500,
                bgcolor: '#F0F4F8',
                px: 1.25,
                py: 0.5,
                borderRadius: 4
              }}
            >
              {formattedDate}
            </Typography>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default GreetingSummary;
