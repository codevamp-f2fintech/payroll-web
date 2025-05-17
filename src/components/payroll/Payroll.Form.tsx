'use client '
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Grid, TextField, Typography, IconButton, Button, FormControl, Select, MenuItem, InputLabel, Autocomplete, TableContainer, Table, TableRow, TableCell, TableHead, TableBody, Paper, Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import { fetchSalaryTemplates } from '@/redux/features/salaryTemplate/salaryTemplateSlice';
import { fetchSalaryComponents } from '@/redux/features/salaryComponent/salaryComponentSlice'
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { apiResponse } from '@/utility/apiResponse/employeesResponse';
import calculateTax from '@/utility/taxcalculation/calculateTax';
import { sum } from 'lodash';

interface PayrollFormProps {
  payroll?: string;
  handleClose: () => void;
  payrolls: any[];
  debouncedFetch: () => void;
  page: number;
  limit: number;
  selectedKeyword?: string;

}

const AddPayrollForm: React.FC<PayrollFormProps> = ({
  payroll,
  handleClose,
  payrolls,
  debouncedFetch,
  page,
  limit,
  selectedKeyword
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { salaryTemplates } = useSelector((state: RootState) => state.salaryTemplates);
  const [employees, setEmployees] = useState([]);
  const [declarationAmount, setDeclarationAmount] = useState(null);

  const [employeeLoans, setEmployeeLoans] = useState<any[]>([]);
  const [reimbursements, setReimbursements] = useState<any[]>([]);
  const [isLoadingLoans, setIsLoadingLoans] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const { company_id } = typeof window !== "undefined" ? JSON.parse(localStorage.getItem('user')) : {};


  const initialFormData = useMemo(() => ({
    employeeId: '',
    salaryTemplate: '',
    status: 'pending',
    processedBy: '',
    netSalary: '',
    payPeriod: new Date().toISOString().slice(0, 7),
    payDate: '',
    earnings: [],
    deductions: [],
    grossEarnings: 0,
    totalDeductions: 0,
    company_id: company_id

  }), []);
  const [yearlyGrossEarning, setYearlyGrossEarning] = useState(0)
  const [calculatedTax, setCalculatedTax] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({
    employeeId: '',
    salaryTemplate: '',
    status: '',
    processedBy: '',
    netSalary: '',
    payPeriod: '',
    payDate: '',
  });

  // get declaration
  useEffect(() => {
    const fetchDeclarationDetails = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const employeeId = user?.id;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/my-declaration/declaration/${employeeId}`
        );
        const result = await response.json();
        setDeclarationAmount(result);
      } catch (error) {
        console.error('Error fetching salary details:', error);

      }
    };

    fetchDeclarationDetails();
  }, []);

  // get employee
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeesData = await apiResponse(); // Fetch all employees

        // Extract employee IDs from payrolls
        const payrollEmployeeIds = new Set(payrolls.map((payroll) => payroll.employee._id));

        // Filter out employees who already have a payroll entry
        const filteredEmployees = employeesData.filter(
          (employee) => !payrollEmployeeIds.has(employee._id) && employee.role_priority !== '1');

        setEmployees(filteredEmployees);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);


  // get tax
  useEffect(() => {
    if (selectedTemplate && formData.earnings.length > 0 && declarationAmount) {
      // Extract basic salary from earnings
      const basicSalary = formData.earnings.find(earning => earning.type.toLowerCase().includes('basic')
      )?.yearlyAmount || 0;

      const EPFAmount = formData.deductions.find((item) => item.type === 'EPF')?.
        yearlyAmount || 0

      const ReceivedHra = formData.earnings.find((item) => item.type === 'HRA')?.
        yearlyAmount || 0
      // Calculate annual total salary
      const annualTotalSalary = yearlyGrossEarning;

      // Create deductions object from declarationAmount
      const deductions = {
        'rentPaid': declarationAmount?.houseRent || 0,
        'LTA': declarationAmount?.travelAmount || 0,
        '80C': declarationAmount?.section80CAmount || 0,
        '80D': declarationAmount?.section80DAmount || 0,
        '80EEA': declarationAmount?.loanInterest || 0,
        '80G': declarationAmount?.Section80GAmount || 0,
        'cityType': declarationAmount?.cityType || 'non-metro',
        'isSeniorCitizen': declarationAmount?.citizenType || 'isSeniorCitizen',
      };

      // Calculate tax using the utility function
      const tax = calculateTax(
        EPFAmount,
        ReceivedHra,
        annualTotalSalary,
        basicSalary,
        declarationAmount?.taxRegime || 'new',
        deductions
      );

      setCalculatedTax(tax);
    }
  }, [selectedTemplate, formData.earnings, declarationAmount]);

  // get template
  useEffect(() => {
    dispatch(fetchSalaryTemplates({ page, limit, keyword: selectedKeyword }));
  }, [dispatch, page, limit, selectedKeyword]);

  // get by id
  useEffect(() => {
    if (payroll) {
      const selected = payrolls.find((h) => h._id === payroll);
      if (selected) {
        const selectedTemplateData = salaryTemplates.find(
          (template) => template._id === (selected.salaryTemplate?._id || selected.salaryTemplate)
        );

        setFormData({
          employeeId: selected.employee?._id || selected.employeeId || '',
          salaryTemplate: selected.salaryTemplate,
          status: selected.status,
          processedBy: selected.processedBy,
          payPeriod: selected.payPeriod || initialFormData.payPeriod,
          payDate: selected.payDate || '',
          earnings: selected.earnings || [],
          deductions: selected.deductions || [],
          grossEarnings: selected.grossEarnings || 0,
          totalDeductions: selected.totalDeductions || 0,
          netSalary: selected.netSalary || 0,
          company_id: selected.company_id

        });
        setSelectedTemplate(selectedTemplateData);
      }
    }
  }, [payroll, payrolls, salaryTemplates, initialFormData]);

  // Modified useEffect for payroll calculations
  useEffect(() => {
    if (!selectedTemplate) return;

    // Extract components from the selected template
    const { basic, fixedAllowance } = selectedTemplate.components || {};

    // Combine earnings components
    const allEarnings = [
      basic && {
        type: basic.type || 'Basic',
        monthlyAmount: Number(basic.monthlyAmount) || 0,
        yearlyAmount: Number(basic.yearlyAmount) || 0,
      },
      fixedAllowance && {
        type: fixedAllowance.type || 'Fixed Allowance',
        monthlyAmount: Number(fixedAllowance.monthlyAmount) || 0,
        yearlyAmount: Number(fixedAllowance.yearlyAmount) || 0,
      },
      ...(selectedTemplate.earnings || []).map(earning => ({
        ...earning,
        monthlyAmount: Number(earning.monthlyAmount) || 0,
        yearlyAmount: Number(earning.yearlyAmount) || 0,
      })),
      ...(selectedTemplate.benefits || []).map(benefit => ({
        ...benefit,
        monthlyAmount: Number(benefit.monthlyAmount) || 0,
        yearlyAmount: Number(benefit.yearlyAmount) || 0,
      })),
      ...(selectedTemplate.reimbursements || []).map(reimbursement => ({
        ...reimbursement,
        monthlyAmount: Number(reimbursement.monthlyAmount) || 0,
        yearlyAmount: Number(reimbursement.yearlyAmount) || 0,
      })),
      // Add reimbursements if available
      reimbursements && {
        type: `Claim Reimbursements (${reimbursements.reimbursements})`,
        monthlyAmount: Number(reimbursements.amount) || 0,
      }
    ].filter(Boolean);

    // Template deductions from the template with explicit number conversion
    const templateDeductions = (selectedTemplate.deductions || []).map(deduction => ({
      ...deduction,
      monthlyAmount: Number(deduction.monthlyAmount) || 0,
      yearlyAmount: Number(deduction.yearlyAmount) || 0,
    }));

    // Process employee loans with explicit number conversion
    let loanDeductions = [];
    if (Array.isArray(employeeLoans)) {
      loanDeductions = employeeLoans.map(loan => ({
        type: `Loan EMI (${loan.loantype})`,
        monthlyAmount: Number(loan.installment) || 0,
        _id: loan._id,
      }));
    } else if (employeeLoans?.installment) {
      loanDeductions = [{
        type: `Loan EMI (${employeeLoans.loantype})`,
        monthlyAmount: Number(employeeLoans.installment) || 0,
        _id: employeeLoans._id,
      }];
    }


    // Combine all deductions
    const allDeductions = [...templateDeductions, ...loanDeductions,
    {
      type: 'Income Tax',
      monthlyAmount: Math.round(calculatedTax / 12),
      yearlyAmount: calculatedTax
    }
    ];

    // Calculate totals with explicit number handling
    const grossEarnings = allEarnings.reduce((total, item) =>
      total + (Number(item.monthlyAmount) || 0), 0);

    const yearlyGrossEarning = allEarnings.reduce((total, item) =>
      total + (Number(item.yearlyAmount) || 0), 0)

    const totalDeductions = allDeductions.reduce((total, item) =>
      total + (Number(item.monthlyAmount) || 0), 0);

    const netSalary = grossEarnings - totalDeductions;

    // Update the formData state with precise number values
    setFormData(prev => ({
      ...prev,
      earnings: allEarnings,
      deductions: allDeductions,
      grossEarnings: Number(grossEarnings.toFixed(2)),
      totalDeductions: Number(totalDeductions.toFixed(2)),
      netSalary: Number(netSalary.toFixed(2)),
    }));
    setYearlyGrossEarning(yearlyGrossEarning)
  }, [selectedTemplate, employeeLoans, reimbursements, calculatedTax]);


  const validateForm = useCallback(() => {
    const newErrors = { ...errors };
    let isValid = true;

    const requiredFields = [
      'employeeId', 'salaryTemplate', 'status',
      'processedBy', 'netSalary', 'payPeriod', 'payDate'
    ];

    requiredFields.forEach(field => {
      const value = formData[field];
      if (!value || (typeof value === 'string' && !value.trim())) {
        newErrors[field] = `${field} is required`;
        isValid = false;
      } else {
        newErrors[field] = '';
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, errors]);

  const fetchEmployeeData = async (employeeId) => {
    if (!employeeId) return { loans: [], reimbursements: [] };

    setIsLoadingLoans(true);

    try {
      // Fetch both loans and reimbursements concurrently
      const [loansResponse, reimbursementsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/loan/loan/${employeeId}`),
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/reimbursements/reimbursements/${employeeId}?status=approved`)
      ]);

      // Handle each response independently
      const loansData = await loansResponse.json();
      const reimbursementsData = await reimbursementsResponse.json();

      // Update states based on what data is available
      setEmployeeLoans(loansData || []);
      setReimbursements(reimbursementsData || []);

      // Return the data for additional processing if needed
      return {
        loans: loansData || [],
        reimbursements: reimbursementsData || []
      };

    } catch (error) {
      console.error('Error fetching employee data:', error);
      toast.error('Failed to fetch employee data');

      // Reset states on error
      setEmployeeLoans([]);
      setReimbursements([]);

      return { loans: [], reimbursements: [] };
    } finally {
      setIsLoadingLoans(false);
    }
  };

  const handleEmployeeChange = useCallback(async (event, newValue) => {
    const employeeId = newValue ? newValue._id : '';

    setFormData(prev => ({
      ...prev,
      employeeId
    }));

    if (employeeId) {
      await fetchEmployeeData(employeeId);
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/my-declaration/declaration/${employeeId}`)
        .then(res => res.json())
        .then(data => setDeclarationAmount(data))
    } else {
      setEmployeeLoans([]);
      setReimbursements([]);
    }
  }, [fetchEmployeeData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }, []);


  const handleTemplateChange = useCallback((event, newValue) => {
    setSelectedTemplate(newValue);
    setFormData((prevData) => ({
      ...prevData,
      salaryTemplate: newValue ? newValue._id : null,
      netSalary: newValue?.netSalary || '',
    }));
  }, [selectedTemplate, formData]);


  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      const method = payroll ? 'PUT' : 'POST';
      const url = payroll
        ? `${process.env.NEXT_PUBLIC_APP_URL}/payroll/update/${payroll}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/payroll/create`;

      const payload = {
        employeeId: formData.employeeId,
        salaryTemplate: formData.salaryTemplate,
        status: formData.status,
        processedBy: formData.processedBy,
        payPeriod: formData.payPeriod,
        payDate: formData.payDate,
        earnings: formData.earnings,
        deductions: formData.deductions,
        grossEarnings: formData.grossEarnings,
        totalDeductions: Number(formData.totalDeductions.toFixed(2)),
        netSalary: formData.netSalary,
        company_id: formData.company_id,
        yearlyGrossEarning: yearlyGrossEarning,
        payrollDate: new Date()
      };

      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload,),
      })
        .then(response => response.json())
        .then(data => {
          if (data) {
            handleClose();
            debouncedFetch();
            toast.success(payroll ? "Payroll Successfully Updated" : "Payroll Successfully Created");
          } else {
            toast.error('Unexpected error occurred');
          }
        })
        .catch(error => {
          toast.error('Error: ' + error.message);
        });
    }
  }, [
    validateForm,
    payroll,
    formData,
    handleClose,
    debouncedFetch
  ]);

  const renderPayrollSummary = () => {
    if (!selectedTemplate) return null;

    const { basic, fixedAllowance } = selectedTemplate.components || {};



    return (
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Earnings Section */}
          <Grid item xs={12} md={6}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>EARNINGS</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>AMOUNT</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>YTD</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.earnings.map((item, index) => (
                    <TableRow key={item._id || index}>
                      <TableCell>{item.name || item.type}</TableCell>
                      <TableCell align="right">₹{Number(item.monthlyAmount).toFixed(2)}</TableCell>
                      <TableCell align="right">₹{item.yearlyAmount || 0}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Gross Earnings</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{Number(formData.grossEarnings).toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{yearlyGrossEarning}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Deductions Section */}
          <Grid item xs={12} md={6}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>DEDUCTIONS</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>AMOUNT</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>YTD</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Template Deductions */}
                  {formData.deductions.map((item, index) => (
                    <TableRow key={item._id || `template-${index}`}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell align="right">₹{Number(item.monthlyAmount).toFixed(2)}</TableCell>
                      <TableCell align="right">₹{item.yearlyAmount || 0}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Deductions</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{Number(formData.totalDeductions).toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{Number(formData.totalDeductions * 12).toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Net Payable Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mt: 2 }}>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  <Typography variant="h6">TOTAL NET PAYABLE</Typography>
                  <Typography variant="subtitle2">Gross Earnings - Total Deductions</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    ₹{Number(formData.netSalary).toFixed(2)}                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <>
      <Box sx={{ flexGrow: 1, padding: 2 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography style={{ fontSize: '2em' }} variant='h5' gutterBottom>
            {payroll ? 'Edit payroll' : 'Add payroll'}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Grid container spacing={3}>
          {/* Employee Selection */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={employees}
              getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={option.image} alt={option.first_name} sx={{ marginRight: 2 }} />
                    <Typography>{option.first_name} {option.last_name}</Typography>
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Employee"
                  variant="outlined"
                  error={!!errors.employeeId}
                  helperText={errors.employeeId}
                />
              )}
              value={employees.length > 0 ? employees.find(emp => emp._id === formData.employeeId) || null : null}
              onChange={handleEmployeeChange}
              isOptionEqualToValue={(option, value) => option._id === value?._id}
            />

          </Grid>

          {/*Template Section */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <Autocomplete
                id="Selec Template"
                options={salaryTemplates}
                getOptionLabel={(option) => `${option.name}`}
                renderOption={(props, option) => (
                  <li {...props}>
                    {option.name}
                  </li>
                )}
                renderInput={(params) => <TextField {...params} label="Select Template" variant="outlined" />}
                value={
                  salaryTemplates.find((template) =>
                    template._id === (formData.salaryTemplate?._id || formData.salaryTemplate)
                  ) || null
                }
                onChange={handleTemplateChange}
                isOptionEqualToValue={(option, value) => option._id === value._id} />
              {errors.salaryTemplate && (
                <Typography color="error">{errors.salaryTemplate}</Typography>
              )}
            </FormControl>
          </Grid>

          {selectedTemplate && (
            <Grid item xs={12}>
              {renderPayrollSummary()}
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={!!errors.status}>
              <InputLabel required id='demo-simple-select-label'>Status</InputLabel>
              <Select
                label='Status'
                labelId='demo-simple-select-label'
                name='status'
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value='pending'>Pending</MenuItem>
                <MenuItem value='processed'>Processed</MenuItem>
                <MenuItem value='paid'>Paid</MenuItem>
              </Select>
              {errors.status && <Typography color="error">{errors.status}</Typography>}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Processed By'
              name='processedBy'
              value={formData.processedBy}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.processedBy}
              helperText={errors.processedBy}
              FormHelperTextProps={{ style: { color: 'red' } }}
            />
          </Grid>
          {/* Optionally, you can include payPeriod and payDate fields */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Pay Period (YYYY-MM)"
              name="payPeriod"
              value={formData.payPeriod}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.payPeriod}
              helperText={errors.payPeriod}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Pay Date"
              name="payDate"
              type="date"
              value={formData.payDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.payDate}
              helperText={errors.payDate}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'white',
                padding: 15,
                backgroundColor: '#2e7d32',
                width: 200,
              }}
              variant='contained'
              fullWidth
              onClick={handleSubmit}
            >
              {payroll ? 'UPDATE PAYROLL' : 'ADD PAYROLL'}
            </Button>
          </Grid>
        </Grid>
      </Box></>
  );
};

export default React.memo(AddPayrollForm);

