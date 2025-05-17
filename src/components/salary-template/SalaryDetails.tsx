import { Dialog, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableRow, Typography, Box, TableHead, TableContainer, Paper } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';

const SalaryDetails = ({ open, onClose, data }) => {
  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      maxWidth="md"
      fullWidth
    >
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
      <DialogContent>
        <Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <Typography variant="h4">SalaryTemplate Details</Typography>
                <TableRow>
                  <TableCell><Typography fontWeight="bold">Salary Component</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Calculation Type</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Monthly Amount</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">yearly Amount</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <>
                  <Typography variant="h6" gutterBottom>Fixed Allowance</Typography>
                  <TableRow>
                    <TableCell>{data.components.basic.type}</TableCell>
                    <TableCell>{`${data.components.basic.percentage} % of ctc`}</TableCell>
                    <TableCell>₹{Number(data.components.basic.monthlyAmount).toFixed(2)}</TableCell>
                    <TableCell>₹{data.components.basic.yearlyAmount}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{data.components.fixedAllowance.type}</TableCell>
                    <TableCell>{`${data.components.fixedAllowance.percentage} % of ctc`}</TableCell>
                    <TableCell>₹{Number(data.components.fixedAllowance.monthlyAmount).toFixed(2)}</TableCell>
                    <TableCell>₹{data.components.fixedAllowance.yearlyAmount}</TableCell>
                  </TableRow>
                </>
                {data.earnings.map((earning, index) => (
                  <>
                    <Typography variant="h6" gutterBottom>Earning</Typography>
                    <TableRow key={index}>
                      <TableCell>{earning.type}</TableCell>
                      <TableCell> {earning.type === 'HRA' ? `${earning.amount}% of Basic` : `₹${earning.amount}`}</TableCell>
                      <TableCell>₹{Number(earning.monthlyAmount).toFixed(2)}</TableCell>
                      <TableCell>₹{earning.yearlyAmount}</TableCell>
                    </TableRow>
                  </>
                ))}
                {data.benefits.map((benefit, index) => (
                  <><Typography variant="h6" gutterBottom>Benefits</Typography><TableRow key={index}>
                    <TableCell>{benefit.type}</TableCell>
                    <TableCell> {`₹${benefit.amount}`}</TableCell>
                    <TableCell>₹{Number(benefit.monthlyAmount).toFixed(2)}</TableCell>
                    <TableCell>₹{benefit.yearlyAmount}</TableCell>
                  </TableRow></>
                ))}
                {data.reimbursements.map((reimbursement, index) => (
                  <><Typography variant="h6" gutterBottom>Reimbursements</Typography><TableRow key={index}>
                    <TableCell>{reimbursement.type}</TableCell>
                    <TableCell> {`₹${reimbursement.amount}`}</TableCell>
                    <TableCell>₹{Number(reimbursement.monthlyAmount).toFixed(2)}</TableCell>
                    <TableCell>₹{reimbursement.yearlyAmount}</TableCell>
                  </TableRow></>
                ))}
                {data.deductions.map((deduction, index) => (
                  <>
                    <Typography variant="h6" gutterBottom>Deductions</Typography>
                    <TableRow key={index}>
                      <TableCell>{deduction.type}</TableCell>
                      <TableCell> {deduction.type === 'EPF' ? `${deduction.amount}% of Basic` : `₹${deduction.amount}`}</TableCell>
                      <TableCell>₹{Number(deduction.monthlyAmount).toFixed(2)}</TableCell>
                      <TableCell>₹{deduction.yearlyAmount}</TableCell>
                    </TableRow>
                  </>
                ))}
                <TableRow>
                  <TableCell>Cost to COMPANY</TableCell>
                  <TableCell> { }</TableCell>
                  <TableCell>₹{Number(data.monthlyCTC).toFixed(2)}</TableCell>
                  <TableCell>₹{data.ctc}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default SalaryDetails
