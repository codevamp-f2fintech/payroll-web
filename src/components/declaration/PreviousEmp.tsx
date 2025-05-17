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
  Alert
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { utility } from "@/utility";

const PreviousEmp = ({ handleClose, setformId, rowData, taxRegime, debouncedFetch, declaration = [] }) => {
  const { setLocalStorage } = utility();
  const { company_id } = typeof window !== "undefined" ? JSON.parse(localStorage.getItem('user')) : {};

  const [formData, setFormData] = useState({
    previousSalary: "",
    pf: "",
    totalTax: "",
  });
  const [employeeId, setEmployeeId] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setEmployeeId(user.id);
  }, []);

  useEffect(() => {
    if (rowData && rowData.PreviousEmp
    ) {
      setFormData({
        previousSalary: rowData.PreviousEmp.previousSalary || "",
        pf: rowData.PreviousEmp.pf || "",
        totalTax: rowData.PreviousEmp.totalTax || "",
        company_id: rowData.PreviousEmp.company_id || ''
      });
    }
  }, [rowData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const method = declaration ? "PUT" : "POST";
      const url = declaration
        ? `${process.env.NEXT_PUBLIC_APP_URL}/my-declaration/update/${declaration}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/my-declaration/create`;

      const payload = {
        company_id,
        PreviousEmp: formData,
        employeeId,
        taxRegime
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
          {rowData ? "Edit Previous Employment tax Details" : "Previous Employment tax Details"}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>


        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            type="number"
            label="Previous Salary"
            name="previousSalary"
            value={formData.previousSalary}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            required
            label="Total tax"
            name="totalTax"
            value={formData.totalTax}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            label="pf"
            name="pf"
            value={formData.pf}
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
          {error ? `Error: ${error}` : "Previous Employment tax Details!"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PreviousEmp
  ;
