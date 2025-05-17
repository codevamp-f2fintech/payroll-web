'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  IconButton,
  TextField,
  Autocomplete,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddSalaryTemplateForm = ({ id, handleClose, debouncedFetch }) => {
  const { salaryTemplates } = useSelector((state) => state.salaryTemplates);
  const { salaryComponents } = useSelector((state) => state.salaryComponents);
  const { company_id } = typeof window !== "undefined" ? JSON.parse(localStorage.getItem('user')) : {};

  const initialState = {
    name: '',
    description: '',
    ctc: '',
    monthlyCTC: 0,
    components: {
      basic: {
        type: 'Basic',
        percentage: 50,
        monthlyAmount: 0,
        yearlyAmount: 0,
        isFixed: true
      },
      fixedAllowance: {
        type: 'Fixed Allowance',
        percentage: 50,
        monthlyAmount: 0,
        yearlyAmount: 0,
        isFixed: true
      }
    },
    earnings: [],
    benefits: [],
    reimbursements: [],
    deductions: [],
    company_id: company_id

  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      const template = salaryTemplates.find(t => t._id === id);
      if (template) {
        // Ensure components has the correct structure
        const components = {
          basic: {
            type: 'Basic',
            percentage: 50,
            monthlyAmount: template.components?.basic?.monthlyAmount || 0,
            yearlyAmount: template.components?.basic?.yearlyAmount || 0,
            isFixed: true
          },
          fixedAllowance: {
            type: 'Fixed Allowance',
            percentage: template.components?.fixedAllowance?.percentage || 50,
            monthlyAmount: template.components?.fixedAllowance?.monthlyAmount || 0,
            yearlyAmount: template.components?.fixedAllowance?.yearlyAmount || 0,
            isFixed: true
          }
        };

        setFormData(prevState => ({
          ...prevState,
          ...template,
          components,
          company_id,
        }));
      }
    }
  }, [id, salaryTemplates]);

  const calculateAmounts = (ctc, components = {
    earnings: formData.earnings,
    benefits: formData.benefits,
    reimbursements: formData.reimbursements,
    deductions: formData.deductions
  }) => {
    // Calculate Basic (50% of CTC)
    const yearlyBasic = ctc * 0.5;
    const monthlyBasic = yearlyBasic / 12;

    const calculateComponentAmount = (component, basicAmount) => {
      let yearlyAmount = 0;
      let monthlyAmount = 0;

      switch (component.type) {
        case 'HRA':
          yearlyAmount = (basicAmount * component.amount) / 100;
          break;
        case 'EPF':
          yearlyAmount = (basicAmount * component.amount) / 100;
          break;
        default:
          yearlyAmount = component.amount * 12;
      }
      monthlyAmount = yearlyAmount / 12;
      return { yearlyAmount, monthlyAmount };
    };

    // Calculate amounts for all components
    const processComponents = (items, basicAmount) => {
      return items.map(comp => {
        const { yearlyAmount, monthlyAmount } = calculateComponentAmount(comp, basicAmount);
        return {
          ...comp,
          yearlyAmount,
          monthlyAmount
        };
      });
    };

    const updatedEarnings = processComponents(components.earnings, yearlyBasic);
    const updatedBenefits = processComponents(components.benefits, yearlyBasic);
    const updatedReimbursements = processComponents(components.reimbursements, yearlyBasic);
    const updatedDeductions = processComponents(components.deductions, yearlyBasic);

    // Calculate totals
    const calculateTotal = items => items.reduce((sum, item) => sum + item.yearlyAmount, 0);

    const earningsTotal = calculateTotal(updatedEarnings);
    const benefitsTotal = calculateTotal(updatedBenefits);
    const reimbursementsTotal = calculateTotal(updatedReimbursements);
    const deductionsTotal = calculateTotal(updatedDeductions);

    // Calculate remaining amount for Fixed Allowance
    const totalAllocated = yearlyBasic + earningsTotal + benefitsTotal + reimbursementsTotal + deductionsTotal;
    const remainingForFixed = Math.max(0, ctc - totalAllocated);

    return {
      basic: {
        type: 'Basic',
        percentage: 50,
        monthlyAmount: monthlyBasic,
        yearlyAmount: yearlyBasic,
        isFixed: true
      },
      fixedAllowance: {
        type: 'Fixed Allowance',
        percentage: (remainingForFixed / ctc) * 100,
        monthlyAmount: remainingForFixed / 12,
        yearlyAmount: remainingForFixed,
        isFixed: true
      },
      updatedComponents: {
        earnings: updatedEarnings,
        benefits: updatedBenefits,
        reimbursements: updatedReimbursements,
        deductions: updatedDeductions
      }
    };
  };

  const handleCTCChange = (e) => {
    const ctc = parseFloat(e.target.value) || 0;
    const { basic, fixedAllowance, updatedComponents } = calculateAmounts(ctc);

    setFormData(prevState => ({
      ...prevState,
      ctc: ctc,
      monthlyCTC: ctc / 12,
      components: {
        basic,
        fixedAllowance
      },
      ...updatedComponents
    }));
  };

  const handleComponentAdd = (type, newComponent) => {
    if (!newComponent) return;

    const componentAmount = {
      componentId: newComponent._id,
      type: newComponent.type,
      calculationType: newComponent.calculationType || 'flat',
      amount: newComponent.amount || 0,
      monthlyAmount: 0,
      yearlyAmount: 0
    };

    const updatedFormData = {
      ...formData,
      [type]: [...formData[type], componentAmount]
    };

    const { basic, fixedAllowance, updatedComponents } = calculateAmounts(formData.ctc, {
      ...updatedFormData,
      [type]: updatedFormData[type]
    });

    setFormData({
      ...updatedFormData,
      components: {
        basic,
        fixedAllowance
      },
      ...updatedComponents
    });
  };

  const handleComponentRemove = (type, componentId) => {
    const updatedComponents = formData[type].filter(comp => comp.componentId !== componentId);

    const { basic, fixedAllowance, updatedComponents: recalculatedComponents } = calculateAmounts(formData.ctc, {
      ...formData,
      [type]: updatedComponents
    });

    setFormData(prevState => ({
      ...prevState,
      components: {
        basic,
        fixedAllowance
      },
      [type]: updatedComponents,
      ...recalculatedComponents
    }));
  };

  const renderComponentSection = (title, type, components) => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      <Autocomplete
        options={salaryComponents.filter(comp =>
          comp.salarytype === title &&
          comp.type !== 'Basic' &&
          comp.type !== 'Fixed Allowance'
        )}
        getOptionLabel={(option) => option.type}
        onChange={(_, newValue) => handleComponentAdd(type, newValue)}
        renderInput={(params) => (
          <TextField {...params} label={`Select ${title}`} size="small" />
        )}
      />

      {components.length > 0 && (
        <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Typography variant="subtitle2">COMPONENT</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle2">CALCULATION TYPE</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subtitle2">MONTHLY</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle2">YEARLY</Typography>
            </Grid>
            <Grid item xs={1}></Grid>
          </Grid>

          {components.map((component) => (
            <Grid container spacing={2} key={component.componentId} sx={{ mt: 1 }}>
              <Grid item xs={3}>
                <Typography>{component.type}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography>
                  {component.type === 'HRA' || component.type === 'EPF'
                    ? `${component.amount}% of Basic`
                    : `₹${component.amount}`}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>₹{component.monthlyAmount.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography>₹{component.yearlyAmount.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={1}>
                <IconButton
                  size="small"
                  onClick={() => handleComponentRemove(type, component.componentId)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Paper>
      )}
    </Box>
  );

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Template name is required';
    if (!formData.ctc || formData.ctc <= 0) newErrors.ctc = 'Valid CTC is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      name: formData.name,
      description: formData.description,
      ctc: formData.ctc,
      monthlyCTC: formData.monthlyCTC,
      components: formData.components,
      earnings: formData.earnings,
      benefits: formData.benefits,
      reimbursements: formData.reimbursements,
      deductions: formData.deductions,
      company_id: formData.company_id
    };

    try {
      const url = id
        ? `${process.env.NEXT_PUBLIC_APP_URL}/salary-template/update/${id}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/salary-template/create`;

      const response = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data) {
        toast.success(id ? 'Template Updated Successfully' : 'Template Created Successfully');
        handleClose();
        debouncedFetch();
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">
          {id ? 'Edit Salary Template' : 'Create Salary Template'}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Template Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Annual CTC"
            type="number"
            value={formData.ctc}
            onChange={handleCTCChange}
            error={!!errors.ctc}
            helperText={errors.ctc}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>

      {/* Fixed Components Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Fixed Components</Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Typography variant="subtitle2">COMPONENT</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle2">CALCULATION TYPE</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle2">MONTHLY</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle2">YEARLY</Typography>
            </Grid>
          </Grid>

          {Object.entries(formData.components || {}).map(([key, component]) => (
            <Grid container spacing={2} key={key} sx={{ mt: 1 }}>
              <Grid item xs={3}>
                <Typography>{component?.type || ''}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography>{(component?.percentage || 0)}% of ctc</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography>₹{(component?.monthlyAmount || 0).toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography>₹{(component?.yearlyAmount || 0).toFixed(2)}</Typography>
              </Grid>
            </Grid>
          ))}
          {/* Add warning message when Fixed Allowance is 0 */}
          {formData.components?.fixedAllowance?.monthlyAmount === 0 && (
            <Typography
              color="error"
              sx={{
                mt: 2,
                p: 1,
                bgcolor: '#ffebee',
                borderRadius: 1
              }}
            >
              Warning: Fixed Allowance is 0. This might indicate that all CTC has been allocated to other components.
            </Typography>
          )}
        </Paper>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Additional Components Sections */}
      {renderComponentSection('Earnings', 'earnings', formData.earnings)}
      {renderComponentSection('Benefits', 'benefits', formData.benefits)}
      {renderComponentSection('Reimbursements', 'reimbursements', formData.reimbursements)}
      {renderComponentSection('Deductions', 'deductions', formData.deductions)}

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          COST TO COMPANY
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField
            fullWidth
            label="Monthly CTC"
            value={Number(formData.monthlyCTC).toFixed(2)}
            InputProps={{
              readOnly: true,
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField
            fullWidth
            label="Annual CTC"
            value={formData.ctc}
            InputProps={{
              readOnly: true,
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>

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

