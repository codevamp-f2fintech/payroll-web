'use client';
import React, { useState } from "react";
import { Box, Button, Grid, IconButton, TextField, Typography, Snackbar, Alert } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from "react-redux";

const Deductions = ({ handleClose, formId }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    interestPayable: "",
    lenderName: "",
    lenderAddress: "",
    lenderPan: "",
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
        { deductions: formData }
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
      {/* Form Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Deduction of Interest on Borrowing
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Form Fields */}
      <Grid container spacing={3}>
        {/* Interest Payable */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Interest Payable"
            name="interestPayable"
            value={formData.interestPayable}
            onChange={handleChange}
            placeholder="Enter interest amount"
          />
        </Grid>

        {/* Lender Name */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Lender's Name"
            name="lenderName"
            value={formData.lenderName}
            onChange={handleChange}
            placeholder="Enter lender's name"
          />
        </Grid>

        {/* Lender Address */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Lender's Address"
            name="lenderAddress"
            value={formData.lenderAddress}
            onChange={handleChange}
            multiline
            rows={3}
            placeholder="Enter lender's address"
          />
        </Grid>

        {/* Lender PAN */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Lender's PAN (Optional)"
            name="lenderPan"
            value={formData.lenderPan}
            onChange={handleChange}
            placeholder="ABCDE1234F"
          />
        </Grid>

        {/* Proof of Interest Payment */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="file"
            InputLabelProps={{ shrink: true }}
            onChange={handleFileChange}
          />
        </Grid>

        {/* Save Button */}
        <Grid item xs={12} display="flex" justifyContent="center">
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
          Deduction information saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Deductions;
