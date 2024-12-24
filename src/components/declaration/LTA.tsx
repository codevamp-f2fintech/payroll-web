'use client';
import React, { useState, useEffect } from 'react';
import { TextField, Typography, Button, Grid, Box, IconButton, Snackbar, Alert } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from "react-redux";

const LtaForm = ({ handleClose, isEditMode = false, formId }) => {
  const dispatch = useDispatch();

  // Fetch existing LTA data from Redux store

  const [formData, setFormData] = useState({
    travelAmount: "",
    travelDate: "",
    location: "",
    travelMode: "",
    proof: null,
  });

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
        { lta: formData }
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
          {isEditMode ? "Edit Leave Travel Assistance" : "Leave Travel Assistance"}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Travel Amount */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Travel Amount"
            name="travelAmount"
            value={formData.travelAmount}
            onChange={handleChange}
          />
        </Grid>

        {/* Travel Date */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="date"
            label="Travel Date"
            name="travelDate"
            value={formData.travelDate}
            InputLabelProps={{ shrink: true }}
            onChange={handleChange}
          />
        </Grid>

        {/* Location */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </Grid>

        {/* Travel Mode */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Travel Mode"
            name="travelMode"
            value={formData.travelMode}
            onChange={handleChange}
          />
        </Grid>

        {/* Proof of Travel */}
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
          <Button fullWidth variant="contained" color="primary" onClick={handleSubmit}>
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
          LTA information saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LtaForm;
