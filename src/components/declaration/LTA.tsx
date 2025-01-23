'use client';
import React, { useState, useEffect } from 'react';
import { TextField, Typography, Button, Grid, Box, IconButton, Snackbar, Alert } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const LtaForm = ({ handleClose, rowData, debouncedFetch, formId }) => {
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    travelAmount: "",
    travelDate: "",
    location: "",
    travelMode: "",
    proof: null,
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (rowData && rowData.lta) {
      setFormData({
        travelAmount: rowData.lta.travelAmount || "",
        travelDate: rowData.lta.travelDate || "",
        location: rowData.lta.location || "",
        travelMode: rowData.lta.travelMode || "",
        proof: rowData.lta.proof || "",
      });
      if (rowData.lta.proof) {
        setPreview(rowData.lta.proof);
      }
    }
  }, [rowData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, proof: file }));

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/my-declaration/update/${formId}`;
    const formDataToSend = new FormData();

    const ltaData = {
      travelAmount: formData.travelAmount,
      travelDate: formData.travelDate,
      location: formData.location,
      travelMode: formData.travelMode
    };
    formDataToSend.append('lta', JSON.stringify(ltaData));

    if (formData.proof) {
      formDataToSend.append('file', formData.proof);
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save LTA data');
      }

      const data = await response.json();
      if (data) {
        setToastOpen(true);
        setTimeout(() => {
          handleClose();
          debouncedFetch();
        }, 1000);
      }
    } catch (error) {
      console.error('Error:', error.message);
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
          {rowData ? "Edit Leave Travel Assistance" : "Leave Travel Assistance"}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Travel Amount"
            name="travelAmount"
            value={formData.travelAmount}
            onChange={handleChange}
          />
        </Grid>

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

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Travel Mode"
            name="travelMode"
            value={formData.travelMode}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            type="file"
            InputLabelProps={{ shrink: true }}
            onChange={handleFileChange}
            inputProps={{
              accept: '.pdf,.jpg,.jpeg,.png',
            }}
          />
          {formData.proof && (
            <Typography variant="caption" color="textSecondary">
              Selected file: {formData.proof.name}
            </Typography>
          )}
          {preview && (
            <div style={{ marginTop: '10px' }}>
              <img
                src={preview}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '200px' }}
              />
            </div>
          )}
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
          {error ? `Error: ${error}` : "LTA information saved successfully!"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LtaForm;
