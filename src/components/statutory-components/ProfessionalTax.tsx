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

const ProfessionalTaxForm = ({ handleClose, rowData, debouncedFetch, formId }) => {
  const [formData, setFormData] = useState({
    ProfTaxNumber: "",
    DeductionCycle: "Monthly",
    EmployeeDeduction: "",
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (rowData && rowData.ProfessionalTax) {
      setFormData({
        ProfTaxNumber: rowData.ProfessionalTax.ProfTaxNumber || "",
        DeductionCycle: rowData.ProfessionalTax.DeductionCycle || "",
        EmployeeDeduction: rowData.ProfessionalTax.EmployeeDeduction || "",
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
          ProfessionalTax: formData
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
          {rowData ? "Edit Professional Tax" : "Professional Tax"}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="PT Number"
            name="ProfTaxNumber"
            value={formData.ProfTaxNumber}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
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
            type="number"
            label="Deduction amount"
            name="EmployeeDeduction"
            value={formData.EmployeeDeduction}
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
          {error ? `Error: ${error}` : "ProfessionalTax information saved successfully!"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfessionalTaxForm;
