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
import EPFForm from './EPF';
import ESIForm from './ESI';
import LWFForm from './LWF';
import ProfessionalTaxForm from './ProfessionalTax';
import StatutoryBonusform from './StatutoryBonus';

const StatutoryComponentsForm = ({ handleClose, declaration, debouncedFetch, components = [] }) => {
  const [openForm, setOpenForm] = useState(null);
  const [formId, setformId] = useState(null)

  const rowData = Array.isArray(components.data) && declaration
    ? components.data.find((declare) => declare._id === declaration)
    : null;

  console.log('rowdata', rowData, declaration, components)
  const handleOpenForm = (formName) => {
    setOpenForm(formName);
  };

  const handleCloseForm = () => {
    setOpenForm(null);
  };

  const renderFormContent = () => {
    switch (openForm) {
      case 'EPF':
        return <EPFForm
          handleClose={handleCloseForm}
          setformId={setformId}
          rowData={rowData}
          declaration={declaration}
          debouncedFetch={debouncedFetch}

        />;

      case 'ESI':
        return <ESIForm
          handleClose={handleCloseForm}
          formId={formId ?? declaration}
          rowData={rowData}
          debouncedFetch={debouncedFetch}
        />;

      // case 'LWF':
      //   return <LWFForm
      //     handleClose={handleCloseForm}
      //     formId={formId ?? declaration}
      //     rowData={rowData}
      //     debouncedFetch={debouncedFetch}
      //   />;

      case 'ProfessionalTax':
        return <ProfessionalTaxForm
          handleClose={handleCloseForm}
          formId={formId ?? declaration}
          rowData={rowData}
          debouncedFetch={debouncedFetch}
        />;

      case 'StatutoryBonus':
        return <StatutoryBonusform
          handleClose={handleCloseForm}
          formId={formId ?? declaration}
          rowData={rowData}
          debouncedFetch={debouncedFetch}


        />;
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
                {declaration && Object.keys(declaration).length > 0
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
        {declaration && Object.keys(declaration).length > 0 && (
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
          Statutory Components
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
          "Employees' Provident Fund (EPF) ",
          "EPF",
          "EPF",
          "Include EPF Number,Deduction Cycle,Employee and Employer Contribution "
        )}

        {/* HRA Section */}
        {renderFormSection(
          "Employees' State Insurance (ESI)",
          "ESI",
          "ESI",
          "Include ESI Nubmer,Employee and Employer Contribution"
        )}

        {/* LTA Section */}
        {/* {renderFormSection(
          "Labour Welfare Fund",
          "LWF",
          "LWF",
          "Include LWF Number,Employee and Employer Contribution"
        )} */}

        {/* Deductions Section */}
        {renderFormSection(
          "Professional Tax",
          "ProfessionalTax",
          "ProfessionalTax",
          "Include Professional Tax"
        )}

        {/* Deductions Under Chapter */}
        {renderFormSection(
          "Statutory Bonus ",
          "StatutoryBonus",
          "StatutoryBonus",
          "Include Bonus payment cycle, percentage of bonus "
        )}

      </Box>
    </>
  );
};

export default StatutoryComponentsForm;
