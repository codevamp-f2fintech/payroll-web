'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  IconButton,
  TextField,
  FormControl,
  Autocomplete,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RootState } from '@/redux/store';

const AddSalaryTemplateForm = ({ id, handleClose, debouncedFetch }) => {
  const { salaryTemplates } = useSelector((state: RootState) => state.salaryTemplates);
  const { salaryComponents } = useSelector((state: RootState) => state.salaryComponents);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ctc: 0,
    earnings: [],
    benefits: [],
    deductions: [],
    reimbursements: [],
    netSalary: 0
  });

  const [errors, setErrors] = useState({
    name: '',
    ctc: '',
    earnings: '',
    benefits: '',
    deductions: '',
    reimbursements: ''
  });

  useEffect(() => {
    if (id) {
      const selected = salaryTemplates.find(temp => temp._id === id);
      if (selected) {
        setFormData({
          name: selected.name,
          description: selected.description,
          ctc: selected.ctc,
          earnings: selected.earnings || [],
          benefits: selected.benefits || [],
          deductions: selected.deductions || [],
          reimbursements: selected.reimbursements || [],
          netSalary: selected.netSalary
        });
      }
    }
  }, [id, salaryTemplates]);

  const calculateComponentAmounts = (component, ctc) => {
    console.log("cp", component)
    if (component.calculationtype === 'Percentage of CTC') {
      const yearlyAmount = (ctc * component.amount) / 100 // Divide by 12 for monthly and 100 for percentage
      return {
        calculatetype: "%",
        monthlyAmount: (yearlyAmount / 12).toFixed(2),
        yearlyAmount: yearlyAmount
      };
    }
    if (component.type === 'EPF') {
      // Assuming basic salary is 50% of CTC - adjust this percentage as needed
      const basicSalary = ctc * 0.5;
      const monthlyAmount = (basicSalary * component.amount) / 1200;
      return {

        monthlyAmount: monthlyAmount.toFixed(2),
        yearlyAmount: (monthlyAmount * 12)
      };
    }
    return {
      monthlyAmount: component.amount,
      yearlyAmount: (component.amount * 12)
    };
  };

  const updateNetSalary = () => {
    const calculateTotal = (components) => {
      return components.reduce((sum, comp) => {
        // Ensure we're working with numbers, not strings
        const amount = parseFloat(comp.yearlyAmount) || 0;
        return sum + amount;
      }, 0);
    };

    // Calculate totals for each component type
    const earningsTotal = calculateTotal(formData.earnings);
    const benefitsTotal = calculateTotal(formData.benefits);
    const deductionsTotal = calculateTotal(formData.deductions);
    const reimbursementsTotal = calculateTotal(formData.reimbursements);

    // Calculate net salary
    const netSalary = earningsTotal + benefitsTotal + reimbursementsTotal - deductionsTotal;

    setFormData(prev => ({
      ...prev,
      netSalary: parseFloat(netSalary.toFixed(2))
    }));
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'ctc') {
      updateNetSalary();
    }
  };

  const handleComponentChange = (type, newValue) => {
    const componentArray = newValue.map(item => ({
      componentId: item._id,
      type: item.type,
      calculationType: item.type === 'Percentage of CTC' ? 'percentage' : (item.calculationType || 'fixed'),
      amount: item.amount,
      ...calculateComponentAmounts({
        ...item,
        calculationType: item.type === 'Percentage of CTC' ? 'percentage' : item.calculationType
      }, formData.ctc)
    }));

    setFormData(prev => ({
      ...prev,
      [type]: componentArray
    }));

    updateNetSalary();
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      ctc: '',
      earnings: '',
      benefits: '',
      deductions: '',
      reimbursements: ''
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    if (!formData.ctc || formData.ctc <= 0) {
      newErrors.ctc = 'CTC is required';
      isValid = false;
    }
    if (!formData.earnings.length) {
      newErrors.earnings = 'At least one earning component is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const method = id ? 'PUT' : 'POST';
      const url = id
        ? `${process.env.NEXT_PUBLIC_APP_URL}/salary-template/update/${id}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/salary-template/create`;

      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then(response => response.json())
        .then(data => {
          if (data) {
            handleClose();
            debouncedFetch();
            toast.success(id ? "Template Updated Successfully" : "Template Created Successfully");
          }
        })
        .catch(error => toast.error('Error: ' + error.message));
    }
  };

  const renderComponentList = (components) => (
    <Box mt={2}>
      <List>
        {components.map((component) => (
          <ListItem key={component.componentId}>
            <Grid container spacing={3}>
              <Grid item xs={3}>
                <ListItemText primary={component.type} />
              </Grid>
              <Grid item xs={3}>
                {component?.calculationtype === 'Percentage of CTC' ? (
                  <ListItemText primary={`${component.amount}% of CTC`} />
                ) : (
                  <ListItemText primary={`₹${component?.amount}`} />
                )}

              </Grid>
              <Grid item xs={3}>
                <ListItemText primary={`₹${component.monthlyAmount}`} />
              </Grid>
              <Grid item xs={3}>
                <ListItemText primary={`₹${component.yearlyAmount}`} />
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // Rest of your JSX remains similar, but update the component renderings
  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" gutterBottom>
          {id ? 'Edit Salary Template' : 'Add Salary Template'}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Basic Details */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Template Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Annual CTC"
            name="ctc"
            type="number"
            value={formData.ctc}
            onChange={handleChange}
            error={!!errors.ctc}
            helperText={errors.ctc}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>

      {/* Component Headers */}
      <Grid container spacing={3} sx={{ mt: 3, mb: 2 }}>
        <Grid item xs={3}>
          <Typography variant="subtitle2">COMPONENT TYPE</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="subtitle2">CALCULATION TYPE</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="subtitle2">MONTHLY AMOUNT</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="subtitle2">ANNUAL AMOUNT</Typography>
        </Grid>
      </Grid>

      {/* Earnings Section */}
      <Typography variant="h6" sx={{ mt: 3 }}>Earnings</Typography>
      <Autocomplete
        multiple
        options={salaryComponents.filter(comp => comp.salarytype === 'Earnings')}
        getOptionLabel={(option) => option.type}
        value={salaryComponents.filter(comp =>
          formData.earnings.some(e => e.componentId === comp._id)
        )}
        onChange={(_, newValue) => handleComponentChange('earnings', newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Earnings"
            error={!!errors.earnings}
            helperText={errors.earnings}
          />
        )}
      />
      {renderComponentList(formData.earnings, 'earnings')}

      {/* Benefits Section */}
      <Typography variant="h6" sx={{ mt: 3 }}>Benefits</Typography>
      <Autocomplete
        multiple
        options={salaryComponents.filter(comp => comp.salarytype === 'Benefit')}
        getOptionLabel={(option) => option.type}
        value={salaryComponents.filter(comp =>
          formData.benefits.some(b => b.componentId === comp._id)
        )}
        onChange={(_, newValue) => handleComponentChange('benefits', newValue)}
        renderInput={(params) => (
          <TextField {...params} label="Select Benefits" />
        )}
      />
      {renderComponentList(formData.benefits, 'benefit')}

      {/* Deductions Section */}
      <Typography variant="h6" sx={{ mt: 3 }}>Deductions</Typography>
      <Autocomplete
        multiple
        options={salaryComponents.filter(comp => comp.salarytype === 'Deductions')}
        getOptionLabel={(option) => option.type}
        value={salaryComponents.filter(comp =>
          formData.deductions.some(d => d.componentId === comp._id)
        )}
        onChange={(_, newValue) => handleComponentChange('deductions', newValue)}
        renderInput={(params) => (
          <TextField {...params} label="Select Deductions" />
        )}
      />
      {renderComponentList(formData.deductions, 'deductions')}

      {/* Reimbursements Section */}
      <Typography variant="h6" sx={{ mt: 3 }}>Reimbursements</Typography>
      <Autocomplete
        multiple
        options={salaryComponents.filter(comp => comp.salarytype === 'Reimbursement')}
        getOptionLabel={(option) => option.type}
        value={salaryComponents.filter(comp =>
          formData.reimbursements.some(r => r.componentId === comp._id)
        )}
        onChange={(_, newValue) => handleComponentChange('reimbursements', newValue)}
        renderInput={(params) => (
          <TextField {...params} label="Select Reimbursements" />
        )}
      />
      {renderComponentList(formData.reimbursements, 'reimbursement')}

      {/* Net Salary */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Net Salary"
            value={formData.netSalary}
            InputProps={{
              readOnly: true,
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>

      {/* Submit Button */}
      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 3, bgcolor: '#ff902f' }}
        onClick={handleSubmit}
      >
        {id ? 'Update Template' : 'Create Template'}
      </Button>
    </Box>
  );
};

export default AddSalaryTemplateForm;
