import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Box,
  TableHead,
  TableContainer,
  Paper
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const LoanDetails = ({ open, onClose, data }) => {

  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Loan Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><Typography fontWeight="bold">Loan Type</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Loan Amount</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Installment</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Paid Amount</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Remaining Amount</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableCell>{data.loantype}</TableCell>
                <TableCell>{data.amount}</TableCell>
                <TableCell>{data.installment}</TableCell>
                <TableCell>{data.paidAmount || 0}</TableCell>
                <TableCell>{data.remainingAmount || 0}</TableCell>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoanDetails;
