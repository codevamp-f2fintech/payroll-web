import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Upload } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';

const ReimbursementForm = ({ id, handleClose, debouncedFetch, reimbursements }) => {
  const [formData, setFormData] = useState({
    reimbursements: '',
    amount: '',
    date: '',
    proof: null,
    description: '',
  });

  const [errors, setErrors] = useState({
    reimbursements: '',
    amount: '',
    date: '',
    proof: '',
    description: '',
  });

  const reimbursementTypes = [
    'Travel',
    'Meals',
    'Office Supplies',
    'Training',
    'Internet',
    'Phone',
    'Medical',
    'Entertainment',
    'Books',
    'Others',
  ];

  useEffect(() => {
    if (id) {
      const selected = reimbursements.find(temp => temp._id === id);
      if (selected) {
        setFormData({
          reimbursements: selected.reimbursements,
          amount: selected.amount,
          date: selected.date,
          proof: selected.proof,
          description: selected.description,


        });
      }
    }
  }, [id, reimbursements]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      reimbursements: '',
      amount: '',
      date: '',
      proof: '',
      description: '',
    };

    if (!formData.reimbursements) {
      newErrors.reimbursements = 'Reimbursement type is required';
      isValid = false;
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Valid amount is required';
      isValid = false;
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
      isValid = false;
    }

    if (!formData.proof) {
      newErrors.proof = 'Proof document is required';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        proof: file,
      }));
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const method = id ? 'PUT' : 'POST';
      const url = id
        ? `${process.env.NEXT_PUBLIC_APP_URL}/reimbursements/update/${id}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/reimbursements/create`;

      const formDataToSend = new FormData();
      formDataToSend.append('reimbursements', formData.reimbursements);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('description', formData.description);
      if (formData.proof) {
        formDataToSend.append('file', formData.proof);
      }

      fetch(url, {
        method,
        body: formDataToSend,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            handleClose();
            debouncedFetch();
            toast.success(id ? "Salary Component Successfully Updated" : "Salary Component Successfully Created");
          } else {
            toast.error('Unexpected error occurred');
          }
        })
        .catch((error) => {
          toast.error('Error: ' + error.message);
        });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography style={{ fontSize: '2em' }} variant="h5" gutterBottom>
          {id ? 'Edit Reimbursements' : 'Add Reimbursements'}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal" error={!!errors.reimbursements}>
            <InputLabel>Reimbursement Type</InputLabel>
            <Select
              value={formData.reimbursements}
              onChange={(e) => handleChange('reimbursements', e.target.value)}
            >
              {reimbursementTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.reimbursements}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Amount (₹)"
            type="number"
            fullWidth
            margin="normal"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            error={!!errors.amount}
            helperText={errors.amount}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Date"
            type="date"
            fullWidth
            margin="normal"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errors.date}
            helperText={errors.date}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            startIcon={<Upload />}
          >
            {formData.proof ? formData.proof.name : 'Upload Proof Document'}
            <input
              type="file"
              hidden
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
          </Button>
          {errors.proof && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {errors.proof}
            </Typography>
          )}
          {formData.proof && (
            <>
              {formData.proof.type.startsWith('image/') && (
                <Box mt={2} textAlign="center">
                  <img
                    src={formData.proof.preview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  />
                </Box>
              )}
            </>
          )}
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Description"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Submit Reimbursement
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReimbursementForm;
