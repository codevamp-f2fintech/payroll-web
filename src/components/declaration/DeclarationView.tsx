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
          {/* Previous Employment tax Details */}
          <SectionTitle variant="h6">Previous Employment tax Details</SectionTitle>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Previous Salary</TableCell>
                <TableCell>{data?.PreviousEmp?.previousSalary || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>PF</TableCell>
                <TableCell>{data?.PreviousEmp?.pf || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Total Tax</TableCell>
                <TableCell>{data?.PreviousEmp?.totalTax || 'N/A'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* HRA Section */}
          {data?.hra && (
            <>
              <SectionTitle variant="h6">House Rent Allowance (HRA)</SectionTitle>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Rent Paid to Landlord</TableCell>
                    <TableCell>{data.hra.houseRent || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Landlord Name</TableCell>
                    <TableCell>{data.hra.landlordName || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Landlord Address</TableCell>
                    <TableCell>{data.hra.landlordAddress || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Proof</TableCell>
                    <TableCell>{data.hra.proof || 'No proof uploaded'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}

          {/* LTA Section */}
          {data?.lta && (
            <>
              <SectionTitle variant="h6">Leave Travel Allowance (LTA)</SectionTitle>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Travel Amount</TableCell>
                    <TableCell>{data.lta.travelAmount || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell>{data.lta.location || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mode</TableCell>
                    <TableCell>{data.lta.travelMode || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell>{data.lta.travelDate || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Proof</TableCell>
                    <TableCell>{data.lta.proof || 'No proof uploaded'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}

          {/* Housing Loan interest */}
          {data?.HouseLoanInterest && (
            <>
              <SectionTitle variant="h6">Income/loss from House Property (Housing Loan interest)</SectionTitle>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Amount paid to lender</TableCell>
                    <TableCell>{data.HouseLoanInterest.interestPayable || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Lender Name</TableCell>
                    <TableCell>{data.HouseLoanInterest.lenderName || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Lender Address</TableCell>
                    <TableCell>{data.HouseLoanInterest.lenderAddress || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Proof</TableCell>
                    <TableCell>{data.HouseLoanInterest.proof || 'No proof uploaded'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}

          {/* Section 80C */}
          {Array.isArray(data?.Section80C) && data.Section80C.length > 0 && (
            <>
              <SectionTitle variant="h6">Section 80C</SectionTitle>
              {data.Section80C.map((section, index) => (
                <Box key={section._id || index} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Item {index + 1}: {section.sectionname}
                  </Typography>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Section Name</TableCell>
                        <TableCell>{section.sname || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                        <TableCell>{section.amount || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell>{section.status || 'Pending'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Proof</TableCell>
                        <TableCell>
                          {Array.isArray(section.proof) && section.proof.length > 0
                            ? section.proof[0]
                            : 'No proof uploaded'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              ))}
            </>
          )}

          {/* Section 80D */}
          {Array.isArray(data?.Section80D) && data.Section80D.length > 0 && (
            <>
              <SectionTitle variant="h6">Section 80D</SectionTitle>
              {data.Section80D.map((section, index) => (
                <Box key={section._id || index} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Item {index + 1}: {section.name}
                  </Typography>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Section Name</TableCell>
                        <TableCell>{section.sectionname || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                        <TableCell>{section.amount || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell>{section.status || 'Pending'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Proof</TableCell>
                        <TableCell>
                          {Array.isArray(section.proof) && section.proof.length > 0
                            ? section.proof[0]
                            : 'No proof uploaded'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              ))}
            </>
          )}
        </Box>
      </DialogContent>
    </BootstrapDialog>
  );
};

export default DeclarationView;
