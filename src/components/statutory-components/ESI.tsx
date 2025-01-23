'use client';
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const ESIForm = ({ handleClose, rowData, debouncedFetch, formId }) => {
  const [formData, setFormData] = useState({
    ESINumber: "",
    DeductionCycle: "Monthly",
    EmployeeRate: "",
    EmployerRate: "",
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (rowData && rowData.ESI) {
      setFormData({
        ESINumber: rowData.ESI.ESINumber || "",
        DeductionCycle: rowData.ESI.DeductionCycle || "",
        EmployeeRate: rowData.ESI.EmployeeRate || "",
        EmployerRate: rowData.ESI.EmployerRate || "",
      });
    }
  }, [rowData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/statutory-components/update/${formId}`;


    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ESI: formData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save HRA data');
      }

      const data = await response.json();
      if (data) {
        setToastOpen(true);
        // Delay closing the form
        setTimeout(() => {
          handleClose();
          debouncedFetch();

        }, 1000);
      }
    } catch (error) {
      console.error("Error:", error.message);
      setError(error.message);
      setToastOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToastClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setToastOpen(false);
  };

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {rowData ? "Edit Employees' State Insurance" : "Employees' State Insurance"}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="ESI Number"
            name="ESINumber"
            value={formData.ESINumber}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Deduction Cycle"
            name="DeductionCycle"
            value={formData.DeductionCycle}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Employee Rate (%)"
            name="EmployeeRate"
            value={formData.EmployeeRate}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Employer Rate  (%)"
            name="EmployerRate"
            value={formData.EmployerRate}
            onChange={handleChange}
          />
        </Grid>


        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : (rowData ? "Update" : "Save")}
          </Button>
        </Grid>
      </Grid>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleToastClose}
          severity={error ? "error" : "success"}
          sx={{ width: '100%' }}
        >
          {error ? `Error: ${error}` : "ESI information saved successfully!"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ESIForm;
