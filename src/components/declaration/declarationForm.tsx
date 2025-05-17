'use client'
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Typography,
  IconButton,
  Box,
  Dialog,
  DialogContent,
  FormControl,
  Grid,
  Radio,
  FormControlLabel,
  RadioGroup,
  Snackbar,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import HraForm from './HRA';
import Ltaform from './LTA';
import HouseLoanInterest from './Deductiononinterest';
import Section80C from './Section80C';
import Section80D from './Section80D';
import PreviousEmp from './PreviousEmp';
import Section80G from './Section80G';
import { fetchConfiguration } from '@/redux/features/configuration/configurationSlice';
import { RootState } from '@/redux/store';


const DeclarationForm = ({ handleClose, declaration, debouncedFetch, declarations, userRole }) => {
  const dispatch = useDispatch();
  const { configration, } = useSelector((state: RootState) => state.configration);

  const [openForm, setOpenForm] = useState(null);
  const [formId, setformId] = useState(null)
  const [taxRegime, setTaxRegime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);

  const proofEnable = configration?.data?.[0]?.proofEnabled

  const rowData = Array.isArray(declarations) && declaration
    ? declarations.find((declare) => declare?._id === declaration) || null
    : null;
  const handleOpenForm = (formName) => {
    setOpenForm(formName);
  };
  const handleCloseForm = () => {
    setOpenForm(null);
  };

  useEffect(() => {
    dispatch(fetchConfiguration());
  }, []);

  // Update taxRegime when rowData changes
  useEffect(() => {
    if (rowData?.taxRegime) {
      console.log('Setting tax regime:', rowData.taxRegime); // For debugging
      setTaxRegime(rowData.taxRegime);
    }
  }, [rowData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTaxRegime(event.target.value);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const method = declaration && "PUT"
      const url = declaration
        && `${process.env.NEXT_PUBLIC_APP_URL}/my-declaration/update/${declaration}`

      const payload = {
        taxRegime
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!declaration && data.data._id) {
        setformId(data.data._id);
      }

      setToastOpen(true);

      // Delay closing the form to allow toast to be visible
      setTimeout(() => {
        handleClose();
        debouncedFetch();
      }, 1000);

    } catch (error) {
      console.error("Error submitting form:", error);
      setError(error.message);
      setToastOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToastClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setToastOpen(false);
  };

  // Render form with edit mode support
  const renderFormContent = () => {
    switch (openForm) {
      case 'PreviousEmp':
        return <PreviousEmp
          handleClose={handleCloseForm}
          setformId={setformId}
          rowData={rowData}
          declaration={declaration}
          debouncedFetch={debouncedFetch}
          taxRegime={taxRegime}
        />;

      case 'hraform':
        return <HraForm
          handleClose={handleCloseForm}
          formId={formId ?? declaration}
          rowData={rowData}
          proofEnable={proofEnable}
          debouncedFetch={debouncedFetch}
          userRole={userRole}
        />;

      case 'ltaform':
        return <Ltaform
          handleClose={handleCloseForm}
          formId={formId ?? declaration}
          rowData={rowData}
          proofEnable={proofEnable}
          debouncedFetch={debouncedFetch}
          userRole={userRole}
        />;

      case 'HouseLoanInterest':
        return <HouseLoanInterest
          handleClose={handleCloseForm}
          formId={formId ?? declaration}
          rowData={rowData}
          proofEnable={proofEnable}
          debouncedFetch={debouncedFetch}
          userRole={userRole}
        />;

      case 'Section80C':
        return <Section80C
          handleClose={handleCloseForm}
          formId={formId ?? declaration}
          proofEnable={proofEnable}
          rowData={rowData}
          userRole={userRole}
        />;
      case 'Section80D':
        return <Section80D
          handleClose={handleCloseForm}
          formId={formId ?? declaration}
          rowData={rowData}
          proofEnable={proofEnable}
          userRole={userRole}
        />;

      case 'Section80G':
        return <Section80G
          handleClose={handleCloseForm}
          formId={formId ?? declaration}
          rowData={rowData}
          proofEnable={proofEnable}
          userRole={userRole}
        />
      default:
        return null;
    }
  };

  // Render form sections with edit buttons
  const renderFormSection = (title, formName, dataKey, description, isAlwaysEnabled = false) => {
    const formData = useSelector((state) => state.declaration[dataKey]);
    const isDisabled = taxRegime === 'new' && !isAlwaysEnabled;

    return (
      <Box
        border={1}
        borderRadius={2}
        boxShadow={2}
        position="relative"
        sx={{
          opacity: isDisabled ? 0.5 : 1,
          // backgroundColor: isDisabled ? '#f5f5f5' : 'white',
        }}
      >
        <Button
          fullWidth
          onClick={() => !isDisabled && handleOpenForm(formName)}
          sx={{
            justifyContent: 'flex-start',
            textAlign: 'left',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
          }}
          disabled={isDisabled}
        >
          <Box display="flex" justifyContent="space-between" width="100%">
            <Box>
              <Typography variant="h6">{title}</Typography>
              <Typography>
                {declaration && Object.keys(declaration).length > 0
                  ? "Data Filled"
                  : description}
              </Typography>
              {isDisabled && (
                <Typography color="error">
                  Not applicable in new tax regime
                </Typography>
              )}
            </Box>
          </Box>
        </Button>

        {/* Edit Button - Only show if data exists and not disabled */}
        {declaration && Object.keys(declaration).length > 0 && !isDisabled && (
          <IconButton
            onClick={() => handleOpenForm(formName)}
            sx={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <EditIcon />
          </IconButton>
        )}
      </Box>
    );
  };

  return (
    <>
      {/* Tax Form Main Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography style={{ fontSize: '2em' }} variant="h5" gutterBottom>
          Declaration
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <Typography variant="h6">Choise the tax regime*</Typography>
            <RadioGroup
              name="taxRegime"
              value={taxRegime}
              onChange={handleChange}
              row
            >
              <FormControlLabel
                value="new"
                control={<Radio />}
                label="New "
              />
              <FormControlLabel
                value="old"
                control={<Radio />}
                label="Old"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        {rowData && (
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update'}
            </Button>
          </Grid>
        )}
      </Grid>

      <Dialog open={!!openForm} onClose={handleCloseForm} fullWidth maxWidth="md">
        <DialogContent>
          {renderFormContent()}
        </DialogContent>
      </Dialog>

      <Box display="flex" flexDirection="column" gap={3}>
        {/* Previous Employment - Always enabled */}
        {renderFormSection(
          "Previous Employment tax Details",
          "PreviousEmp",
          "PreviousEmp",
          "Include previous salary,pf,total tax ",
          true // This section is always enabled
        )}

        {/* HRA Section */}
        {renderFormSection(
          "House Rent Allowance",
          "hraform",
          "hra",
          "Include Rent paid to the landlord, Name, Address"
        )}

        {/* LTA Section */}
        {renderFormSection(
          "Leave Travel Concessions",
          "ltaform",
          "lta",
          "Include location, Expenditure and travel details"
        )}

        {/* Deductions Section */}
        {renderFormSection(
          "Income/loss from House Property (Housing Loan Interest) ",
          "HouseLoanInterest",
          "HouseLoanInterest",
          "Include Interest payable, Name and Address of lender"
        )}

        {/* Deductions Under Chapter */}
        {renderFormSection(
          "Deduction under Section 80C ",
          "Section80C",
          "Deductionsunder",
          "Include all Investments and Expenses "
        )}
        {renderFormSection(
          "Deduction under Section 80D",
          "Section80D",
          "DeductionsunderB",
          "Include all Health insurance premiums"
        )}
        {renderFormSection(
          "Deduction under Section 80G",
          "Section80G",
          "DeductionsunderG",
          "Include all donation"
        )}
      </Box>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleToastClose}
          severity={error ? "error" : "success"}
          sx={{ width: '100%' }}
        >
          {error ? `Error: ${error}` : "Tax regime saved successfully"}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DeclarationForm;
