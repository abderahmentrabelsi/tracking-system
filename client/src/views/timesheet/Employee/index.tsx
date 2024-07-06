import React, { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Grid, Switch, Typography, TextField, MenuItem, CircularProgress, FormControlLabel, FormControl, InputLabel, Select } from '@mui/material';
import { format } from 'date-fns';
import { CheckInData, CheckOutData, WorkHours, TaskType } from '@/types/timesheetTypes';
import { checkIn, checkOut, getTimesheet, getTasksByUserId } from '@/app/api/timesheetApi';
import { AccessTime, Timer, Work } from '@mui/icons-material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TimesheetHistory from './timesheethistory';
import { styled } from '@mui/system';
import { getDepartmentById } from '@/app/api/taskApi';
import DurationClock from './DurationClock';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';

import { BusinessCenter, WatchLater, MeetingRoom, School, LocalCafe, Assignment, Build, DirectionsCar, Call, Science, DeveloperMode } from '@mui/icons-material';

const primaryColor = 'rgba(21,20,20,0.87)'; // Update this with your primary color

const StyledCard = styled(Card)({
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.12)',
  },
  marginBottom: '20px',
  border: `2px solid ${primaryColor}`,
  borderRadius: '10px',
});

const StyledFormControl = styled(FormControl)({
  border: `2px solid primary`,
  borderRadius: '10px',
  padding: '8px',
});

const ScrollBox = styled(Box)({
  maxHeight: '500px',
  overflowY: 'auto',
  overflowX: 'hidden',
  scrollbarWidth: 'thin',
  paddingRight: '15px',
  '&::-webkit-scrollbar': {
    width: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: primaryColor,
    borderRadius: '10px',
    border: '2px solid #1b1b1b',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: '#388E3C',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#2b2b2b',
    borderRadius: '10px',
  },
});

const workTypeIcons = {
  "Workday": <BusinessCenter style={{ marginRight: 8, color: 'black' }} />,
  "Overtime": <WatchLater style={{ marginRight: 8, color: 'black' }} />,
  "Meeting": <MeetingRoom style={{ marginRight: 8, color: 'black' }} />,
  "Training": <School style={{ marginRight: 8, color: 'black' }} />,
  "Break": <LocalCafe style={{ marginRight: 8, color: 'black' }} />,
  "Administrative": <Assignment style={{ marginRight: 8, color: 'black' }} />,
  "Task": <Assignment style={{ marginRight: 8, color: 'black' }} />,
  "Client Work": <Build style={{ marginRight: 8, color: 'black' }} />,
  "Travel": <DirectionsCar style={{ marginRight: 8, color: 'black' }} />,
  "On Call": <Call style={{ marginRight: 8, color: 'black' }} />,
  "Research": <Science style={{ marginRight: 8, color: 'black' }} />,
  "Support": <AccessTime style={{ marginRight: 8, color: 'black' }} />,
  "Development": <DeveloperMode style={{ marginRight: 8, color: 'black' }} />,
};

