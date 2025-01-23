import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
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

const LoanForm = ({ id, handleClose, debouncedFetch, loans, userRole }) => {
  const [formData, setFormData] = useState({
    loantype: '',
    amount: '',
    date: '',
    proof: null,
    reason: '',
    repaymentdate: '',
    instalment: '',
    isExempt: false,
    perquisiteRate: '',  // New field for admin
    status: 'pending',

  });

  const [errors, setErrors] = useState({
    loantype: '',
    amount: '',
    date: '',
    proof: '',
    reason: '',
    repaymentdate: '',
    instalment: '',
    perquisiteRate: '',
    status: '',

  });


  useEffect(() => {
    if (id) {
      const selected = loans.find(temp => temp._id === id);
      if (selected) {
        setFormData({
          loantype: selected.loantype,
          amount: selected.amount,
          date: selected.date,
          proof: selected.proof,
          reason: selected.reason,
          repaymentdate: selected.repaymentdate,
          instalment: selected.instalment,
          isExempt: selected.isExempt || false,
          perquisiteRate: selected.perquisiteRate || '',
          status: selected.status || 'pending',


        });
      }
    }
  }, [id, loans]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      loantype: '',
      amount: '',
      date: '',
      proof: '',
      reason: '',
      repaymentdate: '',
      instalment: '',
    };

    if (!formData.loantype) {
      newErrors.loantype = 'Reimbursement type is required';
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

    if (!formData.reason.trim()) {
      newErrors.reason = 'reason is required';
      isValid = false;
    }
    if (!formData.instalment || formData.instalment <= 0) {
      newErrors.instalment = 'Valid instalment is required';
      isValid = false;
    }

    if (!formData.repaymentdate) {
      newErrors.repaymentdate = 'repaymentdate is required';
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
        ? `${process.env.NEXT_PUBLIC_APP_URL}/loan/update/${id}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/loan/create`;

      const formDataToSend = new FormData();
      formDataToSend.append('loantype', formData.loantype);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('reason', formData.reason);
      formDataToSend.append('repaymentdate', formData.repaymentdate);
      formDataToSend.append('instalment', formData.instalment);
      formDataToSend.append('isExempt', formData.isExempt);
      formDataToSend.append('perquisiteRate', formData.perquisiteRate);
      formDataToSend.append('status', formData.status);


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
          {id ? 'Edit Loan' : 'Add Loan'}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Loan Type"
            fullWidth
            margin="normal"
            value={formData.loantype}
            onChange={(e) => handleChange('loantype', e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errors.date}
            helperText={errors.date}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Loan Amount (₹)"
            type="number"
            fullWidth
            margin="normal"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            error={!!errors.amount}
            helperText={errors.amount}
          />
        </Grid>
        {userRole === '1' && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                label="Perquisite Rate (%)"
                type="number"
                fullWidth
                value={formData.perquisiteRate}
                onChange={(e) => handleChange('perquisiteRate', e.target.value)}
                error={!!errors.perquisiteRate}
                helperText={errors.perquisiteRate}
                disabled={formData.isExempt}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  label="Status"
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
        )}


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
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Reason"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            value={formData.reason}
            onChange={(e) => handleChange('reason', e.target.value)}
            error={!!errors.reason}
            helperText={errors.reason}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isExempt}
                onChange={(e) => handleChange('isExempt', e.target.checked)}
                color="primary"
              />
            }
            label="Exempt this loan from perquisite calculation"
          />
          <Typography variant="caption" color="textSecondary" display="block">
            According to Rule 3(A), employees availing medical loan or any loan below ₹20,000 can be exempted from perquisite calculation.
          </Typography>
        </Grid>
        <Grid item xs={12} mt={5}>
          <Typography>
            Repayment
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Deduction start Date"
            type="date"
            fullWidth
            margin="normal"
            value={formData.repaymentdate}
            onChange={(e) => handleChange('repaymentdate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errors.repaymentdate}
            helperText={errors.repaymentdate}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Instalment Amount (₹)"
            type="number"
            fullWidth
            margin="normal"
            value={formData.instalment}
            onChange={(e) => handleChange('instalment', e.target.value)}
            error={!!errors.instalment}
            helperText={errors.instalment}
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
            add
          </Button>
        </Grid>

      </Grid>
    </Box>
  );
};

export default LoanForm;
