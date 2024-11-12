import React, { useState, useEffect } from 'react';

import { Box, Grid, TextField, Typography, IconButton, Button, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify'; // Assuming you're using react-toastify for notifications

import { utility } from '@/utility';

const AddPayrollForm = ({ payroll, handleClose, }) => {

  const [formData, setFormData] = useState({
    employee_id: '',
    salary: '',
    status: 'Pending',
    processed: '',

  });

  const [errors, setErrors] = useState({
    employee_id: '',
    salary: '',
    status: '',
    processed: '',
  });

  useEffect(() => {
    if (payroll) {
      const selected = payroll.find(h => h._id === payroll);

      if (selected) {
        setFormData({
          employee_id: selected.employee_id,
          salary: selected.salary,
          status: selected.status,
          processed: selected.processed,

        });
      }
    }
  }, [payroll, payroll]);

  const validateForm = () => {
    let isValid = true;

    const newErrors = {
      employee_id: '',
      salary: '',
      status: '',
      processed: '',
    };

    if (!formData.employee_id.trim()) {
      newErrors.employee_id = 'Employee_id is required';
      isValid = false;
    }

    if (!formData.salary) {
      newErrors.salary = 'Salary date is required';
      isValid = false;
    }

    if (!formData.status) {
      newErrors.status = 'Status date is required';
      isValid = false;
    }

    if (!formData.processed.trim()) {
      newErrors.processed = 'Processed is required';
      isValid = false;
    }


    setErrors(newErrors);

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prevState => {
      const updatedFormData = {
        ...prevState,
        [name]: value
      };

      return updatedFormData;
    });
  };


  const handleSubmit = () => {
    if (validateForm()) {
      const method = payroll ? 'PUT' : 'POST';
      const url = payroll
        ? `http://localhost:3002/payroll/update/${payroll}`
        : `http://localhost:3002/payroll/create`;


      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            if (data.message.includes('success')) {
              toast.success(data.message, { position: 'top-center' });
            } else {
              toast.error('Error: ' + data.message, { position: 'top-center' });
            }
          } else {
            toast.error('Unexpected error occurred', { position: 'top-center' });
          }

          handleClose();

          // debouncedFetch();
        })
        .catch(error => {
          toast.error('Error: ' + error.message, { position: 'top-center' });
        });
    }
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography style={{ fontSize: '2em' }} variant='h5' gutterBottom>
          {payroll ? 'Edit payroll' : 'Add payroll'}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Employee_id'
            name='employee_id'
            value={formData.employee_id}
            onChange={handleChange}
            required
            error={!!errors.employee_id}
            helperText={errors.employee_id}
            FormHelperTextProps={{ style: { color: 'red' } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Salary'
            name='salary'
            value={formData.salary}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
            error={!!errors.salary}
            helperText={errors.salary}
            FormHelperTextProps={{ style: { color: 'red' } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={!!errors.type}>
            <InputLabel required id='demo-simple-select-label'>Type</InputLabel>
            <Select
              label='Select Type'
              labelId='demo-simple-select-label'
              id='demo-simple-select'
              name='status'
              value={formData.status}
              onChange={handleChange}
            >
              <MenuItem value='Pending'>PENDING</MenuItem>
              <MenuItem value='Processed'>PROCESSED</MenuItem>
              <MenuItem value='Paid'>PAID</MenuItem>
            </Select>
            {errors.status && <Typography color="error">{errors.status}</Typography>}
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Processed'
            name='processed'
            value={formData.processed}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
            error={!!errors.processed}
            helperText={errors.processed}
            FormHelperTextProps={{ style: { color: 'red' } }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'white',
              padding: 15,
              backgroundColor: '#ff902f',
              width: 200,
            }}
            variant='contained'
            fullWidth
            onClick={handleSubmit}
          >
            {payroll ? 'UPDATE PAYROLL' : 'ADD PAYROLL'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddPayrollForm;
