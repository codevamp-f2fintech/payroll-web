import React, { useState, useEffect } from 'react';
import { Box, Grid, TextField, Typography, IconButton, Button, FormControl, Select, MenuItem, InputLabel, Autocomplete, TableContainer, Table, TableRow, TableCell, TableHead, TableBody, Paper, Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { toast, } from 'react-toastify';
import { fetchSalaryTemplates } from '@/redux/features/salaryTemplate/salaryTemplateSlice';
import { fetchSalaryComponents } from '@/redux/features/salaryComponent/salaryComponentSlice'
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { apiResponse } from '@/utility/apiResponse/employeesResponse';

const AddPayrollForm = ({ payroll, handleClose, payrolls, debouncedFetch, page, limit, selectedKeyword }) => {
  const dispatch: AppDispatch = useDispatch();
  const { salaryTemplates } = useSelector((state: RootState) => state.salaryTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [typeDetails, setTypeDetails] = useState({});


  console.log('payrolls', payrolls)
  const [formData, setFormData] = useState({
    employeeId: '',
    salaryTemplate: '',
    status: 'pending',
    processedBy: '',
    netSalary: '',
    payPeriod: new Date().toISOString().slice(0, 7),
    payDate: '', // New field

  });

  const [errors, setErrors] = useState({
    employeeId: '',
    salaryTemplate: '',
    status: '',
    processedBy: '',
    netSalary: '',
    payPeriod: '', // New field
    payDate: '', // New field
  });


  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeesData = await apiResponse(); // Fetch employees from your API
        setEmployees(employeesData); // Set the employees data
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);


  useEffect(() => {
    dispatch(fetchSalaryTemplates({ page, limit, keyword: selectedKeyword }));
  }, [dispatch, page, limit, selectedKeyword]);



  useEffect(() => {
    const fetchTypeDetails = async (typeIds) => {
      const validTypeIds = typeIds.filter((typeId) => /^[a-f\d]{24}$/i.test(typeId)); // Validate IDs
      const detailsById = {};

      await Promise.all(
        validTypeIds.map(async (typeId) => {
          if (!typeDetails[typeId]) {
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/salary-component/get/${typeId}`);
              const detail = await response.json();
              detailsById[typeId] = detail;
            } catch (error) {
              console.error(`Failed to fetch details for typeId: ${typeId}`, error);
            }
          }
        })
      );
      setTypeDetails((prev) => ({ ...prev, ...detailsById }));
    };

    if (selectedTemplate) {
      const earningTypeIds = selectedTemplate?.earningTypes || [];
      const deductionTypeIds = selectedTemplate?.deductionTypes || [];

      fetchTypeDetails([...earningTypeIds, ...deductionTypeIds]);
    }
  }, [selectedTemplate]);




  useEffect(() => {
    if (payroll) {
      const selected = payrolls.find((h) => h._id === payroll);
      if (selected) {
        setFormData({
          employeeId: selected.employee?._id || selected.employeeId || '',
          salaryTemplate: selected.salaryTemplate,
          status: selected.status,
          processedBy: selected.processedBy,
          netSalary: selected.netSalary,
          payPeriod: selected.payPeriod || '', // Set payPeriod
          payDate: selected.payDate || '', // Set payDate
        });
        const selectedTemplateData = salaryTemplates.find(
          (template) =>
            template._id === (selected.salaryTemplate?._id || selected.salaryTemplate)
        );
        setSelectedTemplate(selectedTemplateData);
      }
    }
  }, [payroll, payrolls, salaryTemplates]);

  const validateForm = () => {
    let isValid = true;

    const newErrors = {
      employeeId: '',
      salaryTemplate: '',
      status: '',
      processedBy: '',
      netSalary: '',
      payPeriod: '', // Validation for payPeriod
      payDate: '', // Validation for payDate
    };

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'employeeId is required';
      isValid = false;
    }

    if (!formData.salaryTemplate ||
      (typeof formData.salaryTemplate === 'object' && !formData.salaryTemplate._id?.trim()) ||
      (typeof formData.salaryTemplate === 'string' && !formData.salaryTemplate.trim())) {
      newErrors.salaryTemplate = 'Salary template is required';
      isValid = false;
    }


    if (!formData.status) {
      newErrors.status = 'Status  is required';
      isValid = false;
    }

    if (!formData.processedBy.trim()) {
      newErrors.processedBy = 'ProcessedBy is required';
      isValid = false;
    }
    // if (!formData.netSalary.trim()) {
    //   newErrors.netSalary = 'Total is required';
    //   isValid = false;
    // }
    if (!formData.payPeriod) {
      newErrors.payPeriod = 'Pay Period is required';
      isValid = false;
    }

    if (!formData.payDate) {
      newErrors.payDate = 'Pay Date is required';
      isValid = false;
    }


    setErrors(newErrors);

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prevState => {
      const updatedFormData = {
        ...prevState,
        [name]: value
      };

      return updatedFormData;
    });
  };

  const handleTemplateChange = (event, newValue) => {
    setSelectedTemplate(newValue);

    setFormData((prevData) => ({
      ...prevData,
      salaryTemplate: newValue ? newValue._id : null,
      netSalary: newValue?.netSalary || '',
    }));
  };


  const handleSubmit = () => {
    if (validateForm()) {
      const method = payroll ? 'PUT' : 'POST';
      const url = payroll
        ? `${process.env.NEXT_PUBLIC_APP_URL}/payroll/update/${payroll}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/payroll/create`;

      const formDataWithNetSalaryAsNumber = {
        ...formData,
        netSalary: parseFloat(formData.netSalary) || 0,  // Ensure it's a number, default to 0 if invalid
      };



      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataWithNetSalaryAsNumber),
      })
        .then(response => response.json())
        .then(data => {
          console.log("data>>>", data);
          if (data) {
            handleClose();
            debouncedFetch();
            toast.success(payroll ? "Payroll Successfully Updated" : "Payroll Successfully Created")
          } else {
            toast.error('Unexpected error occurred');
          }
        })
        .catch(error => {
          toast.error('Error: ' + error.message);
        });
    }
  };

  return (
    <><Box sx={{ flexGrow: 1, padding: 2 }}>
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
            onChange={(event, newValue) => {
              setFormData({
                ...formData,
                employeeId: newValue ? newValue._id : '',
              });
            }}
            isOptionEqualToValue={(option, value) => option._id === value?._id}
          />

        </Grid>
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
          <>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: 4,
                  textAlign: 'center',
                }}
              >
                <Typography textAlign={'center'}>Earning Types:</Typography>
              </Box>
              {selectedTemplate.earningTypes && selectedTemplate.earningTypes.length > 0 ? (
                <>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedTemplate.earningTypes.map((typeId) => {
                          const details = typeDetails[typeId];
                          return (
                            <TableRow key={typeId}>
                              <TableCell>
                                {/* Check and display `otherType` if available */}
                                {details && details.otherType
                                  ? `${details.otherType}`
                                  : details ? details.type : 'Unknown Type'}
                              </TableCell>
                              <TableCell align="right">
                                {details ? `₹${details.amount.toFixed(2)}` : 'N/A'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow>
                          <TableCell>
                            <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle1" fontWeight="bold">
                              {selectedTemplate.earningTypes
                                .reduce((total, typeId) => {
                                  const details = typeDetails[typeId];
                                  return total + (details?.amount || 0);
                                }, 0)
                                .toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>

                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography>N/A</Typography>
              )}
            </Grid>


            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: 4,
                  textAlign: 'center',
                }}
              >
                <Typography textAlign={'center'}>Deduction Types:</Typography>
              </Box>
              {selectedTemplate.deductionTypes && selectedTemplate.deductionTypes.length > 0 ? (
                <>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedTemplate.deductionTypes.map((typeId) => {
                          const details = typeDetails[typeId];
                          return (
                            <TableRow key={typeId}>
                              <TableCell>
                                {/* Check and display `otherType` if available */}
                                {details && details.otherType
                                  ? `${details.otherType}`
                                  : details ? details.type : 'Unknown Type'}
                              </TableCell>
                              <TableCell align="right">
                                {details ? `₹${details.amount.toFixed(2)}` : 'N/A'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow>
                          <TableCell>
                            <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle1" fontWeight="bold">
                              {selectedTemplate.deductionTypes
                                .reduce((total, typeId) => {
                                  const details = typeDetails[typeId];
                                  return total + (details?.amount || 0);
                                }, 0)
                                .toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>

                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography>N/A</Typography>
              )}
            </Grid>


            <Grid item xs={12}>

              <TextField
                fullWidth
                label='Net Salary'
                variant="outlined"
                name='netSalary'
                value={formData.netSalary}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Typography sx={{ marginRight: 1 }}>₹</Typography>,
                }}
                error={!!errors.netSalary}
                helperText={errors.netSalary}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pay Period"
                name="payPeriod"
                type="month"
                value={formData.payPeriod}
                onChange={handleChange}
                error={false} // You can add error handling if needed
                helperText={false} // You can add helper text if needed
                InputLabelProps={{
                  shrink: true, // Ensures the label stays above the input field
                }}
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
                error={!!errors.payDate}
                helperText={errors.payDate}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

          </>
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

export default AddPayrollForm;


