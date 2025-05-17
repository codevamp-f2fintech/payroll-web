import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayrollsByEmployeeId } from '@/redux/features/payroll/payrollSlice';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Button,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Chip,
  Container,
  Avatar,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Person,
  CalendarMonth,
  Payments,
  RemoveCircle,
  AccountBalanceWallet,
  Timeline,
  FileDownload,
  CheckCircle,
  History,
  Visibility,
  AccessTime,
  EventBusy,
  EventAvailable,
  CalendarToday,
  TrendingUp
} from '@mui/icons-material';

import { usePayslip } from '@/utility/payslipGenerater/PayslipGenerater';

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return 'N/A';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

const PayrollDashboard = () => {
  const dispatch = useDispatch();
  const { generatePayslip, downloadPayslip, PayslipLayout, setSelectedEmployee } = usePayslip();

  const { filteredByEmployee, isLoading } = useSelector((state) => state.payrolls);

  const [userId, setUserId] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Modal states
  const [openPayrollModal, setOpenPayrollModal] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const contentRef = useRef()

  // Filter menu
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const {
    selectedEmployee,

  } = usePayslip()


  useEffect(() => {
    const getUserData = async () => {
      try {
        // For Next.js, use localStorage instead of AsyncStorage
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.id);
        }
      } catch (error) {
        console.error("Error retrieving user data:", error);
      }
    };

    getUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      dispatch(
        fetchPayrollsByEmployeeId({
          employeeId: userId,
          page: 1,
          limit: 10,
          month: selectedMonth,
          year: selectedYear,
        })
      );
    }
  }, [userId, selectedMonth, selectedYear, dispatch]);

  const handleViewPayroll = (payroll) => {
    setSelectedPayroll(payroll);
    setOpenPayrollModal(true);
  };

  const handleClosePayrollModal = () => {
    setOpenPayrollModal(false);
  };

  const handleOpenHistoryModal = () => {
    setOpenHistoryModal(true);
  };

  const handleCloseHistoryModal = () => {
    setOpenHistoryModal(false);
  };


  const handleDownloadPdf = async () => {
    if (!selectedPayroll) return;

    try {

      setPdfLoading(true);
      const employeeWithPayslip = await generatePayslip(selectedPayroll);
      downloadPayslip(contentRef, employeeWithPayslip);
      setTimeout(() => {
        setPdfLoading(false);
        alert("PDF downloaded successfully!");
      }, 1500);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setPdfLoading(false);
    }
  };

  // Get current month's payroll if available
  const currentPayroll = filteredByEmployee && filteredByEmployee.length > 0 ? filteredByEmployee[0] : null;


  // Render loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" color="primary" sx={{ mt: 2 }}>
          Loading payroll data...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Payroll Section - Title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Payroll
        </Typography>
      </Box>

      {/* First row of cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Gross Earnings Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{
            height: '100%',
            borderLeft: '4px solid #FF9800',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    backgroundColor: '#F5F7FF',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mr: 2,
                  }}
                >
                  <Payments sx={{ color: '#FF9800' }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Gross Earnings
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {currentPayroll ? formatCurrency(currentPayroll.grossEarnings) : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Deductions Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{
            height: '100%',
            borderLeft: '4px solid #F44336',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    backgroundColor: '#F5F7FF',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mr: 2,
                  }}
                >
                  <RemoveCircle sx={{ color: '#F44336' }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Total Deductions
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {currentPayroll ? formatCurrency(currentPayroll.totalDeductions) : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Net Salary Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{
            height: '100%',
            borderLeft: '4px solid #4CAF50',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    backgroundColor: '#F5F7FF',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mr: 2,
                  }}
                >
                  <AccountBalanceWallet sx={{ color: '#4CAF50' }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Net Salary
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {currentPayroll ? formatCurrency(currentPayroll.netSalary) : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Second row of action cards */}
      <Grid container spacing={3}>
        {/* Payroll History Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              borderLeft: '4px solid #2196F3',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }
            }}
            onClick={handleOpenHistoryModal}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    backgroundColor: '#F5F7FF',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mr: 2,
                  }}
                >
                  <History sx={{ color: '#2196F3' }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Payroll History
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                View your complete payroll history
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* View Details Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              borderLeft: '4px solid #9C27B0',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }
            }}
            onClick={() => currentPayroll && handleViewPayroll(currentPayroll)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    backgroundColor: '#F5F7FF',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mr: 2,
                  }}
                >
                  <Visibility sx={{ color: '#9C27B0' }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary">
                  View Details
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Check current month's salary details
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Download Pay Slip Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              borderLeft: '4px solid #FF5722',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }
            }}
            onClick={() => {
              if (currentPayroll) {
                setSelectedPayroll(currentPayroll);
                handleDownloadPdf();
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    backgroundColor: '#F5F7FF',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mr: 2,
                  }}
                >
                  <FileDownload sx={{ color: '#FF5722' }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Download Pay Slip
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {pdfLoading ? 'Downloading...' : 'Get your latest pay slip'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payroll Details Modal */}
      <Modal
        open={openPayrollModal}
        onClose={handleClosePayrollModal}
        aria-labelledby="payroll-detail-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 800,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          {selectedPayroll && (
            <>
              <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
                Payroll Details
              </Typography>

              {/* Employee Information Section */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">
                    Employee
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">Name:</Typography>
                    <Typography variant="body1">
                      {selectedPayroll.employee?.first_name} {selectedPayroll.employee?.last_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">Designation:</Typography>
                    <Typography variant="body1">{selectedPayroll.employee?.designation}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">Employee Code:</Typography>
                    <Typography variant="body1">{selectedPayroll.employee?.code}</Typography>
                  </Grid>
                </Grid>
              </Box>
              <Divider sx={{ my: 2 }} />

              {/* Pay Period Section */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarMonth sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">
                    Pay Period
                  </Typography>
                </Box>
                <Typography variant="body1">{formatDate(selectedPayroll.payPeriod)}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />

              {/* Earnings Section */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Payments sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">
                    Earnings
                  </Typography>
                </Box>
                <Grid container spacing={1}>
                  {selectedPayroll.earnings && selectedPayroll.earnings.map((item, index) => (
                    <Grid item xs={12} key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">{item.type}:</Typography>
                        <Typography variant="body1">
                          {formatCurrency(Number(item.monthlyAmount).toFixed(2))}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 2,
                  pt: 1,
                  borderTop: '1px solid #eee'
                }}>
                  <Typography variant="subtitle1" fontWeight="bold">Total Earnings:</Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {formatCurrency(selectedPayroll.grossEarnings)}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />

              {/* Deductions Section */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <RemoveCircle sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">
                    Deductions
                  </Typography>
                </Box>
                <Grid container spacing={1}>
                  {selectedPayroll.deductions && selectedPayroll.deductions.map((item, index) => (
                    <Grid item xs={12} key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">{item.type || 'Item'}:</Typography>
                        <Typography variant="body1">{formatCurrency(item.monthlyAmount)}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 2,
                  pt: 1,
                  borderTop: '1px solid #eee'
                }}>
                  <Typography variant="subtitle1" fontWeight="bold">Total Deductions:</Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {formatCurrency(selectedPayroll.totalDeductions)}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />

              {/* Net Pay Section */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalanceWallet sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">
                    Net Pay
                  </Typography>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: '#e8f5e9',
                    p: 2,
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    Net Pay:
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {formatCurrency(selectedPayroll.netSalary)}
                  </Typography>
                </Paper>
              </Box>

              {/* Payment Information */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Timeline sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">
                    Payment Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Payment Date:</Typography>
                    <Typography variant="body1">
                      {formatDate(selectedPayroll.paymentDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Payment Method:</Typography>
                    <Typography variant="body1">
                      {selectedPayroll.paymentMethod || 'Direct Transfer'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleClosePayrollModal}
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={pdfLoading ? <CircularProgress size={20} color="inherit" /> : <FileDownload />}
                  onClick={handleDownloadPdf}
                  disabled={pdfLoading}
                >
                  {pdfLoading ? 'Downloading...' : 'Download Pay Slip'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Payroll History Modal */}
      <Modal
        open={openHistoryModal}
        onClose={handleCloseHistoryModal}
        aria-labelledby="payroll-history-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 1000,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Payroll History
          </Typography>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : filteredByEmployee && filteredByEmployee.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Pay Period</TableCell>
                    <TableCell align="right">Gross Earnings</TableCell>
                    <TableCell align="right">Deductions</TableCell>
                    <TableCell align="right">Net Salary</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredByEmployee.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell>
                        {formatDate(payroll.payPeriod)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(payroll.grossEarnings)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(payroll.totalDeductions)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          {formatCurrency(payroll.netSalary)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={payroll.status}
                          color={payroll.status === 'paid' ? 'success' : 'warning'}
                          size="small"
                          icon={payroll.status === 'paid' ? <CheckCircle fontSize="small" /> : <AccessTime fontSize="small" />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewPayroll(payroll)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Pay Slip">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedPayroll(payroll);
                              handleDownloadPdf();
                            }}
                          >
                            <FileDownload fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="textSecondary">
                No payroll history found
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleCloseHistoryModal}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
      <div style={{ display: 'none' }}>
        <div ref={contentRef}>
          {selectedEmployee && <PayslipLayout employee={selectedEmployee} />}
        </div>
      </div>
    </Container>
  );
};

export default PayrollDashboard;
