'use client'
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  IconButton,
  FormControl,
  MenuItem,
  CircularProgress,
  Paper,
  Container,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Select,
  InputLabel,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  DateRange as DateRangeIcon,
  CheckCircle as CheckCircleIcon,
  PersonOutline as PersonOutlineIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation'
import { useSearchParams } from "next/navigation";

// import { addOrUpdateAttendance } from '../../redux/features/attendances/attendancesSlice';
import { apiResponse } from '@/utility/apiResponse/employeesResponse';

const AddAttendanceForm = ({ attendance, attendances, prefillDate }) => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const attendanceId = searchParams.get("attendanceId");

  const { company_id } = typeof window !== "undefined" ? JSON.parse(localStorage.getItem('user')) : {};
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Present');
  const [timeComplete, setTimeComplete] = useState('Not Completed');
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const [dateError, setDateError] = useState('');
  const [statusError, setStatusError] = useState('');

  const [attendanceData, setAttendanceData] = useState('');

  console.log('attendanceData', attendanceData)
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const data = await apiResponse();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employees', { position: 'top-center' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!attendanceId) return; // If no ID, assume creating new

    const fetchAttendance = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/attendance/get/${attendanceId}`);
        const data = await response.json();
        setAttendanceData(data);

        // Pre-fill form fields
        if (data?.date) {
          // Check if the date is already in the right format
          const formattedDate = new Date(data.date).toISOString().split('T')[0];
          setDate(formattedDate);
        } setStatus(data?.status || '');
        setSelectedEmployees([data?.employeeId._id]); // Assuming a single employee per attendance
        setIsEditMode(true); // Set edit mode flag
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();
  }, [attendanceId]);

  const handleClose = () => {
    router.push('/attendance')
  }

  const handleDateChange = (e) => {
    setDate(e.target.value || attendanceData.date);
    if (e.target.value) {
      setDateError('');
    }
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    if (e.target.value) {
      setStatusError('');
    }
  };

  const handleTimeCompleteChange = (e) => {
    setTimeComplete(e.target.value);
  };

  const toggleEmployeeSelection = (empId) => {
    if (isEditMode) {
      // In edit mode, we only allow the one employee
      setSelectedEmployees([empId]);
    } else {
      // In create mode, we toggle selection
      setSelectedEmployees(prev => {
        if (prev.includes(empId)) {
          return prev.filter(id => id !== empId);
        } else {
          return [...prev, empId];
        }
      });
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (!date) {
      setDateError('Date is required');
      isValid = false;
    }

    if (!status) {
      setStatusError('Status is required');
      isValid = false;
    }

    if (selectedEmployees.length === 0) {
      toast.warning('Please select at least one employee', { position: 'top-center' });
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      if (isEditMode) {
        // Update existing attendance
        const updateData = {
          employeeId: selectedEmployees[0],
          date: date,
          status: status,
          timeComplete: timeComplete,
          company_id: company_id
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/attendance/update/${attendanceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        const result = await response.json();

        if (result.success) {
          toast.success("Attendance updated successfully", { position: 'top-center' });
        } else {
          toast.error("Failed to update attendance", { position: 'top-center' });
        }
      } else {
        // Create new attendance records
        const attendanceData = selectedEmployees.map(empId => ({
          employeeId: empId,
          date: date,
          status: status,
          timeComplete: timeComplete,
          company_id: company_id
        }));

        // Use Promise.all to send all requests in parallel
        const promises = attendanceData.map(data =>
          fetch(`${process.env.NEXT_PUBLIC_APP_URL}/attendance/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }).then(response => response.json())
        );

        const results = await Promise.all(promises);

        toast.success("Attendance saved successfully", { position: 'top-center' });
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast.error('An error occurred while submitting attendance data', { position: 'top-center' });
    } finally {
      setIsSaving(false);
      handleClose();
    }
  };

  // Get employee initials for avatar
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0)}${lastName?.charAt(0)}`.toUpperCase();
  };

  // Filter employees based on mode
  const displayEmployees = isEditMode
    ? employees.filter(emp => selectedEmployees.includes(emp._id))
    : employees;

  return (
    <Container sx={{ width: '90%', maxWidth: '1200px', margin: 'auto' }}>
      <Paper elevation={6} sx={{
        p: 4,
        borderRadius: 3,
        position: 'relative',
      }}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
          <Typography
            variant='h4'
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 'bold',
            }}
          >
            {isEditMode ? 'Edit Attendance' : 'Mark Attendance'}
            <CheckCircleIcon sx={{ ml: 2, color: '#4caf50' }} />
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: '#ff4d4d',
              backgroundColor: '#fff3f3',
              '&:hover': {
                backgroundColor: '#ffebee'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label='Date'
              name='date'
              type='date'
              value={date}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <DateRangeIcon sx={{ mr: 2, color: '#666' }} />,
              }}
              required
              error={!!dateError}
              helperText={dateError}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required error={!!statusError}>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                value={status}
                label="Status"
                onChange={handleStatusChange}
                sx={{
                  borderRadius: 2
                }}
              >
                <MenuItem value="Present">PRESENT</MenuItem>
                <MenuItem value="Absent">ABSENT</MenuItem>
                <MenuItem value="On Half">ON_HALF</MenuItem>
                <MenuItem value="On Leave">ON_LEAVE</MenuItem>
                <MenuItem value="On Field">ON_FIELD</MenuItem>
                <MenuItem value="On Wfh">ON_WFH</MenuItem>
              </Select>
              {statusError && <Typography color="error" variant="caption">{statusError}</Typography>}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="time-complete-label">Time Completion</InputLabel>
              <Select
                labelId="time-complete-label"
                id="timeComplete"
                value={timeComplete}
                label="Time Completion"
                onChange={handleTimeCompleteChange}
                sx={{
                  borderRadius: 2
                }}
              >
                <MenuItem value="Not Completed">Not Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {!isEditMode && selectedEmployees.length > 0 && (
          <Box mb={3} p={2} bgcolor="#e3f2fd" borderRadius={2}>
            <Typography variant="subtitle1" gutterBottom>
              Selected Employees ({selectedEmployees.length}):
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {selectedEmployees.map(empId => {
                const emp = employees.find(e => e._id === empId);
                return emp ? (
                  <Chip
                    key={emp._id}
                    label={`${emp.first_name} ${emp.last_name}`}
                    onDelete={() => toggleEmployeeSelection(emp._id)}
                    color="primary"
                    variant="outlined"
                    avatar={<Avatar>{getInitials(emp.first_name, emp.last_name)}</Avatar>}
                  />
                ) : null;
              })}
            </Box>
          </Box>
        )}

        <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
          {isEditMode ? "Employee:" : "Select Employees:"}
        </Typography>

        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2} mb={4}>
            {displayEmployees.map((employee) => (
              <Grid item xs={12} sm={6} md={4} key={employee._id}>
                <Card
                  elevation={selectedEmployees.includes(employee._id) ? 6 : 1}
                  sx={{
                    borderRadius: 2,
                    border: selectedEmployees.includes(employee._id)
                      ? '2px solid #4caf50'
                      : '1px solid #e0e0e0',
                    // backgroundColor: selectedEmployees.includes(employee._id)
                    //   ? '#f1f8e9'
                    //   : '#fff',
                    transition: 'all 0.3s'
                  }}
                >
                  <CardActionArea onClick={() => toggleEmployeeSelection(employee._id)} disabled={isEditMode}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: selectedEmployees.includes(employee._id) ? '#4caf50' : '#ff902f',
                          width: 40,
                          height: 40
                        }}
                      >
                        {getInitials(employee.first_name, employee.last_name)}
                      </Avatar>
                      <Box ml={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {`${employee.first_name} ${employee.last_name}`}
                        </Typography>
                        {employee.designation && (
                          <Typography variant="body2" color="text.secondary">
                            {employee.designation}
                          </Typography>
                        )}
                      </Box>
                      {selectedEmployees.includes(employee._id) && (
                        <CheckCircleIcon
                          sx={{
                            ml: 'auto',
                            color: '#4caf50'
                          }}
                        />
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box display="flex" justifyContent="center">
          <Button
            variant='contained'
            onClick={handleSubmit}
            disabled={isSaving}
            startIcon={<SaveIcon />}
            sx={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'white',
              padding: '12px 24px',
              backgroundColor: '#ff902f',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#ff7b21'
              },
              '&.Mui-disabled': {
                backgroundColor: '#ffc107',
                color: 'rgba(255,255,255,0.7)'
              }
            }}
          >
            {isSaving ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              isEditMode ? 'UPDATE ATTENDANCE' : 'SAVE ATTENDANCE'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddAttendanceForm;
