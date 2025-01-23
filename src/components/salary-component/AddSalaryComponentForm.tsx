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
  RadioGroup,
  FormControlLabel,
  Radio,
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
    calculationtype: 'Flat Amount',
    amount: 0,
    description: '',
  });

  const [errors, setErrors] = useState({
    salarytype: '',
    type: '',
    amount: '',
  });

  const salaryComponentTypes1 = [
    'Basic', 'DA', 'HRA',
    'Medical allowance',
    'Conveyance allowance',
    'Commission', 'Transport Allowance',
    'Children Education Allowance',
    'Hostel Expenditure Allowance',
    'Travelling Allowance',
    'Uniform Allowance', 'Daily Allowance',
    'City Compensatory Allowance',
    'Overtime Allowance', 'Telephone Allowance',
    'Project Allowance', 'Food Allowance',
    'Holiday Allowance', 'Entertainment Allowance',
    'Custom Allowance', 'Gift Coupon',
    'Research Allowance', 'Books and Periodicals Allowance',
    'Shift Allowance', 'Fuel Allowance', 'Driver Allowance',
    'Leave Travel Allowance', 'Vehicle Maintenance Allowance',
    'Telephone And Internet Allowance',
  ];

  const salaryComponentTypes2 = [
    'TDS',
    'ESI',
    'EPF',
    'Leave',
    'Prof.Tax',
    'Others'
  ];

  const salaryComponentTypes3 = [
    "Meal Coupons",
    "Special Allowance",
    "Tax-Free Allowances",
    "Work-Related Benefits",
    "Lifestyle Benefits",
    "Wellness programs (gym memberships, yoga classes)"

  ]

  const salaryComponentTypes4 = [

    "Club Reimbursement",
    "Entertainment Reimbursement",
    "Gadget Reimbursement",
    "Books and Periodicals Reimbursement",
    "Business Development Expense Reimbursement",
    "Helper Reimbursement",
    "Hostel Expenditure Reimbursement",
    "Research Reimbursement",
    "Uniform Reimbursement",
    "Internet Reimbursement",
    "Fuel Reimbursement",
    "Driver Reimbursement",
    "Telephone Reimbursement",
  ]

  useEffect(() => {
    if (id) {
      const selected = salaryComponents.find((temp) => temp._id === id);
      if (selected) {
        setFormData({
          salarytype: selected.salarytype,
          type: selected.type,
          calculationtype: selected.calculationtype || 'Flat Amount',
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

  const handleCalculationTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      calculationtype: event.target.value
    }));
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

  const typeOptions = (() => {
    switch (formData.salarytype) {
      case 'Earnings':
        return salaryComponentTypes1;
      case 'Deductions':
        return salaryComponentTypes2;
      case 'Benefit':
        return salaryComponentTypes3;
      case 'Reimbursement':
        return salaryComponentTypes4;
      default:
        return [];
    }
  })();

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
              <MenuItem value="Benefit">Benefit</MenuItem>
              <MenuItem value="Reimbursement">Reimbursement</MenuItem>
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


        <Grid item xs={12}>
          <FormControl component="fieldset">
            <Typography variant="h6">Calculation Type*</Typography>
            <RadioGroup
              name="calculationtype"
              value={formData.calculationtype}
              onChange={handleCalculationTypeChange}
              row
            >
              <FormControlLabel
                value="Flat Amount"
                control={<Radio />}
                label="Flat Amount"
              />
              {formData.salarytype === 'Deductions' ? (
                <FormControlLabel
                  value="Percentage of Basic"
                  control={<Radio />}
                  label="Percentage of Basic"
                />
              ) : (
                <FormControlLabel
                  value="Percentage of CTC"
                  control={<Radio />}
                  label="Percentage of CTC"
                />
              )}
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={
              formData.calculationtype === 'percentage of CTC' ||
                formData.calculationtype === 'Percentage of Basic'
                ? 'Percentage (%)'
                : 'Enter Amount (₹)'
            }
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
            error={!!errors.amount}
            helperText={errors.amount}
          />
        </Grid>        <Grid item xs={12}>
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
