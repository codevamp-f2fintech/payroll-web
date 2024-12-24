'use client';
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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

const HraForm = ({ handleClose, isEditMode = false, formId }) => {
  const dispatch = useDispatch();

  // Fetch existing HRA data from Redux store

  const [formData, setFormData] = useState({
    houseRent: "",
    landlordName: "",
    landlordAddress: "",
    proof: null,
  });

  console.log('formid', formId)
  const [toastOpen, setToastOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, proof: e.target.files[0] }));
  };

  const handleSubmit = () => {

    const method = formId ? 'PUT' : "";
    const url = formId
      ? `${process.env.NEXT_PUBLIC_APP_URL}/my-declaration/update/${formId}` : "";


    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        { hra: formData }
      ),
    })
      .then(response => response.json())
      .then(data => {
        console.log("data>>>", data);
        if (data) {
          handleClose();

          // toast.success(payroll ? "Payroll Successfully Updated" : "Payroll Successfully Created")
        } else {
          // toast.error('Unexpected error occurred');
        }
      })
      .catch(error => {
        // toast.error('Error: ' + error.message);
      });

  };

  const handleToastClose = () => {
    setToastOpen(false);
  };

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {isEditMode ? "Edit House Rent Allowance" : "House Rent Allowance"}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* House Rent */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Rent of House"
            name="houseRent"
            value={formData.houseRent}
            onChange={handleChange}
          />
        </Grid>

        {/* Landlord Name */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Name of Landlord"
            name="landlordName"
            value={formData.landlordName}
            onChange={handleChange}
          />
        </Grid>

        {/* Landlord Address */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            name="landlordAddress"
            value={formData.landlordAddress}
            onChange={handleChange}
            multiline
            rows={3}
          />
        </Grid>

        {/* Proof */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="file"
            InputLabelProps={{ shrink: true }}
            onChange={handleFileChange}
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
          HRA information saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HraForm;
