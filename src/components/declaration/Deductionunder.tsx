'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Snackbar,
  Alert,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Add, Delete } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

const Deductionunder = ({ handleClose, formId }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState([
    { sectionname: '', name: '', amount: '', proof: '' },
  ]);

  const [toastOpen, setToastOpen] = useState(false);


  const handleFormChange = (index, field, value) => {
    const updatedFormData = formData.map((data, i) =>
      i === index ? { ...data, [field]: value } : data
    );
    setFormData(updatedFormData);
  };

  const addFormRow = () => {
    setFormData([
      ...formData,
      { sectionname: '', name: '', amount: '', proof: '' },
    ]);
  };

  const removeFormRow = (index) => {
    const updatedFormData = formData.filter((_, i) => i !== index);
    setFormData(updatedFormData);
  };

  const handleSubmit = () => {

    const method = formId ? 'PUT' : "";
    const url = formId
      ? `${process.env.NEXT_PUBLIC_APP_URL}/my-declaration/update/${formId}` : "";


    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        { deductionsunder: formData }
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Deduction under Chapter VI-A</Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {formData.map((data, index) => (
          <Box
            key={index}
            sx={{
              border: '1px solid #ccc',
              padding: 3,
              marginBottom: 2,
              borderRadius: 1,
              width: '100%',
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Select under section</InputLabel>
                  <Select
                    name="sectionname"
                    value={data.sectionname}
                    onChange={(e) => handleFormChange(index, 'sectionname', e.target.value)}
                  >
                    <MenuItem value="Section 80C">Section 80C</MenuItem>
                    <MenuItem value="Section 80CCC">Section 80CCC</MenuItem>
                    <MenuItem value="Section 80CCD">Section 80CCD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Investment Type Name"
                  value={data.name}
                  onChange={(e) => handleFormChange(index, 'name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Amount"
                  value={data.amount}
                  onChange={(e) => handleFormChange(index, 'amount', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="file"
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => handleFormChange(index, 'proof', e.target.files[0])}
                />
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'right' }}>
                <IconButton onClick={() => removeFormRow(index)} color="error">
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        ))}

        <Grid item xs={12} sx={{ textAlign: 'right' }}>
          <Button variant="outlined" startIcon={<Add />} onClick={addFormRow}>
            Add Investment
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Button fullWidth variant="contained" color="primary" onClick={handleSubmit}>
            Save
          </Button>
        </Grid>
      </Grid>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleToastClose} severity="success" sx={{ width: '100%' }}>
          Deductions saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Deductionunder;
