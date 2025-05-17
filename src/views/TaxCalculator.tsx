'use client'
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  FormHelperText,
  Divider,
  Paper,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const TaxCalculator = () => {
  // State variables
  const [regime, setRegime] = useState('old');
  const [grossIncome, setGrossIncome] = useState(0);
  const [standardDeduction, setStandardDeduction] = useState(50000);
  const [taxesAlreadyPaid, setTaxesAlreadyPaid] = useState(0);
  const [showIncomeDetails, setShowIncomeDetails] = useState(false);
  const [showDeductionDetails, setShowDeductionDetails] = useState(false);
  const [financialYear, setFinancialYear] = useState('FY 2025 - 26');
  const [age, setAge] = useState('Below 60 years');

  // New deduction state variables
  const [hraExemption, setHraExemption] = useState(0);
  const [section80C, setSection80C] = useState(0);
  const [section80D, setSection80D] = useState(0);
  const [lta, setLta] = useState(0);
  const [section80G, setSection80G] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);

  // Update standard deduction when regime changes
  useEffect(() => {
    setStandardDeduction(regime === 'old' ? 50000 : 75000);
  }, [regime]);

  // Calculate total deductions based on regime
  const calculateTotalDeduction = () => {
    let total = Number(standardDeduction);

    if (regime === 'old') {
      // Add other deductions only for old regime
      total += Number(hraExemption) +
        Number(section80C) +
        Number(section80D) +
        Number(lta) +
        Number(section80G) +
        Number(otherDeductions);
    } else {
      // Only add additional deductions (to maintain compatibility)
      total += Number(otherDeductions);
    }

    return total;
  };

  // Calculate tax values
  const totalDeduction = calculateTotalDeduction();
  const taxableIncome = Math.max(0, Number(grossIncome) - totalDeduction);
  const taxPayable = calculateTax(taxableIncome, regime, age);
  const netTaxPayable = Math.max(0, taxPayable - Number(taxesAlreadyPaid));

  // Function to calculate tax based on income and regime
  function calculateTax(income, taxRegime, ageGroup) {
    if (income <= 0) return 0;

    let tax = 0;

    if (taxRegime === 'old') {
      // Old regime tax calculation
      const exemption = ageGroup === 'Below 60 years' ? 250000 :
        ageGroup === '60 to 80 years' ? 300000 : 500000;

      if (income <= exemption) return 0;

      if (income <= 500000) {
        tax = (income - exemption) * 0.05;
      } else if (income <= 1000000) {
        tax = (500000 - exemption) * 0.05 + (income - 500000) * 0.2;
      } else {
        tax = (500000 - exemption) * 0.05 + 500000 * 0.2 + (income - 1000000) * 0.3;
      }

      // Apply Section 87A rebate if taxable income is ≤ ₹5,00,000
      if (income <= 500000) {
        return 0;
      }

    } else {
      // New regime tax calculation
      if (income <= 300000) return 0;

      if (income <= 700000) {
        tax = (income - 300000) * 0.05;
      } else if (income <= 1000000) {
        tax = 20000 + (income - 700000) * 0.1;
      } else if (income <= 1200000) {
        tax = 50000 + (income - 1000000) * 0.15;
      } else if (income <= 1500000) {
        tax = 80000 + (income - 1200000) * 0.2;
      } else if (income <= 2000000) {
        tax = 200000 + (income - 1500000) * 0.25;
      } else {
        tax = 300000 + (income - 2000000) * 0.3;
      }

      // Apply Section 87A rebate if taxable income is ≤ ₹7,00,000
      if (income <= 700000) {
        return 0;
      }
    }

    // Add Health and Education Cess (4%)
    tax += tax * 0.04;

    return Math.round(tax);
  }


  // Handle regime change
  const handleRegimeChange = (event, newRegime) => {
    if (newRegime !== null) {
      setRegime(newRegime);
    }
  };

  // Calculation for the progress circle
  const progressPercentage = taxableIncome > 0 ? Math.min(100, (netTaxPayable / taxableIncome) * 100) : 0;

  // Calculate tax under the other regime for comparison
  const alternateRegime = regime === 'old' ? 'new' : 'old';
  const alternateTaxableIncome = regime === 'old' ?
    Math.max(0, Number(grossIncome) - 75000 - Number(otherDeductions)) :
    Math.max(0, Number(grossIncome) - 50000 - Number(hraExemption) - Number(section80C) - Number(section80D) - Number(lta) - Number(section80G) - Number(otherDeductions));
  const alternateTaxPayable = calculateTax(alternateTaxableIncome, alternateRegime, age);
  const alternateNetTaxPayable = Math.max(0, alternateTaxPayable - Number(taxesAlreadyPaid));
  const savings = Math.max(0, alternateNetTaxPayable - netTaxPayable);

  return (
    <Box sx={{ p: 3, fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Calculate your Income Tax
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            {/* Basic Details Section */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Basic Details</Typography>
                <IconButton size="small" sx={{ bgcolor: 'rgba(0, 0, 0, 0.08)' }}>
                  <RemoveIcon />
                </IconButton>
              </Box>

              <FormControl fullWidth margin="normal">
                <InputLabel>Financial Year</InputLabel>
                <Select
                  value={financialYear}
                  label="Financial Year"
                  onChange={(e) => setFinancialYear(e.target.value)}
                >
                  <MenuItem value="FY 2025 - 26">FY 2025 - 26</MenuItem>
                  <MenuItem value="FY 2024 - 25">FY 2024 - 25</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Age</InputLabel>
                <Select
                  value={age}
                  label="Age"
                  onChange={(e) => setAge(e.target.value)}
                >
                  <MenuItem value="Below 60 years">Below 60 years</MenuItem>
                  <MenuItem value="60 to 80 years">60 to 80 years</MenuItem>
                  <MenuItem value="Above 80 years">Above 80 years</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>

          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            {/* Income Details Section */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Income Details</Typography>
                <IconButton
                  size="small"
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.08)' }}
                  onClick={() => setShowIncomeDetails(!showIncomeDetails)}
                >
                  {showIncomeDetails ? <RemoveIcon /> : <AddIcon />}
                </IconButton>
              </Box>

              {showIncomeDetails && (
                <Box>
                  <TextField
                    fullWidth
                    label="Gross Income (₹)"
                    type="number"
                    margin="normal"
                    value={grossIncome}
                    onChange={(e) => setGrossIncome(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    fullWidth
                    label="Taxes Already Paid (₹)"
                    type="number"
                    margin="normal"
                    value={taxesAlreadyPaid}
                    onChange={(e) => setTaxesAlreadyPaid(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              )}
            </Box>
          </Paper>

          <Paper elevation={1} sx={{ p: 2 }}>
            {/* Deductions Section */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Deductions</Typography>
                <IconButton
                  size="small"
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.08)' }}
                  onClick={() => setShowDeductionDetails(!showDeductionDetails)}
                >
                  {showDeductionDetails ? <RemoveIcon /> : <AddIcon />}
                </IconButton>
              </Box>

              {showDeductionDetails && (
                <Box>
                  <TextField
                    fullWidth
                    label="Standard Deduction (₹)"
                    type="number"
                    margin="normal"
                    value={standardDeduction}
                    InputProps={{ readOnly: true }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <FormHelperText>
                    {regime === 'old' ? 'Fixed at ₹50,000 for Old Regime' : 'Fixed at ₹75,000 for New Regime'}
                  </FormHelperText>

                  {/* New deduction fields - only shown for old regime */}
                  {regime === 'old' && (
                    <>
                      <TextField
                        fullWidth
                        label="HRA Exemption (₹)"
                        type="number"
                        margin="normal"
                        value={hraExemption}
                        onChange={(e) => setHraExemption(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                      <FormHelperText>
                        House Rent Allowance exemption under Section 10(13A)
                      </FormHelperText>

                      <TextField
                        fullWidth
                        label="Section 80C Deduction (₹)"
                        type="number"
                        margin="normal"
                        value={section80C}
                        onChange={(e) => setSection80C(Math.min(150000, e.target.value))}
                        InputLabelProps={{ shrink: true }}
                      />
                      <FormHelperText>
                        Max ₹1,50,000 (EPF, PPF, ELSS, LIC, etc.)
                      </FormHelperText>

                      <TextField
                        fullWidth
                        label="Section 80D Deduction (₹)"
                        type="number"
                        margin="normal"
                        value={section80D}
                        onChange={(e) => setSection80D(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                      <FormHelperText>
                        Medical Insurance Premium (max ₹25,000 for self & family, additional ₹25,000 for parents)
                      </FormHelperText>

                      <TextField
                        fullWidth
                        label="LTA Exemption (₹)"
                        type="number"
                        margin="normal"
                        value={lta}
                        onChange={(e) => setLta(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                      <FormHelperText>
                        Leave Travel Allowance exemption
                      </FormHelperText>

                      <TextField
                        fullWidth
                        label="Section 80G Donation (₹)"
                        type="number"
                        margin="normal"
                        value={section80G}
                        onChange={(e) => setSection80G(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                      <FormHelperText>
                        Charitable Donations
                      </FormHelperText>
                    </>
                  )}

                  {regime === 'new' && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Most deductions are not available in the New Tax Regime
                    </Alert>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              {/* Tax Regime Selection */}
              <Box sx={{ mb: 4 }}>
                <ToggleButtonGroup
                  value={regime}
                  exclusive
                  onChange={handleRegimeChange}
                  aria-label="tax regime"
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.08)',
                    borderRadius: '24px',
                    padding: '2px'
                  }}
                >
                  <ToggleButton
                    value="old"
                    aria-label="old regime"
                    sx={{
                      borderRadius: '24px !important',
                      px: 3,
                      textTransform: 'none',
                      '&.Mui-selected': {
                        boxShadow: 1
                      }
                    }}
                  >
                    Old Regime
                  </ToggleButton>
                  <ToggleButton
                    value="new"
                    aria-label="new regime"
                    sx={{
                      borderRadius: '24px !important',
                      px: 3,
                      textTransform: 'none',
                      '&.Mui-selected': {
                        boxShadow: 1
                      }
                    }}
                  >
                    New Regime
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Overall Summary */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Overall Summary</Typography>

                <Grid container spacing={3}>
                  {/* Left side - Circle */}
                  <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ position: 'relative', width: 140, height: 140 }}>
                      <Box
                        component="svg"
                        viewBox="0 0 100 100"
                        sx={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#e6f7ef"
                          strokeWidth="15"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#2e7d32"
                          strokeWidth="15"
                          strokeDasharray="251.327"
                          strokeDashoffset={251.327 * (1 - progressPercentage / 100)}
                        />
                      </Box>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">Net Tax payable</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>₹ {netTaxPayable}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Right side - Values (SIMPLIFIED) */}
                  <Grid item xs={12} sm={8}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#e8f5e9' }} />
                          <Typography variant="body2">Gross Income</Typography>
                          <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 'bold' }}>₹ {grossIncome}</Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffcdd2' }} />
                          <Typography variant="body2">Standard Deduction</Typography>
                          <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 'bold' }}>₹ {standardDeduction}</Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#fff9c4' }} />
                          <Typography variant="body2">Total Deduction</Typography>
                          <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 'bold' }}>₹ {totalDeduction}</Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#424242' }} />
                          <Typography variant="body2">Taxable Income</Typography>
                          <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 'bold' }}>₹ {taxableIncome}</Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#80deea' }} />
                          <Typography variant="body2">Tax Payable</Typography>
                          <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 'bold' }}>₹ {taxPayable}</Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ce93d8' }} />
                          <Typography variant="body2">Taxes Already Paid</Typography>
                          <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 'bold' }}>₹ {taxesAlreadyPaid}</Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#a5d6a7' }} />
                          <Typography variant="body2">Net Tax Payable</Typography>
                          <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 'bold' }}>₹ {netTaxPayable}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>

              {/* Recommended Plan */}
              {/* <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Recommended Plan for you</Typography>
                <Paper elevation={0} sx={{ bgcolor: 'white', p: 2, border: 1, borderColor: 'divider' }}>
                  <Typography variant="body2">
                    {netTaxPayable < alternateNetTaxPayable ? (
                      `You're saving ₹${savings} by choosing the ${regime} regime over the ${alternateRegime} regime.`
                    ) : netTaxPayable > alternateNetTaxPayable ? (
                      `You could save ₹${alternateNetTaxPayable < netTaxPayable ? netTaxPayable - alternateNetTaxPayable : 0} by switching to the ${alternateRegime} regime.`
                    ) : (
                      `Both tax regimes result in the same tax amount for you.`
                    )}
                  </Typography>
                </Paper>
              </Box> */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaxCalculator;
