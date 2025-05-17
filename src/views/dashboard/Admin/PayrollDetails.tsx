import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Modal,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { fetchPayrolls } from '@/redux/features/payroll/payrollSlice';
import { apiResponse, employeesCountResponse } from '@/utility/apiResponse/employeesResponse'
import { RootState } from '@/redux/store';

const PayrollDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();

  const { payrolls } = useSelector((state: RootState) => state.payrolls);
  const [unpaidEmployees, setUnpaidEmployees] = useState([]);
  const [totalPayroll, setTotalPayroll] = useState(0);
  const [tillPayroll, setTillPayroll] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paidModalOpen, setPaidModalOpen] = useState(false);
  const [unpaidModalOpen, setUnpaidModalOpen] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatCurrency = (value) => {
    return value ? `₹${Number(value).toLocaleString()}` : '₹0';
  };

  const debouncedFetch = useCallback(
    debounce(() => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      dispatch(fetchPayrolls({ page: 1, limit: 10, keyword: '', year: currentYear, month: currentMonth }));
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFetch();
    return debouncedFetch.cancel;
  }, [debouncedFetch]);

  const fetchPayrollData = async () => {
    const token = localStorage?.getItem("token") || '{}';
    const { company_id } = typeof window !== "undefined" ? JSON.parse(localStorage?.getItem("user")) : {};
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/payroll/total-payroll`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token} ${company_id}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch payroll data');
      }

      const data = await response.json();
      setTotalPayroll(data.totalSalary);
      setTillPayroll(data.tillNowSalary);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch payroll data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Placeholder for the API call - you'll need to implement this function
        const employeesData = await apiResponse();

        const payrollEmployeeIds = new Set(
          payrolls.map((payroll) => payroll.employee._id)
        );

        const filteredEmployees = employeesData.filter(
          (employee) =>
            !payrollEmployeeIds.has(employee._id) &&
            employee.role_priority !== '1'
        );

        setUnpaidEmployees(filteredEmployees);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, [payrolls]);

  const handleClosePaidModal = () => setPaidModalOpen(false);
  const handleCloseUnpaidModal = () => setUnpaidModalOpen(false);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress color="primary" />
        <Typography sx={{ mt: 2, color: 'primary.main' }}>
          Loading payroll data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, py: 2, minHeight: '50vh' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        Payroll
      </Typography>

      {/* First row of cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Paid Employees Card */}
        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              borderLeft: '4px solid #4CAF50',
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }
            }}
            onClick={() => setPaidModalOpen(true)}
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
                  <PeopleIcon sx={{ color: '#4CAF50' }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Paid Employees
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {payrolls.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Unpaid Employees Card */}
        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              borderLeft: '4px solid #F44336',
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }
            }}
            onClick={() => setUnpaidModalOpen(true)}
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
                  <AccessTimeIcon sx={{ color: '#F44336' }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Unpaid Employees
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {unpaidEmployees.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Second row of cards */}
      <Grid container spacing={2}>
        {/* Total Payroll Amount */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderLeft: '4px solid #FF9800', height: '100%' }}>
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
                  <AttachMoneyIcon sx={{ color: '#FF9800' }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Total Paid Amount
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(totalPayroll)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Till Now Amount */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderLeft: '4px solid #2196F3', height: '100%' }}>
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
                  <AccountBalanceWalletIcon sx={{ color: '#2196F3' }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Till Now Paid Amt
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(tillPayroll)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Paid Employees Modal */}
      <Modal
        open={paidModalOpen}
        onClose={handleClosePaidModal}
        aria-labelledby="paid-employees-modal"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '90%' : 500,
            maxHeight: '80vh',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            overflow: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 1, borderBottom: '1px solid #f0f0f0' }}>
            <Typography variant="h6" component="h2">
              Paid Employees
            </Typography>
            <IconButton onClick={handleClosePaidModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {payrolls.length > 0 ? (
            <List sx={{ pt: 0 }}>
              {payrolls.map((item) => (
                <React.Fragment key={item._id || Math.random().toString()}>
                  <ListItem sx={{ borderRadius: 1, mb: 1, borderLeft: '3px solid #4361EE', px: 2 }}>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {item.employee.first_name} {item.employee.last_name}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                          {formatCurrency(item.netSalary)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          {item.employee?.designation || 'Employee'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(item?.payDate || 'N/A')}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography sx={{ textAlign: 'center', color: 'text.secondary', my: 3 }}>
              No paid employees found
            </Typography>
          )}
        </Box>
      </Modal>

      {/* Unpaid Employees Modal */}
      <Modal
        open={unpaidModalOpen}
        onClose={handleCloseUnpaidModal}
        aria-labelledby="unpaid-employees-modal"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '90%' : 500,
            maxHeight: '80vh',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            overflow: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 1, borderBottom: '1px solid #f0f0f0' }}>
            <Typography variant="h6" component="h2">
              Unpaid Employees
            </Typography>
            <IconButton onClick={handleCloseUnpaidModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {unpaidEmployees.length > 0 ? (
            <List sx={{ pt: 0 }}>
              {unpaidEmployees.map((item) => (
                <React.Fragment key={item._id || Math.random().toString()}>
                  <ListItem sx={{ borderRadius: 1, mb: 1, borderLeft: '3px solid #4361EE', px: 2 }}>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {item.first_name} {item.last_name}
                        </Typography>
                        {/* <Button
                          variant="contained"
                          size="small"
                          sx={{
                            bgcolor: '#4361EE',
                            '&:hover': {
                              bgcolor: '#3651d4'
                            }
                          }}
                        >
                          Process
                        </Button> */}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          {item.designation || 'Employee'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#FF9800' }}>
                          Pending
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography sx={{ textAlign: 'center', color: 'text.secondary', my: 3 }}>
              All employees have been paid
            </Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default PayrollDashboard;
