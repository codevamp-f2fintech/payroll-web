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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { Upload } from "@mui/icons-material";

const HraForm = ({ handleClose, rowData, formId, debouncedFetch, proofEnable, userRole }) => {
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    houseRent: "",
    landlordName: "",
    landlordPan: '',
    landlordAddress: "",
    status: 'pending',
    cityType: 'non-metro',
    description: "",
    proof: null,
  });

  const [touched, setTouched] = useState({});
  const [toastOpen, setToastOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState({
    houseRent: "",
    landlordName: "",
    landlordPan: "",
    landlordAddress: "",
    status: "",
    cityType: "",
    description: "",
    proof: "",
  });

  useEffect(() => {
    if (rowData && rowData.hra) {
      setFormData({
        houseRent: rowData.hra.houseRent || "",
        landlordName: rowData.hra.landlordName || "",
        landlordPan: rowData.hra.landlordPan || "",
        landlordAddress: rowData.hra.landlordAddress || "",
        status: rowData.hra.status || "pending",
        cityType: rowData.hra.cityType || "non-metro",
        description: rowData.hra.description || "",
        proof: null,
      });
      if (rowData.hra.proof) {
        setPreview(rowData.hra.proof);
      }
    }
  }, [rowData]);


  const validateField = (name, value) => {
    let fieldError = "";
    switch (name) {
      case "houseRent":
        if (!value) fieldError = "House rent is required";
        else if (value <= 0) fieldError = "House rent must be greater than 0";
        break;
      case "landlordName":
        if (!value) fieldError = "Landlord name is required";
        else if (value.length < 3) fieldError = "Landlord name must be at least 3 characters";
        break;
      case "landlordPan":
        if (!value) fieldError = "Landlord PAN is required";
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value))
          fieldError = "Invalid PAN format (e.g., ABCDE1234F)";
        break;
      case "landlordAddress":
        if (!value) fieldError = "Landlord address is required";
        else if (value.length < 10) fieldError = "Address must be at least 10 characters";
        break;
      case "description":
        if (userRole === '1' && !value) fieldError = "Description is required";
        break;
      case "cityType":
        if (!value) fieldError = "City type is required";
        break;
      case "proof":
        if (proofEnable === 'True' && !value && !preview) fieldError = "Proof document is required";
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

  const handleStatusChange = (e) => {
    setFormData(prev => ({ ...prev, status: e.target.value }));
    if (error.status) {
      setError(prev => ({ ...prev, status: null }));
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

    setError(newErrors);
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

    const hraData = {
      houseRent: formData.houseRent,
      landlordName: formData.landlordName,
      landlordAddress: formData.landlordAddress,
      landlordPan: formData.landlordPan,
      status: formData.status,
      cityType: formData.cityType,
      description: formData.description
    };

    formDataToSend.append("hra", JSON.stringify(hraData));

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
        throw new Error(errorData.message || 'Failed to save HRA data');
      }

      const data = await response.json();
      if (data) {
        setToastOpen(true);
        setTimeout(() => {
          handleClose();
        }, 1000);
      }
    } catch (error) {
      console.error("Error:", error.message);
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
          {rowData ? "Edit House Rent Allowance" : "House Rent Allowance"}
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
            label="Rent of House"
            name="houseRent"
            value={formData.houseRent}
            onChange={handleChange}
            onBlur={() => handleBlur('houseRent')}
            error={Boolean(touched.houseRent && error.houseRent)}
            helperText={touched.houseRent && error.houseRent}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Name of Landlord"
            name="landlordName"
            value={formData.landlordName}
            onChange={handleChange}
            onBlur={() => handleBlur('landlordName')}
            error={Boolean(touched.landlordName && error.landlordName)}
            helperText={touched.landlordName && error.landlordName}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Landlord PAN"
            name="landlordPan"
            value={formData.landlordPan}
            onChange={handleChange}
            onBlur={() => handleBlur('landlordPan')}
            error={Boolean(touched.landlordPan && error.landlordPan)}
            helperText={touched.landlordPan && error.landlordPan}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={Boolean(touched.cityType && error.cityType)}>
            <InputLabel>City Type</InputLabel>
            <Select
              value={formData.cityType}
              onChange={handleChange}
              onBlur={() => handleBlur('cityType')}
              name="cityType"
              label="City Type"
            >
              <MenuItem value="metro">Metro</MenuItem>
              <MenuItem value="non-metro">Non-Metro</MenuItem>
            </Select>
            {touched.cityType && error.cityType && (
              <FormHelperText>{error.cityType}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {userRole === '1' ? (
          <>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={handleStatusChange}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
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
        {userRole === '1' && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Comments"
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={() => handleBlur('description')}
              error={Boolean(touched.description && error.description)}
              helperText={touched.description && error.description}
              multiline
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Address"
            name="landlordAddress"
            value={formData.landlordAddress}
            onChange={handleChange}
            onBlur={() => handleBlur('landlordAddress')}
            error={Boolean(touched.landlordAddress && error.landlordAddress)}
            helperText={touched.landlordAddress && error.landlordAddress}
            multiline
            rows={3}
          />
        </Grid>

        {proofEnable && (
          <Grid item xs={12}>
            <TextField
              type="file"
              required
              fullWidth
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
          {error.form ? `Error: ${error.form}` : "HRA information saved successfully!"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HraForm;
