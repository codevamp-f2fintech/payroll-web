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

const BasicInfoForm = ({ handleClose, isEditMode = false, setformId }) => {


  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    address: "",
    pan: "",
    financialYear: "",
  });

  const [employeeId, setEmployeeId] = useState("");
  const [toastOpen, setToastOpen] = useState(false);

  console.log('employee', employeeId)
  // Load employeeId from local storage on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    setEmployeeId(user.id);


  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/my-declaration/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          basicInfo: formData,
          employeeId, //   Include employeeId here
        }),
      });

      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Forms submitted successfully!", data);
      setformId(data._id);

    } catch (error) {
      console.error("Error submitting forms:", error);
    }
    setToastOpen(true);
    handleClose();
  };

  const handleToastClose = () => {
    setToastOpen(false);
  };

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {isEditMode ? "Edit Basic Information" : "Basic Information"}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Name - Required */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </Grid>

        {/* Designation */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
          />
        </Grid>

        {/* PAN - Required */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Permanent Account Number (PAN)"
            name="pan"
            value={formData.pan}
            onChange={handleChange}
          />
        </Grid>

        {/* Financial Year */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Financial Year"
            name="financialYear"
            value={formData.financialYear}
            onChange={handleChange}
            placeholder="e.g., 2024-2025"
          />
        </Grid>

        {/* Address */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            multiline
            rows={3}
          />
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Save
          </Button>
        </Grid>
      </Grid>

      {/* Toast Notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleToastClose} severity="success" sx={{ width: '100%' }}>
          Basic Information saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BasicInfoForm;
