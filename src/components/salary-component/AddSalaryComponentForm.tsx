import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Button,
  IconButton,
  FormHelperText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface AddSalaryComponentFormProps {
  id: string | null;
  handleClose: () => void;
  debouncedFetch: () => void;
}

const AddSalaryComponentForm: React.FC<AddSalaryComponentFormProps> = ({ id, handleClose, debouncedFetch }) => {
  const { salaryComponents } = useSelector((state: RootState) => state.salaryComponents);

  const [formData, setFormData] = useState({
    salarytype: '',
    type: '',
    amount: 0,
    description: '',
  });

  const [errors, setErrors] = useState({
    salarytype: '',
    type: '',
    amount: '',
  });

  const salaryComponentTypes1 = [
    'DA',
    'HRA',
    'Allowances',
    'Medical allowance',
    'Conveyance allowance',
    'Others'
  ];

  const salaryComponentTypes2 = [
    'TDS',
    'ESI',
    'PF',
    'Leave',
    'Prof.Tax',
    'Labour Welfare',
    'Others'
  ];

  useEffect(() => {
    if (id) {
      const selected = salaryComponents.find((temp) => temp._id === id);
      if (selected) {
        setFormData({
          salarytype: selected.salarytype,
          type: selected.type,
          amount: selected.amount,
          description: selected.description,
        });
      }
    }
  }, [id, salaryComponents]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { salarytype: '', type: '', amount: '' };

    if (!formData.salarytype.trim()) {
      newErrors.salarytype = 'Salary type is required';
      isValid = false;
    }
    if (!formData.type) {
      newErrors.type = 'Type is required';
      isValid = false;
    }
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prevState) => ({
      ...prevState,
      [name!]: value,
      ...(name === 'salarytype' && { type: '' }),
    }));
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const method = id ? 'PUT' : 'POST';
      const url = id
        ? `${process.env.NEXT_PUBLIC_APP_URL}/salary-component/update/${id}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/salary-component/create`;

      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

  const typeOptions = formData.salarytype === 'Earnings' ? salaryComponentTypes1 : salaryComponentTypes2;

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography style={{ fontSize: '2em' }} variant="h5" gutterBottom>
          {id ? 'Edit Salary Component' : 'Add Salary Component'}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={!!errors.salarytype}>
            <InputLabel>Select Salary type</InputLabel>
            <Select
              label="Select type"
              name="salarytype"
              value={formData.salarytype}
              onChange={handleChange}
            >
              <MenuItem value="Earnings">Earnings</MenuItem>
              <MenuItem value="Deductions">Deductions</MenuItem>
            </Select>
            {errors.salarytype && <FormHelperText>{errors.salarytype}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={!!errors.type} disabled={!formData.salarytype}>
            <InputLabel>Type</InputLabel>
            <Select name="type" value={formData.type} onChange={handleChange} label="Type">
              {typeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Amount (In Rupees)"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
            error={!!errors.amount}
            helperText={errors.amount}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            fullWidth
            style={{ backgroundColor: '#ff902f' }}
            onClick={handleSubmit}
          >
            {id ? 'Edit Component' : 'Add Component'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddSalaryComponentForm;
