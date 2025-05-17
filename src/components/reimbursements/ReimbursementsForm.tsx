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

const ReimbursementForm = ({ id, handleClose, debouncedFetch, reimbursements, userRole, employeeId }) => {
  const { company_id } = typeof window !== "undefined" ? JSON.parse(localStorage.getItem('user')) : {};

  const [formData, setFormData] = useState({
    reimbursements: '',
    amount: '',
    date: '',
    proof: null,
    description: '',
    status: 'pending',
    company_id: company_id


  });
  const [preview, setPreview] = useState(null);

  const [errors, setErrors] = useState({
    reimbursements: '',
    amount: '',
    date: '',
    proof: '',
    description: '',
    status: '',
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
          status: selected.status || 'pending',
          company_id: selected.company_id,
        });
        setPreview(selected.proof)
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
      formDataToSend.append('status', formData.status);
      if (!id) {
        formDataToSend.append('company_id', formData.company_id);
      }
      if (!id) {
        formDataToSend.append('employeeId', employeeId);
      }
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

        {userRole === '1' ? (
          <>
            <Grid item xs={12} md={6} mt={2}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                  name='status'
                  label="Status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
                {errors.status && (
                  <FormHelperText error>{errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} md={6} mt={3}>
              <FormControl fullWidth disabled>
                <InputLabel>Status</InputLabel>
                <Select value={formData.status} disabled label="Status">
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        )}
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
          <Box mt={4}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<Upload />}
              sx={{ height: '8vh' }}
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
            {preview && (
              <>
                <Box mt={2} textAlign="center">
                  <img
                    src={preview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  />
                </Box>
              </>
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            {id ? 'Update' : 'Add'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReimbursementForm;
