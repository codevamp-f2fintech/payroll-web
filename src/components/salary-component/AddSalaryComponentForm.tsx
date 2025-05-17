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
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { fetchComponentTypes } from "@/redux/features/componentType/componentTypeSlice";

interface AddSalaryComponentFormProps {
  id: string | null;
  handleClose: () => void;
  debouncedFetch: () => void;
  salaryComponents: any[];
}

const AddSalaryComponentForm: React.FC<AddSalaryComponentFormProps> = ({ id, handleClose, debouncedFetch, salaryComponents }) => {
  const dispatch = useDispatch();

  const { componentTypes } = useSelector((state: RootState) => state.componentTypes);

  const { company_id } = typeof window !== "undefined" ? JSON.parse(localStorage.getItem('user') || '{"company_id":""}') : { company_id: '' };

  const [formData, setFormData] = useState({
    salarytype: '',
    type: '',
    calculationtype: 'Flat Amount',
    amount: 0,
    description: '',
    company_id: company_id
  });

  const [errors, setErrors] = useState({
    salarytype: '',
    type: '',
    amount: '',
  });

  useEffect(() => {
    dispatch(fetchComponentTypes({ page: 1, limit: 10, keyword: '' }));
  }, [dispatch]);

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
          company_id: selected.company_id
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
      ...(name === 'salarytype' && { type: '' }), // Reset type if salarytype changes
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
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            if (data.message.includes('success')) {
              toast.success(data.message, {
                position: 'top-center',
              });
            } else {
              toast.error('Error: ' + data.message, {
                position: 'top-center',
              });
            }
          } else {
            toast.error('Unexpected error occurred', {
              position: 'top-center',
            });
          }

          if (data.message && data.message.includes('success')) {
            handleClose();
            debouncedFetch();
          }
        })
        .catch(error => {
          toast.error('Error: ' + error.message, {
            position: 'top-center',
          });
        });
    }
  };

  // Get type options from componentTypes array based on the selected salary type
  const getTypeOptions = () => {
    if (!componentTypes || !formData.salarytype) return [];

    // Map salarytype to corresponding type in componentTypes
    const typeMap = {
      'Earnings': 'Earning',
      'Deductions': 'Deduction',
      'Benefits': 'Benefit',
      'Reimbursements': 'Reimbursement'
    };

    const typeToFilter = typeMap[formData.salarytype];

    if (!typeToFilter) return [];

    // Filter component types by the selected type and return their names
    return componentTypes
      .filter(item => item.type === typeToFilter)
      .map(item => item.name);
  };

  const getAmountLabel = () => {
    return formData.calculationtype === 'Flat Amount'
      ? 'Enter Amount (₹)'
      : 'Enter Percentage (%)';
  };

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
              label="Select Salary type"
              name="salarytype"
              value={formData.salarytype}
              onChange={handleChange}
            >
              <MenuItem value="">Select Salary type</MenuItem>
              <MenuItem value="Earnings">Earnings</MenuItem>
              <MenuItem value="Deductions">Deductions</MenuItem>
              <MenuItem value="Benefits">Benefits</MenuItem>
              <MenuItem value="Reimbursements">Reimbursements</MenuItem>
            </Select>
            {errors.salarytype && <FormHelperText>{errors.salarytype}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={!!errors.type} disabled={!formData.salarytype}>
            <InputLabel>Type</InputLabel>
            <Select name="type" value={formData.type} onChange={handleChange} label="Type">
              <MenuItem value="">Select Type</MenuItem>
              {getTypeOptions().map((type) => (
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
              {formData.type === 'EPF' || formData.type === 'HRA' ? (
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
            label={getAmountLabel()}
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
