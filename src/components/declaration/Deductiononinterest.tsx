'use client';
import React, { useEffect, useState } from "react";
import { Box, Button, Grid, IconButton, TextField, Typography, Snackbar, Alert, FormControl, FormHelperText, MenuItem, InputLabel, Select } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const HouseLoanInterest = ({ handleClose, formId, debouncedFetch, proofEnable, rowData, userRole }) => {
  const [preview, setPreview] = useState(null);
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    interestPayable: "",
    lenderName: "",
    lenderAddress: "",
    lenderPan: "",
    status: 'pending',
    description: "",
    approvedAmount: "",
    proof: null,
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState({
    interestPayable: "",
    lenderName: "",
    lenderAddress: "",
    lenderPan: "",
    status: "",
    description: "",
    approvedAmount: "",
    proof: "",
    form: null
  });

  useEffect(() => {
    if (rowData && rowData.HouseLoanInterest) {
      setFormData({
        interestPayable: rowData.HouseLoanInterest.interestPayable || "",
        lenderName: rowData.HouseLoanInterest.lenderName || "",
        lenderAddress: rowData.HouseLoanInterest.lenderAddress || "",
        lenderPan: rowData.HouseLoanInterest.lenderPan || "",
        status: rowData.HouseLoanInterest.status || "pending",
        description: rowData.HouseLoanInterest.description || "",
        approvedAmount: rowData.HouseLoanInterest.approvedAmount || "",
        proof: rowData.HouseLoanInterest.proof || null,
      });
      if (rowData.HouseLoanInterest.proof) {
        setPreview(rowData.HouseLoanInterest.proof);
      }
    }
  }, [rowData]);

  const validateField = (name, value) => {
    let fieldError = "";
    switch (name) {
      case "interestPayable":
        if (!value) fieldError = "Interest amount is required";
        else if (value <= 0) fieldError = "Interest amount must be greater than 0";
        else if (value > 150000) fieldError = "Interest amount cannot exceed ₹1,50,000";
        break;
      case "lenderName":
        if (!value) fieldError = "Lender's name is required";
        else if (value.length < 3) fieldError = "Lender's name must be at least 3 characters";
        break;
      case "lenderAddress":
        if (!value) fieldError = "Lender's address is required";
        else if (value.length < 10) fieldError = "Address must be at least 10 characters";
        break;
      case "lenderPan":
        if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value))
          fieldError = "Invalid PAN format (e.g., ABCDE1234F)";
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

    const deductionsData = {
      interestPayable: formData.interestPayable,
      lenderName: formData.lenderName,
      lenderAddress: formData.lenderAddress,
      lenderPan: formData.lenderPan,
      status: formData.status,
      description: formData.description,
    };
    formDataToSend.append('HouseLoanInterest', JSON.stringify(deductionsData));

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
        throw new Error(errorData.message || 'Failed to save House Loan Interest data');
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
          {rowData ? "Edit Deduction of Interest on Borrowing" : "Deduction of Interest on Borrowing"}
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
            type="number"
            label="Interest Payable"
            name="interestPayable"
            value={formData.interestPayable}
            onChange={handleChange}
            onBlur={() => handleBlur('interestPayable')}
            error={Boolean(touched.interestPayable && error.interestPayable)}
            helperText={touched.interestPayable && error.interestPayable}
            placeholder="Maximum ₹1,50,000"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Lender's Name"
            name="lenderName"
            value={formData.lenderName}
            onChange={handleChange}
            onBlur={() => handleBlur('lenderName')}
            error={Boolean(touched.lenderName && error.lenderName)}
            helperText={touched.lenderName && error.lenderName}
            placeholder="Enter lender's name"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Lender's PAN "
            name="lenderPan"
            value={formData.lenderPan}
            onChange={handleChange}
            onBlur={() => handleBlur('lenderPan')}
            error={Boolean(touched.lenderPan && error.lenderPan)}
            helperText={touched.lenderPan && error.lenderPan}
            placeholder="ABCDE1234F"
          />
        </Grid>

        {userRole === '1' ? (
          <>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
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
          <Grid item xs={12} md={6}>
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

        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Lender's Address"
            name="lenderAddress"
            value={formData.lenderAddress}
            onChange={handleChange}
            onBlur={() => handleBlur('lenderAddress')}
            error={Boolean(touched.lenderAddress && error.lenderAddress)}
            helperText={touched.lenderAddress && error.lenderAddress}
            multiline
            rows={3}
            placeholder="Enter lender's address"
          />
        </Grid>

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
          {error.form ? `Error: ${error.form}` : "Deduction information saved successfully!"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HouseLoanInterest;
