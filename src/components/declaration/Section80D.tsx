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
import { json } from 'stream/consumers';

const Section80D = ({ handleClose, formId, rowData, proofEnable, userRole }) => {

  const defaultFormData = {
    sectionname: "Section 80D",
    name: '',
    amount: '',
    proof: '',
    status: 'pending',
    preview: null,
    comment: '',
  };
  const [CitizenTypeError, setCitizenTypeError] = useState(false);
  const [CitizenType, setCitizenType] = useState('')
  const [formData, setFormData] = useState([defaultFormData]);
  const [errors, setErrors] = useState([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const SECTION_80D_LIMIT = CitizenType === 'isSeniorCitizen' ? 75000 : 50000; // Adjust this value based on your requirements

  const section80D = [
    "Health Insurance Premiums",
    "Preventive Health Check-ups",
    "Medical Expenditure for Senior Citizens(self)",
    "Medical Expenditure for Senior Citizens (parent)",
    "Contribution to Central Government Health Scheme (CGHS)",
  ];

  useEffect(() => {
    if (rowData && rowData.Section80D) {
      const initialData = Array.isArray(rowData.Section80D)
        ? rowData.Section80D.map(deduction => ({
          ...defaultFormData,
          ...deduction,
          preview: Array.isArray(deduction.proof)
            ? deduction.proof[0]
            : deduction.proof || null
        }))
        : [{
          ...defaultFormData,
          ...rowData.Section80D,
          preview: Array.isArray(rowData.Section80D.proof)
            ? rowData.Section80D.proof[0]
            : rowData.Section80D.proof || null
        }];
      setFormData(initialData);
      if (rowData?.citizenType) {
        console.log("Updating CitizenType to:", rowData.citizenType); // Debugging log
        setCitizenType(rowData.citizenType);
      }
    }
  }, [rowData, rowData?.citizenType]);
  console.log(CitizenType, 'citizen state')
  useEffect(() => {
    // Calculate total amount whenever formData changes
    const total = formData.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    setTotalAmount(total);
  }, [formData]);

  const validateForm = () => {
    let isValid = true;

    if (!CitizenType) {
      setCitizenTypeError(true);
      isValid = false;
    }

    const newErrors = formData.map(data => ({
      name: !data.name ? 'Investment type is required' : '',
      amount: !data.amount ? 'Amount is required' : '',
      proof: !data.proof ? 'Document proof is required' : '',
    }));

    setErrors(newErrors);

    if (!newErrors.every(error => !error.name && !error.amount && !error.proof)) {
      isValid = false;
    }

    return isValid;
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

    if (totalAmount > SECTION_80D_LIMIT) {
      alert(`Total amount exceeds the Section 80D limit of ₹${SECTION_80D_LIMIT.toLocaleString()}`);
      return;
    }

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

    formDataToSend.append('Section80D', JSON.stringify(formattedData));
    formDataToSend.append('citizenType', JSON.stringify(CitizenType))
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

  const remainingLimit = SECTION_80D_LIMIT - totalAmount;
  const limitUtilizationPercentage = (totalAmount / SECTION_80D_LIMIT) * 100;

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {rowData ? "Edit Deduction under Section 80D" : "Deduction under Section 80D"}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Section 80D Limit Display */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Section 80D Limit: ₹{SECTION_80D_LIMIT.toLocaleString()}
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
      </Paper>

      <FormControl fullWidth sx={{ mb: 3 }} error={CitizenTypeError}>
        <InputLabel>Citizen Type</InputLabel>
        <Select
          value={CitizenType}
          onChange={(e) => {
            setCitizenType(e.target.value);
            setCitizenTypeError(false); // Clear error when user selects
          }}
          label="Citizen Type"
        >
          <MenuItem value="seniorCitizen">Senior Citizen</MenuItem>
          <MenuItem value="notSeniorCitizen">Not Senior Citizen</MenuItem>
        </Select>
        {CitizenTypeError && <FormHelperText>Citizen Type is required</FormHelperText>}
      </FormControl>


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
                    {section80D.map((item, idx) => (
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

export default Section80D;
