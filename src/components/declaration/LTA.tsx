'use client';
import React, { useState, useEffect } from 'react';
import { TextField, Typography, Button, Grid, Box, IconButton, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const LtaForm = ({ handleClose, rowData, debouncedFetch, proofEnable, formId, userRole }) => {
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    travelAmount: "",
    travelDate: "",
    location: "",
    travelMode: "",
    status: 'pending',
    description: "",
    proof: null,
  });

  const [touched, setTouched] = useState({});
  const [toastOpen, setToastOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState({
    travelAmount: "",
    travelDate: "",
    location: "",
    travelMode: "",
    status: "",
    description: "",
    proof: "",
    form: null
  });

  useEffect(() => {
    if (rowData && rowData.lta) {
      setFormData({
        travelAmount: rowData.lta.travelAmount || "",
        travelDate: rowData.lta.travelDate || "",
        location: rowData.lta.location || "",
        travelMode: rowData.lta.travelMode || "",
        status: rowData.lta.status || "pending",
        description: rowData.lta.description || "",
        proof: rowData.lta.proof || null,
      });
      if (rowData.lta.proof) {
        setPreview(rowData.lta.proof);
      }
    }
  }, [rowData]);

  const validateField = (name, value) => {
    let fieldError = "";
    switch (name) {
      case "travelAmount":
        if (!value) fieldError = "Travel amount is required";
        else if (value <= 0) fieldError = "Travel amount must be greater than 0";
        break;
      case "travelDate":
        if (!value) fieldError = "Travel date is required";
        const selectedDate = new Date(value);
        const today = new Date();
        if (selectedDate > today) fieldError = "Travel date cannot be in the future";
        break;
      case "location":
        if (!value) fieldError = "Location is required";
        else if (value.length < 3) fieldError = "Location must be at least 3 characters";
        break;
      case "travelMode":
        if (!value) fieldError = "Travel mode is required";
        else if (value.length < 3) fieldError = "Travel mode must be at least 3 characters";
        break;
      case "description":
        if (userRole === '1' && !value) fieldError = "Description is required";
        break;
      case "proof":
        if (proofEnable === 'true' && !value && !preview) fieldError = "Proof document is required";
        break;
    }
    return fieldError;
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, formData[name]);
    setError(prev => ({ ...prev, [name]: fieldError }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setError(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, proof: file }));
      setError(prev => ({ ...prev, proof: "" }));

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

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(field => {
      const fieldError = validateField(field, formData[field]);
      if (fieldError) {
        newErrors[field] = fieldError;
        isValid = false;
      }
    });

    setError(prev => ({ ...prev, ...newErrors }));
    setTouched(Object.keys(formData).reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setToastOpen(true);
      setError(prev => ({ ...prev, form: "Please fill all required fields correctly" }));
      return;
    }

    setIsSubmitting(true);
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/my-declaration/update/${formId}`;
    const formDataToSend = new FormData();

    const ltaData = {
      travelAmount: formData.travelAmount,
      travelDate: formData.travelDate,
      location: formData.location,
      status: formData.status,
      travelMode: formData.travelMode,
      description: formData.description
    };
    formDataToSend.append('lta', JSON.stringify(ltaData));

    if (formData.proof instanceof File) {
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
      setError(prev => ({ ...prev, form: error.message }));
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
            required
            type='number'
            label="Travel Amount"
            name="travelAmount"
            value={formData.travelAmount}
            onChange={handleChange}
            onBlur={() => handleBlur('travelAmount')}
            error={Boolean(touched.travelAmount && error.travelAmount)}
            helperText={touched.travelAmount && error.travelAmount}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            type="date"
            label="Travel Date"
            name="travelDate"
            value={formData.travelDate}
            InputLabelProps={{ shrink: true }}
            onChange={handleChange}
            onBlur={() => handleBlur('travelDate')}
            error={Boolean(touched.travelDate && error.travelDate)}
            helperText={touched.travelDate && error.travelDate}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            onBlur={() => handleBlur('location')}
            error={Boolean(touched.location && error.location)}
            helperText={touched.location && error.location}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Travel Mode"
            name="travelMode"
            value={formData.travelMode}
            onChange={handleChange}
            onBlur={() => handleBlur('travelMode')}
            error={Boolean(touched.travelMode && error.travelMode)}
            helperText={touched.travelMode && error.travelMode}
          />
        </Grid>

        {userRole === '1' ? (
          <>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name='status'
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Description/Comments"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={() => handleBlur('description')}
                error={Boolean(touched.description && error.description)}
                helperText={touched.description && error.description}
                multiline
                rows={3}
              />
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <FormControl fullWidth disabled>
              <InputLabel>Status</InputLabel>
              <Select value={formData.status} label="Status">
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {proofEnable && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              type="file"
              label="Upload Proof"
              InputLabelProps={{ shrink: true }}
              onChange={handleFileChange}
              onBlur={() => handleBlur('proof')}
              error={Boolean(touched.proof && error.proof)}
              helperText={touched.proof && error.proof}
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
        )}

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
          severity={error.form ? "error" : "success"}
          sx={{ width: '100%' }}
        >
          {error.form ? `Error: ${error.form}` : "LTA information saved successfully!"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LtaForm;
