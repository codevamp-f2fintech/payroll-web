import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { debounce } from 'lodash';
import { fetchDeclarations } from "@/redux/features/declaration/declarationSlice";

// MUI Components
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Modal,
  IconButton,
  List,
  Avatar,
  Chip,
  Paper,
  Container,
  Divider
} from '@mui/material';

// MUI Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorIcon from '@mui/icons-material/Error';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';

// Import DeclarationPeriod component
import DeclarationPeriod from '../ConfigurationPeriod';

const DeclarationSummary = () => {
  const dispatch = useDispatch();
  const { declarations } = useSelector((state) => state.declaration);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeStatus, setActiveStatus] = useState(null);
  const [selectedDeclarations, setSelectedDeclarations] = useState([]);

  const debouncedFetch = useCallback(
    debounce(() => {
      dispatch(fetchDeclarations({ page: 1, limit: 10, keyword: '' }));
    }, 300),
    [dispatch]
  );

  useEffect(() => {
    debouncedFetch();
    return debouncedFetch.cancel;
  }, [debouncedFetch]);

  // Transform the nested declaration data into flattened rows
  const transformedDeclarations = useMemo(() => {
    if (!Array.isArray(declarations)) return [];

    return declarations.flatMap((declaration) => {
      const rows = [];
      if (declaration.hra) {
        rows.push({
          id: `${declaration._id}`,
          declarationId: declaration.hra._id,
          type: "HRA",
          amount: declaration.hra.houseRent || "N/A",
          proof: declaration.hra.proof || null,
          status: declaration.hra.status || "Pending"
        });
      }
      if (declaration.lta) {
        rows.push({
          id: `${declaration._id}`,
          declarationId: declaration.lta._id,
          type: "LTA",
          amount: declaration.lta.travelAmount || "N/A",
          proof: declaration.lta.proof || null,
          status: declaration.lta.status || "Pending"
        });
      }
      if (declaration.HouseLoanInterest) {
        rows.push({
          id: `${declaration._id}`,
          declarationId: declaration.HouseLoanInterest._id,
          type: "Housing Loan Interest",
          amount: declaration.HouseLoanInterest.interestPayable || "N/A",
          proof: declaration.HouseLoanInterest.proof || null,
          status: declaration.HouseLoanInterest.status || "Pending"
        });
      }
      if (declaration.Section80C && Array.isArray(declaration.Section80C)) {
        declaration.Section80C.forEach((section) => {
          rows.push({
            id: `${declaration._id}`,
            declarationId: section._id,
            type: `Section 80C - ${section.name}`,
            amount: section.amount || "N/A",
            proof: Array.isArray(section.proof) ? section.proof[0] || null : section.proof || null,
            status: section.status || "Pending"
          });
        });
      }
      if (declaration.Section80D && Array.isArray(declaration.Section80D)) {
        declaration.Section80D.forEach((section) => {
          rows.push({
            id: `${declaration._id}`,
            declarationId: section._id,
            type: `Section 80D - ${section.name}`,
            amount: section.amount || "N/A",
            proof: Array.isArray(section.proof) ? section.proof[0] || null : section.proof || null,
            status: section.status || "Pending"
          });
        });
      }
      if (declaration.Section80G) {
        rows.push({
          id: `${declaration._id}`,
          declarationId: declaration.Section80G._id,
          type: "Section 80G",
          amount: declaration.Section80G.amount || "N/A",
          proof: declaration.Section80G.proof || null,
          status: declaration.Section80G.status || "Pending"
        });
      }
      return rows;
    });
  }, [declarations]);

  // Count the declarations by status
  const statusCounts = useMemo(() => {
    const counts = {
      approved: 0,
      pending: 0,
      noProof: 0,
      total: transformedDeclarations.length
    };

    transformedDeclarations.forEach(dec => {
      if (dec.status.toLowerCase() === 'approved') {
        counts.approved++;
      } else if (dec.status.toLowerCase() === 'pending') {
        counts.pending++;
      }

      if (!dec.proof) {
        counts.noProof++;
      }
    });

    return counts;
  }, [transformedDeclarations]);

  const openModal = (status) => {
    let filtered = [];

    switch (status) {
      case 'approved':
        filtered = transformedDeclarations.filter(dec =>
          dec.status.toLowerCase() === 'approved');
        break;
      case 'pending':
        filtered = transformedDeclarations.filter(dec =>
          dec.status.toLowerCase() === 'pending');
        break;
      case 'noProof':
        filtered = transformedDeclarations.filter(dec => !dec.proof);
        break;
      default:
        filtered = [...transformedDeclarations];
    }

    setSelectedDeclarations(filtered);
    setActiveStatus(status);
    setModalVisible(true);
  };

  const getModalTitle = () => {
    switch (activeStatus) {
      case 'approved': return 'Approved Declarations';
      case 'pending': return 'Pending Declarations';
      case 'noProof': return 'Declarations Without Proof';
      default: return 'All Declarations';
    }
  };

  const getStatusChipColor = (status) => {
    return status.toLowerCase() === 'approved' ? 'success' : 'warning';
  };

  // Configuration for card styling
  const cardConfig = {
    approved: {
      color: '#4CAF50',
      icon: <CheckCircleIcon />,
      title: 'Approved'
    },
    pending: {
      color: '#F39C12',
      icon: <AccessTimeIcon />,
      title: 'Pending'
    },
    noProof: {
      color: '#F44336',
      icon: <ErrorIcon />,
      title: 'No Proof'
    },
    total: {
      color: '#2196F3',
      icon: <DescriptionIcon />,
      title: 'Total'
    }
  };

  // Modal style
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: '80%', md: '70%', lg: '60%' },
    maxHeight: '80vh',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 0,
    overflow: 'hidden',
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
        Declarations Dashboard
      </Typography>

      <Box mb={3}>
        <DeclarationPeriod />
      </Box>

      <Grid container spacing={2} mb={2}>
        {/* Approved Card */}
        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              display: 'flex',
              cursor: 'pointer',
              borderLeft: `4px solid ${cardConfig.approved.color}`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              height: '100%',
              '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
              transition: 'all 0.3s ease',
            }}
            onClick={() => openModal('approved')}
          >
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar
                  sx={{ bgcolor: '#F5F7FF', color: cardConfig.approved.color, mr: 2 }}
                >
                  {cardConfig.approved.icon}
                </Avatar>
                <Typography variant="subtitle1">
                  {cardConfig.approved.title}
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {statusCounts.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Card */}
        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              display: 'flex',
              cursor: 'pointer',
              borderLeft: `4px solid ${cardConfig.pending.color}`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              height: '100%',
              '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
              transition: 'all 0.3s ease',
            }}
            onClick={() => openModal('pending')}
          >
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar
                  sx={{ bgcolor: '#F5F7FF', color: cardConfig.pending.color, mr: 2 }}
                >
                  {cardConfig.pending.icon}
                </Avatar>
                <Typography variant="subtitle1">
                  {cardConfig.pending.title}
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {statusCounts.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* No Proof Card */}
        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              display: 'flex',
              cursor: 'pointer',
              borderLeft: `4px solid ${cardConfig.noProof.color}`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              height: '100%',
              '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
              transition: 'all 0.3s ease',
            }}
            onClick={() => openModal('noProof')}
          >
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar
                  sx={{ bgcolor: '#F5F7FF', color: cardConfig.noProof.color, mr: 2 }}
                >
                  {cardConfig.noProof.icon}
                </Avatar>
                <Typography variant="subtitle1">
                  {cardConfig.noProof.title}
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {statusCounts.noProof}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Card */}
        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              display: 'flex',
              cursor: 'pointer',
              borderLeft: `4px solid ${cardConfig.total.color}`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              height: '100%',
              '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
              transition: 'all 0.3s ease',
            }}
            onClick={() => openModal('all')}
          >
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar
                  sx={{ bgcolor: '#F5F7FF', color: cardConfig.total.color, mr: 2 }}
                >
                  {cardConfig.total.icon}
                </Avatar>
                <Typography variant="subtitle1">
                  {cardConfig.total.title}
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {statusCounts.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Declaration Modal */}
      <Modal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        aria-labelledby="declarations-modal"
        aria-describedby="declarations-details"
      >
        <Box sx={modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2} borderBottom="1px solid #f0f0f0">
            <Typography id="declarations-modal-title" variant="h6" fontWeight="bold">
              {getModalTitle()}
            </Typography>
            <IconButton onClick={() => setModalVisible(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ maxHeight: 'calc(80vh - 65px)', overflow: 'auto', p: 2 }}>
            {selectedDeclarations.length > 0 ? (
              <List sx={{ pt: 0 }}>
                {selectedDeclarations.map((item) => (
                  <Paper
                    key={`${item.declarationId}-${item.type}`}
                    elevation={1}
                    sx={{
                      mb: 1,
                      p: 2,
                      borderRadius: 1,
                      borderLeft: '3px solid #4361EE'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {item.type}
                      </Typography>
                      <Chip
                        label={item.status}
                        color={getStatusChipColor(item.status)}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>
                        Amount:
                      </Typography>
                      <Typography variant="body2">
                        ₹{item.amount}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>
                        Proof:
                      </Typography>
                      <Typography variant="body2">
                        {item.proof ? "Submitted" : "Not Submitted"}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </List>
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
                <DescriptionIcon sx={{ fontSize: 48, color: '#DDDDDD' }} />
                <Typography variant="body1" color="text.secondary" mt={2}>
                  No declarations found
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default DeclarationSummary;
