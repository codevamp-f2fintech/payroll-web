"use client"
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, differenceInDays } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import { fetchConfiguration } from '@/redux/features/configuration/configurationSlice';
import { RootState } from '@/redux/store';

const WindowConfiguration = () => {
  const dispatch = useDispatch();
  const { configration, error } = useSelector((state: RootState) => state.configration);
  const [enableDeclarations, setEnableDeclarations] = useState(true);
  const [enableProof, setEnableProof] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 86400000));
  const [proofStartDate, setProofStartDate] = useState(new Date());
  const [proofEndDate, setProofEndDate] = useState(new Date(Date.now() + 7 * 86400000));
  const [isLoading, setIsLoading] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [dataId, setDataId] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (configration?.data?.[0]?._id) {
      setDataId(configration?.data?.[0]?._id);
    }
  }, [configration, isLoading, dataId]);

  useEffect(() => {
    // In web app, we'll get the company ID from localStorage instead of AsyncStorage
    const getCompanyId = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setCompanyId(user.company_id);
        }
      } catch (error) {
        console.error("Error getting company ID:", error);
        showAlert("Error getting company information", "error");
      }
    };

    getCompanyId();
  }, []);

  const debouncedFetch = useCallback(
    debounce(() => {
      dispatch(fetchConfiguration());
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFetch();
    return debouncedFetch.cancel;
  }, [debouncedFetch]);

  useEffect(() => {
    const fetchData = async () => {
      if (!dataId) {
        return;
      }
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/window-configration/get/${dataId}`
        );
        const data = await response.json();

        if (data && data.data) {
          const config = data.data;
          setEnableDeclarations(config.declarationEnabled);
          setEnableProof(config.proofEnabled);
          setStartDate(new Date(config.startDate));
          setEndDate(new Date(config.endDate));
          setProofStartDate(new Date(config.proofStartDate));
          setProofEndDate(new Date(config.proofEndDate));
        }
      } catch (error) {
        console.error("Error fetching configuration:", error);
        showAlert("Failed to load configuration", "error");
      }
    };

    fetchData();
  }, [dataId]);

  // Fixed formatDate function
  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid date';
    }
    try {
      return format(date, 'd MMMM, yyyy'); // Fixed format string
    } catch (error) {
      console.error("Date formatting error:", error);
      return 'Error formatting date';
    }
  };

  const handleStartDateChange = (newDate) => {
    if (newDate && !isNaN(newDate.getTime())) {
      setStartDate(newDate);
      if (newDate > endDate) {
        const newEndDate = new Date(newDate);
        newEndDate.setDate(newDate.getDate() + 30);
        setEndDate(newEndDate);
      }
    }
  };

  const handleEndDateChange = (newDate) => {
    if (!newDate || isNaN(newDate.getTime())) {
      return;
    }

    if (newDate > startDate) {
      setEndDate(newDate);
    } else {
      showAlert("End date must be after start date", "error");
    }
  };

  const handleProofStartDateChange = (newDate) => {
    if (!newDate || isNaN(newDate.getTime())) {
      return;
    }

    setProofStartDate(newDate);
    if (newDate > proofEndDate) {
      const newEnd = new Date(newDate);
      newEnd.setDate(newDate.getDate() + 7);
      setProofEndDate(newEnd);
    }
  };

  const handleProofEndDateChange = (newDate) => {
    if (!newDate || isNaN(newDate.getTime())) {
      return;
    }

    if (newDate > proofStartDate) {
      setProofEndDate(newDate);
    } else {
      showAlert("Proof end date must be after start date", "error");
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const saveConfiguration = async () => {
    setIsLoading(true);
    try {
      const method = dataId ? "PUT" : "POST";
      const url = dataId
        ? `${process.env.NEXT_PUBLIC_APP_URL}/window-configration/update/${dataId}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/window-configration/create`;

      const configuration = {
        declarationEnabled: enableDeclarations,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        company_id: companyId,
      };

      if (enableProof) {
        configuration.proofEnabled = true;
        configuration.proofStartDate = proofStartDate.toISOString();
        configuration.proofEndDate = proofEndDate.toISOString();
      } else {
        configuration.proofEnabled = false;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configuration),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.message) {
        showAlert(data.message);
        debouncedFetch();
      } else {
        showAlert(data.message || "Unexpected error occurred", "error");
      }
    } catch (error) {
      console.error("API Error:", error);
      showAlert(error.message || "Failed to save configuration", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Safe calculation of difference in days
  const calculateDaysDifference = (end, start) => {
    if (!end || !start ||
      !(end instanceof Date) || !(start instanceof Date) ||
      isNaN(end.getTime()) || isNaN(start.getTime())) {
      return 0;
    }

    try {
      return differenceInDays(end, start);
    } catch (error) {
      console.error("Error calculating days difference:", error);
      return 0;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', py: 4, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Declaration Period Configuration
      </Typography>

      <Box component="form" noValidate autoComplete="off">
        {/* Declaration Period Toggle */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={enableDeclarations}
                onChange={(e) => setEnableDeclarations(e.target.checked)}
                color="primary"
              />
            }
            label="Enable Declaration Period"
          />
        </Paper>

        {/* Declaration Date Section */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 3,
            opacity: enableDeclarations ? 1 : 0.6,
            pointerEvents: enableDeclarations ? 'auto' : 'none'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Declaration Date Range
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  minDate={new Date()}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      placeholder: 'DD/MM/YYYY',
                      InputLabelProps: {
                        shrink: true,
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  minDate={startDate}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      placeholder: 'DD/MM/YYYY',
                      InputLabelProps: {
                        shrink: true,
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Paper>

        {/* Proof Submitting Toggle */}
        <Paper elevation={2} sx={{
          p: 3,
          mb: 3,
          opacity: enableDeclarations ? 1 : 0.6,
          pointerEvents: enableDeclarations ? 'auto' : 'none'
        }}>
          <FormControlLabel
            control={
              <Switch
                checked={enableProof}
                onChange={(e) => setEnableProof(e.target.checked)}
                color="primary"
                disabled={!enableDeclarations}
              />
            }
            label="Enable Proof Submitting"
          />
        </Paper>

        {/* Proof Submit Section */}
        <Paper elevation={2} sx={{
          p: 3,
          mb: 3,
          opacity: (enableDeclarations && enableProof) ? 1 : 0.6,
          pointerEvents: (enableDeclarations && enableProof) ? 'auto' : 'none'
        }}>
          <Typography variant="h6" gutterBottom>
            Proof Submit Date Range
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={proofStartDate}
                  onChange={handleProofStartDateChange}
                  minDate={startDate}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      placeholder: 'DD/MM/YYYY',
                      InputLabelProps: {
                        shrink: true,
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={proofEndDate}
                  onChange={handleProofEndDateChange}
                  minDate={proofStartDate}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      placeholder: 'DD/MM/YYYY',
                      InputLabelProps: {
                        shrink: true,
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Paper>

        {/* Summary Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#0056b3' }}>
            Configuration Summary
          </Typography>

          <Box sx={{ my: 2 }}>
            <Grid container spacing={1}>
              <Grid item xs={4} sm={3}>
                <Typography variant="subtitle1" fontWeight="600"> Declaration Status:</Typography>
              </Grid>
              <Grid item xs={8} sm={9}>
                <Typography
                  variant="body1"
                  color={enableDeclarations ? "success.main" : "error.main"}
                >
                  {enableDeclarations ? "Enabled" : "Disabled"}
                </Typography>
              </Grid>
            </Grid>

            {enableDeclarations && (
              <>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={1}>
                  <Grid item xs={4} sm={3}>
                    <Typography variant="subtitle1" fontWeight="600">Declaration Period:</Typography>
                  </Grid>
                  <Grid item xs={8} sm={9}>
                    <Typography variant="body1">
                      {formatDate(startDate)} to {formatDate(endDate)}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />
                <Grid container spacing={1}>
                  <Grid item xs={4} sm={3}>
                    <Typography variant="subtitle1" fontWeight="600">Period Duration:</Typography>
                  </Grid>
                  <Grid item xs={8} sm={9}>
                    <Typography variant="body1">
                      {calculateDaysDifference(endDate, startDate)} days
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 1 }} /> {/* Add this divider to separate duration and status */}
                <Grid container spacing={1}>
                  <Grid item xs={4} sm={3}>
                    <Typography variant="subtitle1" fontWeight="600"> Proof Submit Status:</Typography>
                  </Grid>
                  <Grid item xs={8} sm={9}>
                    <Typography
                      variant="body1"
                      color={enableProof ? "success.main" : "error.main"}
                    >
                      {enableProof ? "Enabled" : "Disabled"}
                    </Typography>
                  </Grid>
                </Grid>

                {enableProof && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={4} sm={3}>
                        <Typography variant="subtitle1" fontWeight="600">Proof Submit Period:</Typography>
                      </Grid>
                      <Grid item xs={8} sm={9}>
                        <Typography variant="body1">
                          {formatDate(proofStartDate)} to {formatDate(proofEndDate)}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={4} sm={3}>
                        <Typography variant="subtitle1" fontWeight="600">Proof Duration:</Typography>
                      </Grid>
                      <Grid item xs={8} sm={9}>
                        <Typography variant="body1">
                          {calculateDaysDifference(proofEndDate, proofStartDate)} days
                        </Typography>
                      </Grid>
                    </Grid>
                  </>
                )}
              </>
            )}
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            onClick={saveConfiguration}
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
            sx={{ minWidth: 200 }}
          >
            {isLoading
              ? dataId ? "Updating..." : "Creating..."
              : dataId ? "Update Configuration" : "Create Configuration"}
          </Button>
        </Box>
      </Box>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WindowConfiguration;
