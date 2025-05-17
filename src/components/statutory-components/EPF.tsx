'use client'
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
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { utility } from "@/utility";

const EPFForm = ({ handleClose, setformId, rowData, debouncedFetch, declaration = [] }) => {
  const { setLocalStorage } = utility();
  const [formData, setFormData] = useState({
    EPFNumber: "",
    DeductionCycle: "Monthly",
    EmployeeRate: "",
    EmployerRate: "",
    IncludedInCTC: false,
    isPFWageLessThan15K: "",
  });
  const [company_id, setCompany_id] = useState('')
  const [employeeId, setEmployeeId] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const companyId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem('user')) : {};
    setEmployeeId(user.id);
    setCompany_id(companyId.company_id)
  }, []);

  useEffect(() => {
    if (rowData && rowData.EPF) {
      setFormData({
        EPFNumber: rowData.EPF.EPFNumber || "",
        DeductionCycle: rowData.EPF.DeductionCycle || "",
        EmployeeRate: rowData.EPF.EmployeeRate || "",
        EmployerRate: rowData.EPF.EmployerRate || "",
        IncludedInCTC: rowData.EPF.IncludedInCTC || false,
        isPFWageLessThan15K: rowData.EPF.isPFWageLessThan15K || "",

      });
    }
  }, [rowData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const method = declaration ? "PUT" : "POST";
      const url = declaration
        ? `${process.env.NEXT_PUBLIC_APP_URL}/statutory-components/update/${declaration}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/statutory-components/create`;

      const payload = {
        EPF: formData,
        employeeId,
        company_id
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!declaration && data.data._id) {
        setformId(data.data._id);
        setLocalStorage('formId', data.data._id);
      }

      setToastOpen(true);

      // Delay closing the form to allow toast to be visible
      setTimeout(() => {
        handleClose();
        debouncedFetch();
      }, 1000);

    } catch (error) {
      console.error("Error submitting form:", error);
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
          {rowData ? "Edit Employees' Provident Fund  " : "Employees' Provident Fund "}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>


        <Grid item xs={12}>
          <TextField
            fullWidth
            label="EPF Number"
            name="EPFNumber"
            value={formData.EPFNumber}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            required
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
            required
            label="Employee Contribution Rate"
            name="EmployeeRate"
            value={formData.EmployeeRate}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            required
            label="Employer Contribution Rate"
            name="EmployerRate"
            value={formData.EmployerRate}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name="IncludedInCTC"
                checked={formData.IncludedInCTC}
                onChange={handleChange}
              />
            }
            label="Employer's contribution is included in the CTC"
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body1" gutterBottom>
            When PF wage is less than ₹15,000:
          </Typography>
          <RadioGroup
            row
            name="isPFWageLessThan15K"
            value={formData.isPFWageLessThan15K}
            onChange={handleChange}
          >
            <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
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
          {error ? `Error: ${error}` : "EPF Information saved successfully!"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EPFForm;
