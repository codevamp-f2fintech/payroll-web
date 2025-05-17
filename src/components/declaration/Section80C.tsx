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
  FormHelperText,
  Paper,
  Stack,
  LinearProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Add, CloudUpload, Delete } from '@mui/icons-material';

const Section80C = ({ handleClose, formId, rowData, proofEnable, userRole }) => {
  // const SECTION_80C_LIMIT = 150000;

  const defaultFormData = {
    sectionname: "Section 80C",
    name: '',
    amount: '',
    proof: '',
    status: 'pending',
    preview: null,
    comment: '', // New comment field
  };

  const [formData, setFormData] = useState([defaultFormData]);
  const [errors, setErrors] = useState([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const section80C = [
    'Public Provident Fund (PPF)',
    'Employee Provident Fund (EPF)',
    "Life Insurance Premiums",
    'National Savings Certificates (NSC)',
    'Equity-Linked Savings Schemes (ELSS)',
    'Principal repayment of a home loan',
    'Tuition fees for children',
    'Sukanya Samriddhi Yojana (SSY)',
    'Senior Citizens Savings Scheme (SCSS)',
    'Unit-Linked Insurance Plans (ULIPs)',
    'Infrastructure Bonds',
    "Tax-saving Fixed Deposits"
  ];

  useEffect(() => {
    if (rowData && rowData.Section80C) {
      const initialData = Array.isArray(rowData.Section80C)
        ? rowData.Section80C.map(deduction => ({
          ...defaultFormData,
          ...deduction,
          preview: Array.isArray(deduction.proof)
            ? deduction.proof[0]
            : deduction.proof || null
        }))
        : [{
          ...defaultFormData,
          ...rowData.Section80C,
          preview: Array.isArray(rowData.Section80C.proof)
            ? rowData.Section80C.proof[0]
            : rowData.Section80C.proof || null
        }];
      setFormData(initialData);
    }
  }, [rowData]);

  useEffect(() => {
    // Calculate total amount whenever formData changes
    const total = formData.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    setTotalAmount(total);
  }, [formData]);

  const validateForm = () => {
    const newErrors = formData.map(data => ({
      name: !data.name ? 'Investment type is required' : '',
      amount: !data.amount ? 'Amount is required' : '',
      proof: !data.proof ? 'Document proof is required' : '',
    }));

    setErrors(newErrors);
    return newErrors.every(error => !error.name && !error.amount && !error.proof);
  };

  const handleFormChange = (index, field, value) => {
    const updatedFormData = formData.map((data, i) =>
      i === index ? { ...data, [field]: value } : data
    );
    setFormData(updatedFormData);

    // Clear error for the field being changed
    if (errors[index]) {
      const updatedErrors = [...errors];
      updatedErrors[index] = { ...updatedErrors[index], [field]: '' };
      setErrors(updatedErrors);
    }
  };

  const handleFileChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const updatedFormData = formData.map((data, i) =>
            i === index
              ? { ...data, proof: file, preview: e.target.result }
              : data
          );
          setFormData(updatedFormData);
        };
        reader.readAsDataURL(file);
      } else {
        const updatedFormData = formData.map((data, i) =>
          i === index ? { ...data, proof: file, preview: null } : data
        );
        setFormData(updatedFormData);
      }

      // Clear proof error
      if (errors[index]) {
        const updatedErrors = [...errors];
        updatedErrors[index] = { ...updatedErrors[index], proof: '' };
        setErrors(updatedErrors);
      }
    }
  };

  const addFormRow = () => {
    setFormData([...formData, { ...defaultFormData }]);
    setErrors([...errors, {}]);
  };

  const removeFormRow = (index) => {
    const updatedFormData = formData.filter((_, i) => i !== index);
    const updatedErrors = errors.filter((_, i) => i !== index);
    setFormData(updatedFormData);
    setErrors(updatedErrors);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setToastOpen(true);
      return;
    }

    // if (totalAmount > SECTION_80C_LIMIT) {
    //   alert(`Total amount exceeds the Section 80C limit of ₹${SECTION_80C_LIMIT.toLocaleString()}`);
    //   return;
    // }

    const method = formId ? 'PUT' : "";
    const url = formId
      ? `${process.env.NEXT_PUBLIC_APP_URL}/my-declaration/update/${formId}` : "";

    const formDataToSend = new FormData();

    const formattedData = {};
    formData.forEach((item, index) => {
      formattedData[index] = {
        sectionname: item.sectionname,
        name: item.name,
        amount: item.amount,
        status: item.status,
        comment: item.comment
      };

      if (item.proof) {
        formDataToSend.append(`file_${index}`, item.proof);
      }
    });

    formDataToSend.append('Section80C', JSON.stringify(formattedData));

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

  // const remainingLimit = SECTION_80C_LIMIT - totalAmount;
  // const limitUtilizationPercentage = (totalAmount / SECTION_80C_LIMIT) * 100;

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {rowData ? "Edit Deduction under Section 80C" : "Deduction under Section 80C"}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Section 80C Limit Display */}
      {/* <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Section 80C Limit: ₹{SECTION_80C_LIMIT.toLocaleString()}
        </Typography>
        <Typography variant="body2" color={remainingLimit >= 0 ? 'success.main' : 'error.main'}>
          {remainingLimit >= 0
            ? `Remaining: ₹${remainingLimit.toLocaleString()}`
            : `Exceeded by: ₹${Math.abs(remainingLimit).toLocaleString()}`}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min(limitUtilizationPercentage, 100)}
          color={remainingLimit >= 0 ? "primary" : "error"}
          sx={{ mt: 1 }}
        />
      </Paper> */}

      {formData.map((data, index) => (
        <Paper
          key={index}
          sx={{
            position: 'relative',
            mb: 3,
            p: 3,
            '&:hover': {
              boxShadow: 3
            }
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  required
                  name="sectionname"
                  label="Section Name"
                  value={data.sectionname}
                  onChange={(e) => handleFormChange(index, 'sectionname', e.target.value)}
                />

                <FormControl fullWidth required error={!!errors[index]?.name}>
                  <InputLabel>Investment Type Name</InputLabel>
                  <Select
                    value={data.name}
                    onChange={(e) => handleFormChange(index, 'name', e.target.value)}
                    label="Investment Type Name"
                  >
                    {section80C.map((item, idx) => (
                      <MenuItem key={idx} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[index]?.name && (
                    <FormHelperText>{errors[index].name}</FormHelperText>
                  )}
                </FormControl>

                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Amount"
                  value={data.amount}
                  onChange={(e) => handleFormChange(index, 'amount', e.target.value)}
                  error={!!errors[index]?.amount}
                  helperText={errors[index]?.amount}
                />

                {userRole === '1' && (
                  <>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={data.status}
                        onChange={(e) => handleFormChange(index, 'status', e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Comment"
                      value={data.comment}
                      onChange={(e) => handleFormChange(index, 'comment', e.target.value)}
                    />
                  </>
                )}
              </Stack>
            </Grid>

            {proofEnable && (
              <Grid item xs={12} md={4}>
                <Box sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      width: '100%',
                      p: 2,
                      border: '2px dashed',
                      borderColor: errors[index]?.proof ? 'error.main' : 'grey.300',
                      textAlign: 'center'
                    }}
                  >
                    {data.preview ? (
                      <Box
                        component="img"
                        src={data.preview}
                        alt="Document Preview"
                        sx={{
                          maxWidth: '100%',
                          height: 200,
                          objectFit: 'contain',
                          mb: 2
                        }}
                      />
                    ) : (
                      <CloudUpload sx={{
                        width: 48,
                        height: 48,
                        color: 'grey.400',
                        mb: 1
                      }} />
                    )}
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{ mt: 1 }}
                    >
                      Upload Document
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, index)}
                      />
                    </Button>
                    {data.proof && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                        {data.proof.name}
                      </Typography>
                    )}
                    {errors[index]?.proof && (
                      <FormHelperText error>{errors[index].proof}</FormHelperText>
                    )}
                  </Paper>
                </Box>
              </Grid>
            )}
          </Grid>

          <IconButton
            onClick={() => removeFormRow(index)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'error.main'
            }}
          >
            <Delete />
          </IconButton>
        </Paper>
      ))}

      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mt: 3
      }}>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={addFormRow}
        >
          Add Investment
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          {rowData ? "Update" : "Save"}
        </Button>
      </Box>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity={errors.some(e => Object.keys(e).length > 0) ? "error" : "success"}>
          {errors.some(e => Object.keys(e).length > 0)
            ? "Please fill in all required fields"
            : "Deductions saved successfully!"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Section80C;
