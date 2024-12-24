'use client'
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Button,
  Typography,
  IconButton,
  Box,
  Dialog,
  DialogContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import HraForm from './HRA';
import Ltaform from './LTA';
import Deductions from './Deductiononinterest';
import Deductionunder from './Deductionunder';
import SubmitPage from './Submit';
import BasicInfoForm from './Basicinfo';

const DeclarationForm = ({ handleClose }) => {
  const [openForm, setOpenForm] = useState(null);
  const [formId, setformId] = useState(null)



  const handleOpenForm = (formName) => {
    setOpenForm(formName);
  };

  const handleCloseForm = () => {
    setOpenForm(null);
  };

  // Render form with edit mode support
  const renderFormContent = () => {
    switch (openForm) {
      case 'Basicinfo':
        return <BasicInfoForm handleClose={handleCloseForm} setformId={setformId} />;

      case 'hraform':
        return <HraForm handleClose={handleCloseForm} formId={formId} />;

      case 'ltaform':
        return <Ltaform handleClose={handleCloseForm} formId={formId} />;

      case 'Deductions':
        return <Deductions handleClose={handleCloseForm} formId={formId} />;

      case 'Deductionunderchapter':
        return <Deductionunder handleClose={handleCloseForm} formId={formId} />;

      // case 'Submit':
      //   return <SubmitPage handleClose={handleCloseForm} />;

      default:
        return null;
    }
  };

  // Render form sections with edit buttons
  const renderFormSection = (title, formName, dataKey, description) => {
    const formData = useSelector((state) => state.declaration[dataKey]);

    return (
      <Box border={1} borderRadius={2} boxShadow={2} position="relative">
        <Button
          fullWidth
          onClick={() => handleOpenForm(formName)}
          sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
        >
          <Box display="flex" justifyContent="space-between" width="100%">
            <Box>
              <Typography variant="h6">{title}</Typography>
              <Typography>
                {formData && Object.keys(formData).length > 0
                  ? "Data Filled"
                  : description}
              </Typography>
            </Box>
            <Box>
              <Typography variant='h4'>»</Typography>
            </Box>
          </Box>
        </Button>

        {/* Edit Button - Only show if data exists */}
        {formData && Object.keys(formData).length > 0 && (
          <IconButton
            onClick={() => handleOpenForm(`Edit${formName}`)}
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
          My Declaration
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Dialog open={!!openForm} onClose={handleCloseForm} fullWidth maxWidth="md">
        <DialogContent>
          {renderFormContent()}
        </DialogContent>
      </Dialog>

      <Box display="flex" flexDirection="column" gap={3}>
        {/* Basic Info Section */}
        {renderFormSection(
          "Basic Info",
          "Basicinfo",
          "basicInfo",
          "Include Name, Designation, PAN and address"
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
          "Deduction of Interest",
          "Deductions",
          "Deductions",
          "Include Interest payable, Name and Address of lender"
        )}

        {/* Deductions Under Chapter */}
        {renderFormSection(
          "Deduction under Chapter VI-A",
          "Deductionunderchapter",
          "Deductionsunder",
          "Include Section 80C, 80CCC and 80CCD"
        )}

        {/* Submit Section */}
        {/* <Box border={1} borderRadius={2} boxShadow={2}>
          <Button fullWidth onClick={() => handleOpenForm('Submit')}>
            <Box display="flex" justifyContent="space-between" width="100%">
              <Box>
                <Typography variant="h6">Submit</Typography>
              </Box>
              <Box>
                <Typography variant='h4'>»</Typography>
              </Box>
            </Box>
          </Button>
        </Box> */}
      </Box>
    </>
  );
};

export default DeclarationForm;
