import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import { fetchDeclarations } from "@/redux/features/declaration/declarationSlice";
import { apiResponse } from "@/utility/apiResponse/employeesResponse";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Modal,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Paper,
  Container,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DeclarationPeriod from "../ConfigurationPeriod";

const DeclarationDetails = () => {
  const dispatch = useDispatch();
  const { declarations } = useSelector((state) => state.declaration);
  const [undeclaredEmployees, setUndeclaredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Added for proof submission status
  const [submittedProofEmployees, setSubmittedProofEmployees] = useState([]);
  const [notSubmittedProofEmployees, setNotSubmittedProofEmployees] = useState([]);

  // Modal states
  const [declaredModalOpen, setDeclaredModalOpen] = useState(false);
  const [undeclaredModalOpen, setUndeclaredModalOpen] = useState(false);
  const [proofSubmittedModalOpen, setProofSubmittedModalOpen] = useState(false);
  const [proofNotSubmittedModalOpen, setProofNotSubmittedModalOpen] = useState(false);

  // Fetch declarations with debounce
  const debouncedFetch = useCallback(
    debounce(() => {
      dispatch(fetchDeclarations({ page: 1, limit: 10, keyword: "" }));
      setLoading(false);
    }, 300),
    [dispatch]
  );

  useEffect(() => {
    debouncedFetch();
    return debouncedFetch.cancel;
  }, [debouncedFetch]);

  // Fetch undeclared employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeesData = await apiResponse(); // Fetch all employees

        // Extract employee IDs from declarations
        const declaredEmployeeIds = new Set(
          declarations.map((declaration) => declaration.employee?._id)
        );

        // Filter out employees who already have a declaration entry and role_priority is not 1
        const filteredEmployees = employeesData.filter(
          (employee) =>
            !declaredEmployeeIds.has(employee._id) &&
            employee.role_priority !== "1"
        );

        setUndeclaredEmployees(filteredEmployees);

        // For proof submission status - assuming declarations have a proofSubmitted field
        // If your data structure is different, adjust this logic accordingly
        const withProof = declarations.filter(decl => decl.proofSubmitted === true);
        const withoutProof = declarations.filter(decl => decl.proofSubmitted !== true);

        setSubmittedProofEmployees(withProof);
        setNotSubmittedProofEmployees(withoutProof);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, [declarations]);

  const handleCloseDeclaredModal = () => setDeclaredModalOpen(false);
  const handleCloseUndeclaredModal = () => setUndeclaredModalOpen(false);
  const handleCloseProofSubmittedModal = () => setProofSubmittedModalOpen(false);
  const handleCloseProofNotSubmittedModal = () => setProofNotSubmittedModalOpen(false);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
      >
        <CircularProgress size={40} color="primary" />
        <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
          Loading declaration data...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Declaration Section - Title */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Declaration Details
        </Typography>
      </Box>

      {/* Declaration Period Component */}
      <DeclarationPeriod />

      {/* Cards Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Declared Employees Card */}
        <Grid item xs={12} sm={6}>
          <Card
            onClick={() => setDeclaredModalOpen(true)}
            sx={{
              cursor: 'pointer',
              height: '100%',
              borderLeft: '4px solid #4CAF50',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 3
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#F5F7FF',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 1
                }}>
                  <ReceiptLongIcon sx={{ color: '#4CAF50' }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 2 }}>
                  Declared
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {declarations.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Undeclared Employees Card */}
        <Grid item xs={12} sm={6}>
          <Card
            onClick={() => setUndeclaredModalOpen(true)}
            sx={{
              cursor: 'pointer',
              height: '100%',
              borderLeft: '4px solid #F44336',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 3
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#F5F7FF',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 1
                }}>
                  <ErrorOutlineIcon sx={{ color: '#F44336' }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 2 }}>
                  Undeclared
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {undeclaredEmployees.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Proof Not Submitted Card */}
        <Grid item xs={12} sm={6}>
          <Card
            onClick={() => setProofNotSubmittedModalOpen(true)}
            sx={{
              cursor: 'pointer',
              height: '100%',
              borderLeft: '4px solid #FF9800',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 3
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>

                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#F5F7FF',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 1
                }}>
                  <FileUploadIcon sx={{ color: '#FF9800' }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 2 }}>
                  Proof Pending
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {notSubmittedProofEmployees.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Proof Submitted Card */}
        <Grid item xs={12} sm={6}>
          <Card
            onClick={() => setProofSubmittedModalOpen(true)}
            sx={{
              cursor: 'pointer',
              height: '100%',
              borderLeft: '4px solid #4361EE',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 3
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#F5F7FF',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 1
                }}>
                  <AttachFileIcon sx={{ color: '#4361EE' }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 2 }}>
                  Proof Submitted
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {submittedProofEmployees.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>


      </Grid>

      {/* Modal for Declared Employees */}
      <Modal
        open={declaredModalOpen}
        onClose={handleCloseDeclaredModal}
        aria-labelledby="declared-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 600 },
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #f0f0f0' }}>
            <Typography id="declared-modal-title" variant="h6" fontWeight="bold">
              Declared Employees
            </Typography>
            <IconButton onClick={handleCloseDeclaredModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {declarations.length > 0 ? (
            <Box sx={{ overflowY: 'auto', flex: 1 }}>
              <List>
                {declarations.map((declaration) => (
                  <ListItem
                    key={declaration._id}
                    component={Paper}
                    elevation={1}
                    sx={{
                      mb: 1,
                      borderRadius: 1,
                      borderLeft: '3px solid #4361EE',
                      p: 1.5
                    }}
                  >
                    <ListItemAvatar>
                      {declaration.employee?.image ? (
                        <Avatar alt={declaration.employee?.first_name} src={declaration.employee?.image} />
                      ) : (
                        <Avatar sx={{ bgcolor: '#4361EE' }}>
                          {declaration.employee?.first_name?.charAt(0)}
                          {declaration.employee?.last_name?.charAt(0)}
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium">
                          {declaration.employee?.first_name} {declaration.employee?.last_name}
                        </Typography>
                      }
                      secondary={declaration.employee?.designation || "Employee"}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        Declared
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {declaration.taxRegime}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5 }}>
              <ReceiptLongIcon sx={{ fontSize: 60, color: '#DDDDDD' }} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                No declared employees found
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Modal for Undeclared Employees */}
      <Modal
        open={undeclaredModalOpen}
        onClose={handleCloseUndeclaredModal}
        aria-labelledby="undeclared-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 600 },
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #f0f0f0' }}>
            <Typography id="undeclared-modal-title" variant="h6" fontWeight="bold">
              Undeclared Employees
            </Typography>
            <IconButton onClick={handleCloseUndeclaredModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {undeclaredEmployees.length > 0 ? (
            <Box sx={{ overflowY: 'auto', flex: 1 }}>
              <List>
                {undeclaredEmployees.map((employee) => (
                  <ListItem
                    key={employee?._id}
                    component={Paper}
                    elevation={1}
                    sx={{
                      mb: 1,
                      borderRadius: 1,
                      borderLeft: '3px solid #4361EE',
                      p: 1.5
                    }}
                  >
                    <ListItemAvatar>
                      {employee?.image ? (
                        <Avatar alt={employee?.first_name} src={employee?.image} />
                      ) : (
                        <Avatar sx={{ bgcolor: '#FF6B6B' }}>
                          {employee?.first_name?.charAt(0)}
                          {employee?.last_name?.charAt(0)}
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium">
                          {employee?.first_name} {employee?.last_name}
                        </Typography>
                      }
                      secondary={employee?.designation || "Employee"}
                    />
                    {/* <Button
                      variant="contained"
                      size="small"
                      sx={{
                        bgcolor: '#4361EE',
                        '&:hover': {
                          bgcolor: '#3A56D4'
                        }
                      }}
                    >
                      Declare
                    </Button> */}
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 60, color: '#DDDDDD' }} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                All employees have declared
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Modal for Proof Submitted Employees */}
      <Modal
        open={proofSubmittedModalOpen}
        onClose={handleCloseProofSubmittedModal}
        aria-labelledby="proof-submitted-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 600 },
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #f0f0f0' }}>
            <Typography id="proof-submitted-modal-title" variant="h6" fontWeight="bold">
              Proof Submitted Employees
            </Typography>
            <IconButton onClick={handleCloseProofSubmittedModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {submittedProofEmployees.length > 0 ? (
            <Box sx={{ overflowY: 'auto', flex: 1 }}>
              <List>
                {submittedProofEmployees?.map((declaration) => (
                  <ListItem
                    key={declaration._id}
                    component={Paper}
                    elevation={1}
                    sx={{
                      mb: 1,
                      borderRadius: 1,
                      borderLeft: '3px solid #4361EE',
                      p: 1.5
                    }}
                  >
                    <ListItemAvatar>
                      {declaration.employee?.image ? (
                        <Avatar alt={declaration.employee?.first_name} src={declaration.employee?.image} />
                      ) : (
                        <Avatar sx={{ bgcolor: '#4361EE' }}>
                          {declaration.employee?.first_name?.charAt(0)}
                          {declaration.employee?.last_name?.charAt(0)}
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium">
                          {declaration.employee?.first_name} {declaration.employee?.last_name}
                        </Typography>
                      }
                      secondary={declaration.employee?.designation || "Employee"}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="primary" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <AttachFileIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        Proof Submitted
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(declaration.proofSubmittedDate || Date.now()).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <IconButton size="small" sx={{ ml: 1 }} onClick={() => { }}>
                      <ReceiptLongIcon sx={{ color: '#4361EE', fontSize: 20 }} />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5 }}>
              <AttachFileIcon sx={{ fontSize: 60, color: '#DDDDDD' }} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                No employees have submitted proof documents
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Modal for Proof Not Submitted Employees */}
      <Modal
        open={proofNotSubmittedModalOpen}
        onClose={handleCloseProofNotSubmittedModal}
        aria-labelledby="proof-not-submitted-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 600 },
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #f0f0f0' }}>
            <Typography id="proof-not-submitted-modal-title" variant="h6" fontWeight="bold">
              Proof Pending Employees
            </Typography>
            <IconButton onClick={handleCloseProofNotSubmittedModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {notSubmittedProofEmployees.length > 0 ? (
            <Box sx={{ overflowY: 'auto', flex: 1 }}>
              <List>
                {notSubmittedProofEmployees.map((declaration) => (
                  <ListItem
                    key={declaration._id}
                    component={Paper}
                    elevation={1}
                    sx={{
                      mb: 1,
                      borderRadius: 1,
                      borderLeft: '3px solid #FF9800',
                      p: 1.5
                    }}
                  >
                    <ListItemAvatar>
                      {declaration.employee?.image ? (
                        <Avatar alt={declaration.employee?.first_name} src={declaration.employee?.image} />
                      ) : (
                        <Avatar sx={{ bgcolor: '#FF9800' }}>
                          {declaration.employee?.first_name?.charAt(0)}
                          {declaration.employee?.last_name?.charAt(0)}
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium">
                          {declaration.employee?.first_name} {declaration.employee?.last_name}
                        </Typography>
                      }
                      secondary={declaration.employee?.designation || "Employee"}
                    />
                    {/* <Button
                      variant="contained"
                      size="small"
                      sx={{
                        bgcolor: '#FF9800',
                        '&:hover': {
                          bgcolor: '#E68A00'
                        }
                      }}
                      startIcon={<FileUploadIcon />}
                    >
                      Upload Proof
                    </Button> */}
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 60, color: '#DDDDDD' }} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                All declared employees have submitted proof
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default DeclarationDetails;
