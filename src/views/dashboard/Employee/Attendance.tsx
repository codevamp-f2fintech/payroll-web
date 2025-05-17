"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Divider,
  Paper,
  LinearProgress,
  Container
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  DirectionsWalk as DirectionsWalkIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  HowToReg as PersonCheckIcon,
  PersonOff as PersonOffIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import useDebounce from "@/utility/debounce/useDebounce";
import { fetchAttendances } from "@/redux/features/attendance/attendanceslice";
import type { AppDispatch, RootState } from "@/redux/store";

// Types
interface Attendance {
  _id: string;
  employeeId: {
    first_name: string;
    last_name: string;
    designation: string;
  };
  status: string;
  date: string;
  timeComplete?: string;
}

interface AttendanceState {
  attendances: Attendance[];
  loading: boolean;
  count: number;
}

const AttendanceSummary = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { attendances, loading, count } = useSelector(
    (state: RootState) => state.attendances);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [searchName, setSearchName] = useState("");

  const debouncedSearchName = useDebounce(searchName, 500);

  // Modal states
  const [presentModalVisible, setPresentModalVisible] = useState(false);
  const [absentModalVisible, setAbsentModalVisible] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [fieldModalVisible, setFieldModalVisible] = useState(false);

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

  // Calculate attendance rate
  const totalWorkingDays = 21; // Example value, adjust as needed
  const attendanceRate = Math.round((presentEmployees.length / totalWorkingDays) * 100);

  const debouncedFetchAttendances = useCallback(
    debounce(() => {
      dispatch(
        fetchAttendances({
          month,
          year,
          page: 1,
          limit: 10,
          keyword: debouncedSearchName.trim(),
        })
      );
    }, 300),
    [month, year, debouncedSearchName, dispatch]
  );

  useEffect(() => {
    debouncedFetchAttendances();
    return debouncedFetchAttendances.cancel;
  }, [month, year, debouncedFetchAttendances]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Get recent 3 attendances
  const recentThree = [...attendances]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const getAttendanceRateColor = () => {
    if (attendanceRate < 50) return "error.main";
    if (attendanceRate < 80) return "warning.main";
    return "success.main";
  };

  const getAttendanceRateText = () => {
    if (attendanceRate < 50) return "Needs improvement";
    if (attendanceRate < 80) return "Good attendance";
    return "Excellent attendance";
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
    p: 4,
    overflow: 'auto',
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" color="primary" sx={{ mt: 2 }}>
          Loading attendance data...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Attendance Section - Title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
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
            onClick={() => setPresentModalVisible(true)}
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
            onClick={() => setAbsentModalVisible(true)}
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
            onClick={() => setLeaveModalVisible(true)}
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
            onClick={() => setFieldModalVisible(true)}
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

      {/* Attendance Rate Card */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
            <TrendingUpIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              {attendanceRate}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Attendance Rate
            </Typography>
          </Box>
        </Box>

        <Box sx={{ width: '100%', mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={attendanceRate}
            color={attendanceRate < 50 ? 'error' : attendanceRate < 80 ? 'warning' : 'success'}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" align="right">
          {getAttendanceRateText()}
        </Typography>
      </Paper>

      {/* Recent Activity Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
          Recent Activity
        </Typography>

        {recentThree.length > 0 ? (
          <List>
            {recentThree.map((attendance, index) => (
              <React.Fragment key={attendance._id || index}>
                <ListItem sx={{ py: 1.5 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor:
                        attendance.status === "Present"
                          ? "success.main"
                          : attendance.status === "Absent"
                            ? "error.main"
                            : "warning.main",
                      marginRight: 2,
                    }}
                  />
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{formatDate(attendance.date)}</Typography>
                        <Typography variant="body2" fontWeight="medium">{attendance.status?.toUpperCase()}</Typography>
                        <Typography variant="body2" color="text.secondary">{attendance.timeComplete || "N/A"}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < recentThree.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No recent activity found
            </Typography>
          </Box>
        )}
      </Box>

      {/* Modal for Present Employees */}
      <Dialog
        open={presentModalVisible}
        onClose={() => setPresentModalVisible(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Present Employees</Typography>
            <IconButton onClick={() => setPresentModalVisible(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {presentEmployees.length > 0 ? (
            <List sx={{ pt: 0 }}>
              {presentEmployees.map((employee) => (
                <ListItem
                  key={employee._id}
                  component={Paper}
                  elevation={1}
                  sx={{ mb: 1, borderRadius: 1, borderLeft: '3px solid #4361EE' }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#4361EE' }}>
                      {employee.employeeId?.first_name?.charAt(0) || ""}
                      {employee.employeeId?.last_name?.charAt(0) || ""}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight="bold">
                        {employee.employeeId?.first_name || ""} {employee.employeeId?.last_name || ""}
                      </Typography>
                    }
                    secondary={employee.employeeId?.designation || ""}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(employee.date)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PersonIcon sx={{ fontSize: 48, color: '#DDDDDD' }} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                No present employees
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPresentModalVisible(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Modal for Absent Employees */}
      <Dialog
        open={absentModalVisible}
        onClose={() => setAbsentModalVisible(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Absent Employees</Typography>
            <IconButton onClick={() => setAbsentModalVisible(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {absentEmployees.length > 0 ? (
            <List sx={{ pt: 0 }}>
              {absentEmployees.map((employee) => (
                <ListItem
                  key={employee._id}
                  component={Paper}
                  elevation={1}
                  sx={{ mb: 1, borderRadius: 1, borderLeft: '3px solid #4361EE' }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#4361EE' }}>
                      {employee.employeeId?.first_name?.charAt(0) || ""}
                      {employee.employeeId?.last_name?.charAt(0) || ""}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight="bold">
                        {employee.employeeId?.first_name || ""} {employee.employeeId?.last_name || ""}
                      </Typography>
                    }
                    secondary={employee.employeeId?.designation || ""}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(employee.date)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PersonIcon sx={{ fontSize: 48, color: '#DDDDDD' }} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                No absent employees
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAbsentModalVisible(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Modal for Leave Employees */}
      <Dialog
        open={leaveModalVisible}
        onClose={() => setLeaveModalVisible(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Employees on Leave</Typography>
            <IconButton onClick={() => setLeaveModalVisible(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {leaveEmployees.length > 0 ? (
            <List sx={{ pt: 0 }}>
              {leaveEmployees.map((employee) => (
                <ListItem
                  key={employee._id}
                  component={Paper}
                  elevation={1}
                  sx={{ mb: 1, borderRadius: 1, borderLeft: '3px solid #4361EE' }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#4361EE' }}>
                      {employee.employeeId?.first_name?.charAt(0) || ""}
                      {employee.employeeId?.last_name?.charAt(0) || ""}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight="bold">
                        {employee.employeeId?.first_name || ""} {employee.employeeId?.last_name || ""}
                      </Typography>
                    }
                    secondary={employee.employeeId?.designation || ""}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(employee.date)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PersonIcon sx={{ fontSize: 48, color: '#DDDDDD' }} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                No employees on leave
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveModalVisible(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Modal for Field Employees */}
      <Dialog
        open={fieldModalVisible}
        onClose={() => setFieldModalVisible(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Field Employees</Typography>
            <IconButton onClick={() => setFieldModalVisible(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {fieldEmployees.length > 0 ? (
            <List sx={{ pt: 0 }}>
              {fieldEmployees.map((employee) => (
                <ListItem
                  key={employee._id}
                  component={Paper}
                  elevation={1}
                  sx={{ mb: 1, borderRadius: 1, borderLeft: '3px solid #4361EE' }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#4361EE' }}>
                      {employee.employeeId?.first_name?.charAt(0) || ""}
                      {employee.employeeId?.last_name?.charAt(0) || ""}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight="bold">
                        {employee.employeeId?.first_name || ""} {employee.employeeId?.last_name || ""}
                      </Typography>
                    }
                    secondary={employee.employeeId?.designation || ""}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(employee.date)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PersonIcon sx={{ fontSize: 48, color: '#DDDDDD' }} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                No field employees
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFieldModalVisible(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AttendanceSummary;
