import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableRow, Typography, Box } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const SectionTitle = styled(Typography)({
  fontWeight: 'bold',
  marginTop: '20px',
  marginBottom: '10px',
  borderBottom: '2px solid #2e7d32',
  paddingBottom: '5px',
});

interface DeclarationViewProps {
  open: boolean;
  onClose: () => void;
  data: any;
}

const DeclarationView = ({ open, onClose, data }: DeclarationViewProps) => {
  console.log("data", data);
  return (
    <BootstrapDialog
      onClose={onClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Employee Declaration Details
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <Box>
          {/* Basic Info Section */}
          <SectionTitle variant="h6">Basic Information</SectionTitle>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Name</TableCell>
                <TableCell>{data?.basicInfo?.name || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Designation</TableCell>
                <TableCell>{data?.basicInfo?.designation || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>PAN</TableCell>
                <TableCell>{data?.basicInfo?.pan || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
                <TableCell>{data?.basicInfo?.address || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Financial Year</TableCell>
                <TableCell>{data?.basicInfo?.financialYear || 'N/A'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* HRA Section */}
          <SectionTitle variant="h6">House Rent Allowance (HRA)</SectionTitle>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Rent Paid to Landlord</TableCell>
                <TableCell>{data?.hra?.houseRent || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Landlord Name</TableCell>
                <TableCell>{data?.hra?.landlordName || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Landlord Address</TableCell>
                <TableCell>{data?.hra?.landlordAddress || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Proof</TableCell>
                <TableCell>{data?.hra?.proof || 'No proof uploaded'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* LTA Section */}
          <SectionTitle variant="h6">Leave Travel Allowance (LTA)</SectionTitle>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Travel Amount</TableCell>
                <TableCell>{data?.lta?.travelAmount || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                <TableCell>{data?.lta?.location || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Mode</TableCell>
                <TableCell>{data?.lta?.travelMode || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell>{data?.lta?.travelDate || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Proof</TableCell>
                <TableCell>{data?.lta?.proof || 'No proof uploaded'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Deduction Section */}
          <SectionTitle variant="h6">Deduction</SectionTitle>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Amount paid to lender</TableCell>
                <TableCell>{data?.deductions?.
                  interestPayable || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Lender Name</TableCell>
                <TableCell>{data?.deductions?.
                  lenderName
                  || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Lender Address</TableCell>
                <TableCell>{data?.deductions?.
                  lenderAddress || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Proof</TableCell>
                <TableCell>{data?.deductions?.proof || 'No proof uploaded'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

        </Box>
      </DialogContent>
    </BootstrapDialog>
  );
};

export default DeclarationView;
