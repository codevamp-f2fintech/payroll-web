import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  useTheme
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import PaymentsIcon from "@mui/icons-material/Payments";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import { fetchLoans } from "@/redux/features/loan/loanSlice";

// Styled components
const StyledCard = styled(Card)(({ theme, bordercolor }) => ({
  height: "100%",
  borderLeft: `4px solid ${bordercolor}`,
  transition: "transform 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

const IconContainer = styled(Box)(({ theme, bgcolor }) => ({
  width: 40,
  height: 40,
  borderRadius: "50%",
  backgroundColor: bgcolor || theme.palette.grey[100],
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: theme.spacing(1),
}));

const ModalContent = styled(Paper)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 700,
  maxHeight: "80vh",
  overflow: "auto",
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  outline: "none",
}));

const LoansDetails = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { loans } = useSelector((state) => state.loans);

  const [totalLoans, setTotalLoans] = useState(0);
  const [tillLoans, setTillLoans] = useState(0);
  const [loansCount, setLoansCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const pendingLoans = loans.filter((loan) => loan.status === "pending");

  const formatCurrency = (value) => {
    return value ? `₹${Number(value).toLocaleString()}` : "₹0";
  };

  const fetchLoansData = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      const company_id = user ? JSON.parse(user).company_id : null;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/loan/total-loans`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token} ${company_id}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payroll data");
      }

      const data = await response.json();
      setTotalLoans(data.totalLoans);
      setTillLoans(data.tillNowLoans);
      setLoansCount(data.count);
    } catch (error) {
      console.error("Failed to fetch payroll data:", error);
    }
  };

  // get loans amount
  useEffect(() => {
    fetchLoansData();
  }, []);

  const debouncedFetch = useCallback(
    debounce(() => {
      dispatch(fetchLoans({ page: 1, limit: 10, keyword: "" }));
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFetch();
    return debouncedFetch.cancel;
  }, [debouncedFetch]);

  // Handle modal open/close
  const handleOpenModal = () => setModalVisible(true);
  const handleCloseModal = () => setModalVisible(false);

  return (
    <Box sx={{ p: 3 }}>
      {/* Loans Section - Title */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Loans
      </Typography>

      {/* Top Row Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Loans Card */}
        <Grid item xs={12} sm={6}>
          <StyledCard bordercolor={theme.palette.success.main}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <IconContainer
                  sx={{ color: theme.palette.success.main, mr: 2 }}>
                  <RequestQuoteIcon />
                </IconContainer>
                <Typography variant="subtitle1" color="text.secondary">
                  Total Loans
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {loansCount}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Pending Loans Card - Clickable */}
        <Grid item xs={12} sm={6}>
          <StyledCard
            bordercolor={theme.palette.error.main}
            onClick={handleOpenModal}
            sx={{ cursor: "pointer" }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>

                <IconContainer
                  sx={{ color: theme.palette.error.main, mr: 2 }}>
                  <PendingActionsIcon />
                </IconContainer>
                <Typography variant="subtitle1" color="text.secondary">
                  Pending Loans
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {pendingLoans.length}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Total Paid Amount Card */}
        <Grid item xs={12} sm={6}>
          <StyledCard bordercolor={theme.palette.warning.main}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <IconContainer
                  sx={{ color: theme.palette.warning.main, mr: 2 }} >
                  <CurrencyRupeeIcon />
                </IconContainer>
                <Typography variant="subtitle1" color="text.secondary">
                  Total Paid Amount
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(totalLoans)}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Till Now Paid Amount Card */}
        <Grid item xs={12} sm={6}>
          <StyledCard bordercolor={theme.palette.primary.main}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <IconContainer
                  sx={{ color: theme.palette.primary.main, mr: 2 }} >
                  <PaymentsIcon />
                </IconContainer>
                <Typography variant="subtitle1" color="text.secondary">
                  Till Now Paid Amount
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(tillLoans)}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Modal for Pending Loans */}
      <Modal
        open={modalVisible}
        onClose={handleCloseModal}
        aria-labelledby="pending-loans-modal"
        aria-describedby="list-of-pending-loans"
      >
        <ModalContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" component="h2" fontWeight="bold">
              Pending Loans
            </Typography>
            <IconButton onClick={handleCloseModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {pendingLoans.length > 0 ? (
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingLoans.map((loan) => (
                    <TableRow key={loan.id || Math.random().toString()}>
                      <TableCell>{loan.employee?.first_name || "Employee"}</TableCell>
                      <TableCell>{formatCurrency(loan.amount)}</TableCell>
                      <TableCell>{loan.status || "Pending"}</TableCell>
                      <TableCell>
                        {loan.created_at
                          ? new Date(loan.created_at).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">No pending loans found</Typography>
            </Box>
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LoansDetails;
