import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';

// MUI Components
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Modal,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Divider,
  CircularProgress,
  Paper,
  Container,
} from '@mui/material';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import PersonCheckIcon from '@mui/icons-material/HowToReg';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// API import (replace with your actual API)
import { apiResponse } from '@/utility/apiResponse/employeesResponse';

const AttendanceDetails = () => {
  // In Next.js with Redux, you'd get state this way
  const { attendances } = useSelector((state) => state.attendances);
  const [unmarkEmployees, setUnmarkEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [presentModalOpen, setPresentModalOpen] = useState(false);
  const [absentModalOpen, setAbsentModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [unmarkModalOpen, setUnmarkModalOpen] = useState(false);

  // Filter employees by status
  const presentEmployees = attendances.filter(
    (attendance) => attendance.status === "Present"
  );
  const absentEmployees = attendances.filter(
    (attendance) => attendance.status === "Absent"
  );
  const leaveEmployees = attendances.filter(
    (attendance) => attendance.status === "Leave"
  );
  const fieldEmployees = attendances.filter(
    (attendance) => attendance.status === "Field"
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Fetch unmarked employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeesData = await apiResponse();

        // Extract employee IDs from attendances
        const attendanceEmployeeIds = new Set(
          attendances.map((attendance) => attendance?.employeeId?._id)
        );

        // Filter out employees who already have attendance entry and role_priority is not 1
        const filteredEmployees = employeesData.filter(
          (employee) =>
            !attendanceEmployeeIds.has(employee._id) &&
            employee.role_priority !== "1"
        );

        setUnmarkEmployees(filteredEmployees);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [attendances]);

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
    p: 4,
    overflow: 'auto',
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#F5F7FF"
      >
        <CircularProgress color="primary" />
        <Typography mt={2} variant="h6" color="primary">
          Loading attendance data...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box py={3} px={2} minHeight="60vh">
        {/* Attendance Section - Title */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" fontWeight="bold">
            Attendance
          </Typography>
        </Box>

        {/* Top Cards Row */}
        <Grid container spacing={2} mb={2}>
          {/* Present Employees Card */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                borderLeft: '4px solid #4CAF50',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                height: '100%',
                cursor: 'pointer',
                '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
                transition: 'all 0.3s ease',
              }}
              onClick={() => setPresentModalOpen(true)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar
                    sx={{ bgcolor: '#F5F7FF', color: '#4CAF50', mr: 2 }}
                  >
                    <PersonCheckIcon />
                  </Avatar>
                  <Typography variant="subtitle1">
                    Present
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {presentEmployees.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Absent Employees Card */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                borderLeft: '4px solid #F44336',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                height: '100%',
                cursor: 'pointer',
                '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
                transition: 'all 0.3s ease',
              }}
              onClick={() => setAbsentModalOpen(true)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar
                    sx={{ bgcolor: '#F5F7FF', color: '#F44336', mr: 2 }}
                  >
                    <PersonOffIcon />
                  </Avatar>
                  <Typography variant="subtitle1">
                    Absent
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {absentEmployees.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Bottom Cards Row */}
        <Grid container spacing={2} mb={2}>
          {/* On Leave Employees Card */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                borderLeft: '4px solid #FF9800',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                height: '100%',
                cursor: 'pointer',
                '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
                transition: 'all 0.3s ease',
              }}
              onClick={() => setLeaveModalOpen(true)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar
                    sx={{ bgcolor: '#F5F7FF', color: '#FF9800', mr: 2 }}
                  >
                    <CalendarTodayIcon />
                  </Avatar>
                  <Typography variant="subtitle1">
                    On Leave
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {leaveEmployees.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* On Field Employees Card */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                borderLeft: '4px solid #2196F3',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                height: '100%',
                cursor: 'pointer',
                '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
                transition: 'all 0.3s ease',
              }}
              onClick={() => setFieldModalOpen(true)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar
                    sx={{ bgcolor: '#F5F7FF', color: '#2196F3', mr: 2 }}
                  >
                    <DirectionsWalkIcon />
                  </Avatar>
                  <Typography variant="subtitle1">
                    On Field
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {fieldEmployees.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Unmarked Employees Card */}
        <Card
          sx={{
            borderLeft: '4px solid #9C27B0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            cursor: 'pointer',
            '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
            transition: 'all 0.3s ease',
          }}
          onClick={() => setUnmarkModalOpen(true)}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#F5F7FF', color: '#9C27B0', mr: 2 }}>
                  <AccessTimeIcon />
                </Avatar>
                <Typography variant="subtitle1">
                  Unmarked Employees
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {unmarkEmployees.length}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Modal for Present Employees */}
        <Modal
          open={presentModalOpen}
          onClose={() => setPresentModalOpen(false)}
          aria-labelledby="present-modal-title"
        >
          <Box sx={modalStyle}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} pb={1} borderBottom="1px solid #f0f0f0">
              <Typography id="present-modal-title" variant="h6" fontWeight="bold">
                Present Employees
              </Typography>
              <IconButton onClick={() => setPresentModalOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            {presentEmployees.length > 0 ? (
              <List sx={{ pt: 0 }}>
                {presentEmployees.map((employee) => (
                  <ListItem
                    key={employee._id?.toString() || Math.random().toString()}
                    component={Paper}
                    elevation={1}
                    sx={{ mb: 1, borderRadius: 1, borderLeft: '3px solid #4361EE' }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#4361EE' }}>
                        {employee.employeeId?.first_name?.charAt(0) || ''}
                        {employee.employeeId?.last_name?.charAt(0) || ''}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight="bold">
                          {employee.employeeId?.first_name || ''} {employee.employeeId?.last_name || ''}
                        </Typography>
                      }
                      secondary={employee.employeeId?.designation || ''}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(employee?.date)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
                <PersonCheckIcon sx={{ fontSize: 48, color: '#DDDDDD' }} />
                <Typography variant="body1" color="text.secondary" mt={2}>
                  No present employees
                </Typography>
              </Box>
            )}
          </Box>
        </Modal>

        {/* Modal for Absent Employees */}
        <Modal
          open={absentModalOpen}
          onClose={() => setAbsentModalOpen(false)}
          aria-labelledby="absent-modal-title"
        >
          <Box sx={modalStyle}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} pb={1} borderBottom="1px solid #f0f0f0">
              <Typography id="absent-modal-title" variant="h6" fontWeight="bold">
                Absent Employees
              </Typography>
              <IconButton onClick={() => setAbsentModalOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            {absentEmployees.length > 0 ? (
              <List sx={{ pt: 0 }}>
                {absentEmployees.map((employee) => (
                  <ListItem
                    key={employee._id?.toString() || Math.random().toString()}
                    component={Paper}
                    elevation={1}
                    sx={{ mb: 1, borderRadius: 1, borderLeft: '3px solid #4361EE' }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#4361EE' }}>
                        {employee.employeeId?.first_name?.charAt(0) || ''}
                        {employee.employeeId?.last_name?.charAt(0) || ''}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight="bold">
                          {employee.employeeId?.first_name || ''} {employee.employeeId?.last_name || ''}
                        </Typography>
                      }
                      secondary={employee.employeeId?.designation || ''}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(employee?.date)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
                <PersonOffIcon sx={{ fontSize: 48, color: '#DDDDDD' }} />
                <Typography variant="body1" color="text.secondary" mt={2}>
                  No absent employees
                </Typography>
              </Box>
            )}
          </Box>
        </Modal>

        {/* Modal for Leave Employees */}
        <Modal
          open={leaveModalOpen}
          onClose={() => setLeaveModalOpen(false)}
          aria-labelledby="leave-modal-title"
        >
          <Box sx={modalStyle}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} pb={1} borderBottom="1px solid #f0f0f0">
              <Typography id="leave-modal-title" variant="h6" fontWeight="bold">
                Employees on Leave
              </Typography>
              <IconButton onClick={() => setLeaveModalOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            {leaveEmployees.length > 0 ? (
              <List sx={{ pt: 0 }}>
                {leaveEmployees.map((employee) => (
                  <ListItem
                    key={employee._id?.toString() || Math.random().toString()}
                    component={Paper}
                    elevation={1}
                    sx={{ mb: 1, borderRadius: 1, borderLeft: '3px solid #4361EE' }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#4361EE' }}>
                        {employee.employeeId?.first_name?.charAt(0) || ''}
                        {employee.employeeId?.last_name?.charAt(0) || ''}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight="bold">
                          {employee.employeeId?.first_name || ''} {employee.employeeId?.last_name || ''}
                        </Typography>
                      }
                      secondary={employee.employeeId?.designation || ''}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(employee?.date)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
                <CalendarTodayIcon sx={{ fontSize: 48, color: '#DDDDDD' }} />
                <Typography variant="body1" color="text.secondary" mt={2}>
                  No employees on leave
                </Typography>
              </Box>
            )}
          </Box>
        </Modal>

        {/* Modal for Field Employees */}
        <Modal
          open={fieldModalOpen}
          onClose={() => setFieldModalOpen(false)}
          aria-labelledby="field-modal-title"
        >
          <Box sx={modalStyle}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} pb={1} borderBottom="1px solid #f0f0f0">
              <Typography id="field-modal-title" variant="h6" fontWeight="bold">
                Field Employees
              </Typography>
              <IconButton onClick={() => setFieldModalOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            {fieldEmployees.length > 0 ? (
              <List sx={{ pt: 0 }}>
                {fieldEmployees.map((employee) => (
                  <ListItem
                    key={employee._id?.toString() || Math.random().toString()}
                    component={Paper}
                    elevation={1}
                    sx={{ mb: 1, borderRadius: 1, borderLeft: '3px solid #4361EE' }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#4361EE' }}>
                        {employee.employeeId?.first_name?.charAt(0) || ''}
                        {employee.employeeId?.last_name?.charAt(0) || ''}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight="bold">
                          {employee.employeeId?.first_name || ''} {employee.employeeId?.last_name || ''}
                        </Typography>
                      }
                      secondary={employee.employeeId?.designation || ''}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(employee?.date)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
                <DirectionsWalkIcon sx={{ fontSize: 48, color: '#DDDDDD' }} />
                <Typography variant="body1" color="text.secondary" mt={2}>
                  No field employees
                </Typography>
              </Box>
            )}
          </Box>
        </Modal>

        {/* Modal for Unmarked Employees */}
        <Modal
          open={unmarkModalOpen}
          onClose={() => setUnmarkModalOpen(false)}
          aria-labelledby="unmarked-modal-title"
        >
          <Box sx={modalStyle}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} pb={1} borderBottom="1px solid #f0f0f0">
              <Typography id="unmarked-modal-title" variant="h6" fontWeight="bold">
                Unmarked Employees
              </Typography>
              <IconButton onClick={() => setUnmarkModalOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            {unmarkEmployees.length > 0 ? (
              <List sx={{ pt: 0 }}>
                {unmarkEmployees.map((employee) => (
                  <ListItem
                    key={employee._id?.toString() || Math.random().toString()}
                    component={Paper}
                    elevation={1}
                    sx={{ mb: 1, borderRadius: 1, borderLeft: '3px solid #4361EE' }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#FF6B6B' }}>
                        {employee.first_name?.charAt(0) || ''}
                        {employee.last_name?.charAt(0) || ''}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight="bold">
                          {employee.first_name || ''} {employee.last_name || ''}
                        </Typography>
                      }
                      secondary={employee.designation || ''}
                    />
                    {/* <Button
                      variant="contained"
                      size="small"
                      sx={{
                        bgcolor: '#4361EE',
                        '&:hover': { bgcolor: '#3651D4' }
                      }}
                    >
                      Mark
                    </Button> */}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
                <CheckCircleIcon sx={{ fontSize: 48, color: '#DDDDDD' }} />
                <Typography variant="body1" color="text.secondary" mt={2}>
                  All employees marked
                </Typography>
              </Box>
            )}
          </Box>
        </Modal>
      </Box>
    </Container>
  );
};

export default AttendanceDetails;
