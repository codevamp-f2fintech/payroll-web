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

const Section80D = ({ handleClose, formId, rowData }) => {
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState([
    { sectionname: " section 80D", name: '', amount: '', proof: '', preview: null },
  ]);

  const section80D = [
    "Health Insurance Premiums",
    " Preventive Health Check-ups",
    "Medical Expenditure for Senior Citizens(self) ",
    "Medical Expenditure for Senior Citizens (parent)  ",
    "Electric    ",


    "Contribution to Central Government Health Scheme (CGHS)",

  ];

  const [toastOpen, setToastOpen] = useState(false);
  useEffect(() => {
    if (rowData && rowData.deductions) {
      setFormData(
        Array.isArray(rowData.deductions)
          ? rowData.deductions.map(deduction => ({
            sectionname: deduction.sectionname || "",
            name: deduction.name || "",
            amount: deduction.amount || "",
            proof: deduction.proof || "",
          }))
          : [{
            sectionname: rowData.deductions.sectionname || "",
            name: rowData.deductions.name || "",
            amount: rowData.deductions.amount || "",
            proof: rowData.deductions.proof || "",
          }]
      );
      if (Array.isArray(rowData.deductions)) {
        const existingPreviews = rowData.deductions.map(d => d.proof || null);
        setPreviews(existingPreviews);
      }
    }
  }, [rowData]);


  const handleFormChange = (index, field, value) => {
    const updatedFormData = formData.map((data, i) =>
      i === index ? { ...data, [field]: value } : data
    );
    setFormData(updatedFormData);
  };


  const handleFileChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const updatedFormData = formData.map((data, i) =>
        i === index
          ? { ...data, proof: file }
          : data
      );
      setFormData(updatedFormData);

      // Create a file preview if it's an image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const updatedPreviewData = formData.map((data, i) =>
            i === index
              ? { ...data, preview: e.target.result }
              : data
          );
          setFormData(updatedPreviewData);
        };
        reader.readAsDataURL(file);
      } else {
        const updatedPreviewData = formData.map((data, i) =>
          i === index ? { ...data, preview: null } : data
        );
        setFormData(updatedPreviewData);
      }
    }
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

  const handleSubmit = async () => {
    const method = formId ? 'PUT' : "";
    const url = formId
      ? `${process.env.NEXT_PUBLIC_APP_URL}/my-declaration/update/${formId}` : "";

    const formDataToSend = new FormData();

    // Create a clean version of the data without file objects
    const deductionsData = formData.map(item => ({
      sectionname: item.sectionname,
      name: item.name,
      amount: item.amount
    }));

    formDataToSend.append('deductionsunder', JSON.stringify(deductionsData));

    // Add files with index in the field name
    formData.forEach((item, index) => {
      if (item.proof) {
        formDataToSend.append(`proof_${index}`, item.proof);
      }
    });

    try {
      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const data = await response.json();
      if (data) {
        setToastOpen(true);
        handleClose();
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const handleToastClose = () => {
    setToastOpen(false);
  };

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {rowData ? "Edi Deduction under Section80D" : " Deduction under Section80D"}
        </Typography>
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
              height: '80vh'
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
                    <MenuItem value="Section  80D">Section  80D</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Investment Type Name</InputLabel>
                  <Select
                    value={data.name}
                    onChange={(e) => handleFormChange(index, 'name', e.target.value)}
                  >
                    {section80D.map((item, idx) => (
                      <MenuItem key={idx} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
              <TextField
                fullWidth
                type="file"
                InputLabelProps={{ shrink: true }}
                onChange={(event) => handleFileChange(event, index)}
                inputProps={{
                  accept: '.pdf,.jpg,.jpeg,.png',
                }}
              />
              {data.proof && (
                <Typography variant="caption" color="textSecondary">
                  Selected file: {data.proof.name}
                </Typography>
              )}
              {data.preview && (
                <div style={{ marginTop: '10px' }}>
                  <img
                    src={data.preview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                  />
                </div>
              )}

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
            {rowData ? "Update" : "Save"}
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

export default Section80D;
