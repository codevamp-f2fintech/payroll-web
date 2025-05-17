import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  useTheme,
  styled
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CloseIcon from "@mui/icons-material/Close";
import { fetchReimbursements } from "@/redux/features/reimbursement/reimbursementsSlice";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import { RootState } from "@/redux/store";

// Styled components
const BorderCard = styled(Card)(({ theme, bordercolor }) => ({
  height: '100%',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: bordercolor,
    borderTopLeftRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: theme.shape.borderRadius,
  }
}));

const IconContainer = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: theme.palette.grey[100],
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 8
}));

const ReimbursementItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderRadius: 8,
  marginBottom: 8,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: theme.palette.error.main,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  }
}));

const ReimbursementDetails = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { reimbursements } = useSelector((state: RootState) => state.reimbursements);

  const [totalReimbursement, setTotalReimbursement] = useState(0);
  const [tillReimbursement, setTillReimbursement] = useState(0);
  const [reimbursementCount, setReimbursementCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const pendingReimbursements = reimbursements.filter(
    (reimbursement) => reimbursement.status === "pending"
  );

  const formatCurrency = (value) => {
    return value ? `₹${Number(value).toLocaleString()}` : "₹0";
  };

  const fetchReimbursementData = async () => {
    try {
      // Get token from localStorage instead of AsyncStorage
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const company_id = user ? user.company_id : null;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reimbursements/total-reimbursement`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token} ${company_id}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reimbursement data");
      }

      const data = await response.json();
      setTotalReimbursement(data.totalReimbursement);
      setTillReimbursement(data.tillNowReimbursement);
      setReimbursementCount(data.count);
    } catch (err) {
      console.error("Failed to fetch reimbursement data:", err);
    }
  };

  // get reimbursement amount
  useEffect(() => {
    fetchReimbursementData();
  }, []);

  const debouncedFetch = useCallback(
    debounce(() => {
      dispatch(fetchReimbursements({ page: 1, limit: 10, keyword: "" }));
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFetch();
    return debouncedFetch.cancel;
  }, [debouncedFetch]);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Reimbursement Section - Title */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          color: theme.palette.text.primary,
          mb: 2
        }}
      >
        Reimbursements
      </Typography>

      {/* Top Cards Row */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Total Reimbursements Card */}
        <Grid item xs={12} sm={6}>
          <BorderCard bordercolor={theme.palette.success.main}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <IconContainer
                  sx={{ color: theme.palette.success.main, mr: 2 }}
                >
                  <ReceiptIcon />
                </IconContainer>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Total Reimbursements
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {reimbursementCount}
              </Typography>
            </CardContent>
          </BorderCard>
        </Grid>

        {/* Pending Reimbursements Card - Clickable */}
        <Grid item xs={12} sm={6}>
          <BorderCard
            bordercolor={theme.palette.error.main}
            onClick={handleOpenDialog}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                boxShadow: theme.shadows[4],
                transition: 'box-shadow 0.3s ease-in-out',
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <IconContainer
                  sx={{ bgcolor: '#F5F7FF', color: '#F44336', mr: 2 }}
                >
                  <PendingActionsIcon />
                </IconContainer>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Pending Reimbursements
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {pendingReimbursements.length}
              </Typography>
            </CardContent>
          </BorderCard>
        </Grid>

        {/* Total Paid Amount Card */}
        <Grid item xs={12} sm={6}>
          <BorderCard bordercolor={theme.palette.warning.main}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <IconContainer
                  sx={{ color: theme.palette.warning.main, mr: 2 }}
                >
                  <CurrencyRupeeIcon />
                </IconContainer>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Total Paid Amount
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {formatCurrency(totalReimbursement)}
              </Typography>
            </CardContent>
          </BorderCard>
        </Grid>

        {/* Till Now Paid Amount Card */}
        <Grid item xs={12} sm={6}>
          <BorderCard bordercolor={theme.palette.primary.main}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <IconContainer
                  sx={{ color: theme.palette.primary.main, mr: 2 }} >
                  <CurrencyRupeeIcon />
                </IconContainer>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Till Now Paid Amt
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {formatCurrency(tillReimbursement)}
              </Typography>
            </CardContent>
          </BorderCard>
        </Grid>
      </Grid>

      {/* Dialog for Pending Reimbursements */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="pending-reimbursements-dialog"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Pending Reimbursements</Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {pendingReimbursements.length > 0 ? (
            <List>
              {pendingReimbursements.map((item) => (
                <ReimbursementItem key={item.id || Math.random().toString()}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="subtitle2">
                          {item.employee?.first_name || "Employee"}
                        </Typography>
                        <Typography variant="subtitle2" color="error.main">
                          {formatCurrency(item.amount)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Status: {item.status || "Pending"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Date: {item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}
                        </Typography>
                      </Box>
                    }
                  />
                </ReimbursementItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Typography color="text.secondary">
                No pending reimbursements found
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ReimbursementDetails;
