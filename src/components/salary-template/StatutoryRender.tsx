// components/StatutorySection.js

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  TextField,
  Autocomplete,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const StatutorySection = ({
  statutoryDeductions,
  salaryComponents,
  onAdd,
  onRemove
}) => {

  const statutoryComponent = salaryComponents
    ? Object.keys(salaryComponents).map((key) => ({
      type: key, // EPF, ESI, ProfessionalTax
      ...salaryComponents[key], // Use salaryComponents instead of salaryTemplate
    }))
    : []; // Ensure it doesn't break when salaryComponents is undefined

  console.log('com', statutoryComponent);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Statutory Deductions</Typography>
      <Autocomplete
        options={statutoryComponent}
        getOptionLabel={(option) => option.type}
        onChange={(_, newValue) => onAdd(newValue)}
        renderInput={(params) => (
          <TextField {...params} label="Select Statutory Deduction" size="small" />
        )}
      />

      {statutoryDeductions.length > 0 && (
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

          {statutoryDeductions.map((component) => (
            <Grid container spacing={2} key={component.componentId} sx={{ mt: 1 }}>
              <Grid item xs={3}>
                <Typography>{component.type}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography>
                  {component.EPF === 'EPF'
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
                  onClick={() => onRemove(component.componentId)}
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
};

export default StatutorySection;