const EmployeeDashboard = () => {
  const [timesheet, setTimesheet] = useState<WorkHours[]>([]);
  const [taskMode, setTaskMode] = useState(false);
  const [currentCheckIns, setCurrentCheckIns] = useState<WorkHours[]>([]);
  const [checkInData, setCheckInData] = useState<CheckInData>({ userID: Number(localStorage.getItem('userID')), workType: taskMode ? 'Task' : 'Workday', location: 'QORE ENTREPRISES, TUNIS, TUNISIA', comments: '', taskID: null });
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(false);

  const [isRemote, setIsRemote] = useState(false);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [departmentName, setDepartmentName] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [JobTitle, setJobTitle]=useState<string>('');

  useEffect(() => {
    setCheckInData(prevData => ({
      ...prevData,
      workType: taskMode ? 'Task' : 'Workday'
    }));
  }, [taskMode]);

  useEffect(() => {
    const storedDepartmentId = typeof window !== 'undefined' ? parseInt(localStorage.getItem('departmentId') || '0', 10) : 0;
    setDepartmentId(storedDepartmentId);
    if (storedDepartmentId) {
      fetchDepartmentDetails(storedDepartmentId);
    }
  }, []);

  const fetchDepartmentDetails = async (id: number) => {
    try {
      const response = await getDepartmentById(id);
      const department = response;
      setDepartmentName(department.name);
      const parentDepartment = await getDepartmentById(department.parentDepartmentId);
      setClientName(parentDepartment.name);
    } catch (error) {
      console.error('Failed to fetch department details:', error);
    }
  };

  useEffect(() => {
    fetchTimesheet();
    fetchTasks();
  }, []);

  const fetchTimesheet = async () => {
    try {
      const data = await getTimesheet(checkInData.userID);
      setTimesheet(data);
      const activeCheckIns = data.filter(entry => !entry.checkout);
      setCurrentCheckIns(activeCheckIns);
    } catch (error) {
      console.error('Error fetching timesheet:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await getTasksByUserId(checkInData.userID);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const response = await checkIn(checkInData);
      setCurrentCheckIns(prev => [...prev, response]);
      fetchTimesheet();
      resetForm();
    } catch (error) {
      console.error('Error checking in:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (workHoursID: number) => {
    setLoading(true);
    try {
      await checkOut({ workHoursID });
      setCurrentCheckIns(prev => prev.filter(entry => entry.ID !== workHoursID));
      fetchTimesheet();
    } catch (error) {
      console.error('Error checking out:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) {
      console.error('Invalid timestamp:', timestamp);
      return 'Invalid time';
    }
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', date);
      return 'Invalid time';
    }
    return format(date, 'Pp');
  };

  const handleToggleTaskMode = () => setTaskMode((prev) => !prev);
  const handleToggleRemote = () => setIsRemote((prev) => !prev);

  useEffect(() => {
    if (isRemote) {
      setCheckInData((prev) => ({ ...prev, location: 'Remote' }));
    } else {
      setCheckInData((prev) => ({ ...prev, location: 'QORE ENTREPRISES, TUNIS, TUNISIA' }));
    }
  }, [isRemote]);

  const getTaskTitle = (taskId: number | null) => {
    const task = tasks.find(task => task.ID === taskId);
    return task ? task.title : 'N/A';
  };

  const resetForm = () => {
    setCheckInData({
      userID: Number(localStorage.getItem('userID')),
      workType: 'Workday',
      location: isRemote ? 'Remote' : 'QORE ENTREPRISES, TUNIS, TUNISIA',
      comments: '',
      taskID: null
    });
  };

  return (
    <Box padding={4}>
      <Grid container spacing={7}>
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Grid container justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Employee Timesheet Dashboard</Typography>
                <FormControlLabel
                  control={<Switch checked={taskMode} onChange={handleToggleTaskMode} color="primary" />}
                  label="Switch to Task Time"
                />
              </Grid>
              <Box marginTop={2}>
                {taskMode ? (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Select Task</InputLabel>
                    <Select
                      value={checkInData.taskID || ''}
                      onChange={(e) => setCheckInData({ ...checkInData, taskID: e.target.value as number })}
                    >
                      {tasks.map((task) => (
                        <MenuItem key={task.ID} value={task.ID}>
                          {task.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : null}
                <StyledFormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel htmlFor="work-type-select" style={{ top: '-10px' }}>Work Type</InputLabel>
                  <Select
                    value={checkInData.workType}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      setCheckInData({ ...checkInData, workType: selectedValue });
                      if (selectedValue === 'Task') {
                        handleToggleTaskMode();
                      }
                    }}
                    label="Work Type"
                    inputProps={{
                      name: 'work-type',
                      id: 'work-type-select',
                      startAdornment: <Work style={{ color: 'black', marginRight: 8 }} />,
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          backgroundColor: '#2a2a2a',
                          color: 'white',
                        },
                      },
                    }}
                    style={{ padding: '8px 14px', height: '56px', display: 'flex', alignItems: 'center' }}
                  >
                    <MenuItem value="Workday">
                      <BusinessCenter style={{ marginRight: 8 }} /> Workday
                    </MenuItem>
                    <MenuItem value="Overtime">
                      <WatchLater style={{ marginRight: 8 }} /> Overtime
                    </MenuItem>
                    <MenuItem value="Meeting">
                      <MeetingRoom style={{ marginRight: 8 }} /> Meeting
                    </MenuItem>
                    <MenuItem value="Training">
                      <School style={{ marginRight: 8 }} /> Training
                    </MenuItem>
                    <MenuItem value="Break">
                      <LocalCafe style={{ marginRight: 8 }} /> Break
                    </MenuItem>
                    <MenuItem value="Administrative">
                      <Assignment style={{ marginRight: 8 }} /> Administrative
                    </MenuItem>
                    <MenuItem value="Task">
                      <Assignment style={{ marginRight: 8 }} /> Task
                    </MenuItem>
                    <MenuItem value="Client Work">
                      <Build style={{ marginRight: 8 }} /> Client Work
                    </MenuItem>
                    <MenuItem value="Travel">
                      <DirectionsCar style={{ marginRight: 8 }} /> Travel
                    </MenuItem>
                    <MenuItem value="On Call">
                      <Call style={{ marginRight: 8 }} /> On Call
                    </MenuItem>
                    <MenuItem value="Research">
                      <Science style={{ marginRight: 8 }} /> Research
                    </MenuItem>
                    <MenuItem value="Support">
                      <AccessTime style={{ marginRight: 8 }} /> Support
                    </MenuItem>
                    <MenuItem value="Development">
                      <DeveloperMode style={{ marginRight: 8 }} /> Development
                    </MenuItem>
                  </Select>
                </StyledFormControl>
                <FormControlLabel
                  control={<Switch checked={isRemote} onChange={handleToggleRemote} color="primary" />}
                  label="Remote Work"
                />
                {!isRemote && (
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Location"
                    value={checkInData.location}
                    onChange={(e) => setCheckInData({ ...checkInData, location: e.target.value })}
                    InputProps={{
                      startAdornment: <LocationOnIcon style={{ color: 'black' }} />,
                    }}
                  />
                )}

                <TextField
                  fullWidth
                  margin="normal"
                  label="Comments"
                  value={checkInData.comments}
                  onChange={(e) => setCheckInData({ ...checkInData, comments: e.target.value })}
                  InputProps={{
                    startAdornment: <AccessTime style={{ color: 'black' }} />,
                  }}
                />
                <Box display="flex" justifyContent="space-between">
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Department Name"
                    value={departmentName}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Client Name"
                    value={clientName}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCheckIn}
                  style={{ float: 'right', marginTop: '30px', marginBottom: '30px' }}
                  fullWidth
                >
                  Check In
                </Button>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ScrollBox style={{ maxHeight: '600px' }}>
            {currentCheckIns.map(checkIn => (
              <StyledCard key={checkIn.ID}>
                <CardContent>
                  <Grid container justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" gutterBottom>
                      Current Check-In
                    </Typography>
                    <Box display="flex" alignItems="center">
                      {workTypeIcons[checkIn.workType] || <WorkOutlineIcon style={{ marginRight: 8, color: 'black' }} />}
                      <Typography variant="h6" style={{ marginLeft: '5px' }}>
                        {checkIn.workType.toUpperCase()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Box display="flex" alignItems="center" marginTop={1}>
                    <AccessTime style={{ marginRight: '8px', color: 'black' }} />
                    <Typography>Check-in Time: {formatTime(checkIn.checkin)}</Typography>
                  </Box>
                  {checkIn.taskId && (
                    <Box display="flex" alignItems="center" marginTop={1}>
                      <Assignment style={{ marginRight: '8px', color: 'black' }} />
                      <Typography>Current Task: {tasks.find(task => task.ID === checkIn.taskId)?.title}</Typography>
                    </Box>
                  )}
                  <Box display="flex" alignItems="center" marginTop={1}>
                    <LocationOnIcon style={{ marginRight: '8px', color: 'black' }} />
                    <Typography>{checkIn.location === 'Remote' ? 'REMOTE' : checkIn.location}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" marginTop={2}>
                    <DurationClock startTime={checkIn.checkin}  />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleCheckOut(checkIn.ID)}
                      style={{
                        float: 'left',
                        marginTop: '30px',
                        marginBottom: '30px',
                        transform: 'scale(1.3)', // Increase size
                        marginRight: '20px', // Move slightly to the left
                        borderRadius: '40px',
                        boxShadow: '0 0 20px rgba(0, 0, 0, 0.9)',
                      }}
                      startIcon={<ExitToAppIcon />}
                    >
                      Check Out
                    </Button>

                  </Box>
                </CardContent>
              </StyledCard>
            ))}
          </ScrollBox>
        </Grid>
        <Grid item xs={12}>
          <TimesheetHistory workHours={timesheet} tasks={tasks} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;
