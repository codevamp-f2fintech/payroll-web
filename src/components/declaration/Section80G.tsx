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
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const Section80G = ({ handleClose, rowData, formId, proofEnable, userRole }) => {
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    sectionname: "Section80G",
    name: "",
    amount: '',
    status: 'pending',
    comment: '',
    proof: null,
  });

  const [touched, setTouched] = useState({});
  const [toastOpen, setToastOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState({});
  useEffect(() => {
    if (rowData?.Section80G) {
      setFormData({
        sectionname: rowData.Section80G.sectionname || "Section80G",
        name: rowData.Section80G.name || "",
        amount: rowData.Section80G.amount || "",
        status: rowData.Section80G.status || "pending",
        comment: rowData.Section80G.comment || "",
        proof: null,
      });
      if (rowData.Section80G.proof) {
        setPreview(rowData.Section80G.proof);
      }
    }
  }, [rowData]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value) {
          return 'Donation name is required';
        }
        return '';

      case 'amount':
        if (!value) {
          return 'Amount is required';
        }
        if (isNaN(value) || Number(value) <= 0) {
          return 'Please enter a valid amount greater than 0';
        }
        return '';

      case 'proof':
        if (!value && !preview) {
          return 'Proof document is required';
        }
        return '';

      case 'comment':
        if (userRole === '1' && (!value || value.trim() === '')) {
          return 'Comment is required for admin users';
        }
        return '';

      default:
        return '';
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, formData[name]);
    setError(prev => ({ ...prev, [name]: fieldError }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Remove any leading/trailing spaces
    const trimmedValue = value

    setFormData(prev => ({ ...prev, [name]: trimmedValue }));

    // Validate on change if field has been touched
    if (touched[name]) {
      const fieldError = validateField(name, trimmedValue);
      setError(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleStatusChange = (e) => {
    setFormData(prev => ({ ...prev, status: e.target.value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match('image.*') && file.type !== 'application/pdf') {
        setError(prev => ({ ...prev, proof: 'Only image or PDF files are allowed' }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(prev => ({ ...prev, proof: 'File size should be less than 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, proof: file }));
      setError(prev => ({ ...prev, proof: '' }));

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

    // Validate all fields
    Object.keys(formData).forEach(field => {
      const fieldError = validateField(field, formData[field]);
      if (fieldError) {
        newErrors[field] = fieldError;
        isValid = false;
      }
    });

    setError(newErrors);
    // Mark all fields as touched
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

    const Section80GData = {
      sectionname: formData.sectionname,
      name: formData.name,
      amount: formData.amount,
      status: formData.status,
      comment: formData.comment
    };

    formDataToSend.append("Section80G", JSON.stringify(Section80GData));

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
        throw new Error(errorData.message || 'Failed to save Section80G data');
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
          {rowData ? "Edit Deduction under Section 80G" : "Deduction under Section 80G"}
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
            name="sectionname"
            label="Section Name"
            value={formData.sectionname}
            onChange={handleChange}
            onBlur={() => handleBlur('sectionname')}
            error={Boolean(touched.sectionname && error.sectionname)}
            helperText={touched.sectionname && error.sectionname}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Donation name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            error={Boolean(touched.name && error.name)}
            helperText={touched.name && error.name}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            type="number"
            label="Donation amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            onBlur={() => handleBlur('amount')}
            error={Boolean(touched.amount && error.amount)}
            helperText={touched.amount && error.amount}
          />
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Comments"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                onBlur={() => handleBlur('comment')}
                error={Boolean(touched.comment && error.comment)}
                helperText={touched.comment && error.comment}
                multiline
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
          {error.form ? `Error: ${error.form}` : "Section80G information saved successfully!"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Section80G;
