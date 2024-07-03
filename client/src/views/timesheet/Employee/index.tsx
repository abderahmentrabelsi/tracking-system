
'use client';

import React, { useEffect, useState } from 'react';
import { getTimesheet, checkIn, checkOut } from '@/app/api/timesheetApi';
import { getTasksByUserId } from '@/app/api/taskApi';
import { WorkHours, CheckInData } from '@/types/timesheetTypes';
import {TaskType} from '@/types/taskTypes'
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from '@mui/material';
import { formatDistanceToNow, parseISO } from 'date-fns';

const EmployeeDashboard: React.FC = () => {
  const [timesheet, setTimesheet] = useState<WorkHours[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [normalCheckIn, setNormalCheckIn] = useState<CheckInData>({
    userID: parseInt(localStorage.getItem('userID') || '0'),
    workType: '',
    location: '',
    comments: '',
  });
  const [taskCheckIn, setTaskCheckIn] = useState<CheckInData>({
    userID: parseInt(localStorage.getItem('userID') || '0'),
    workType: '',
    location: '',
    comments: '',
    taskID: null,
  });
  const [loading, setLoading] = useState(false);
  const [liveCheckIn, setLiveCheckIn] = useState<WorkHours | null>(null);

  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        const userID = parseInt(localStorage.getItem('userID') || '0');
        const data = await getTimesheet(userID);
        setTimesheet(data);
        const ongoingCheckIn = data.find((entry) => !entry.Checkout);
        setLiveCheckIn(ongoingCheckIn || null);
      } catch (error) {
        console.error('Error fetching timesheet:', error);
      }
    };

    const fetchTasks = async () => {
      try {
        const userID = parseInt(localStorage.getItem('userID') || '0');
        const data = await getTasksByUserId(userID);
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTimesheet();
    fetchTasks();
  }, []);

  const handleNormalCheckIn = async () => {
    setLoading(true);
    try {
      const checkInData = await checkIn(normalCheckIn);
      setTimesheet((prev) => [...prev, checkInData]);
      setLiveCheckIn(checkInData);
      setNormalCheckIn({ ...normalCheckIn, workType: '', location: '', comments: '' });
    } catch (error) {
      console.error('Error checking in:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCheckIn = async () => {
    setLoading(true);
    try {
      const checkInData = await checkIn(taskCheckIn);
      setTimesheet((prev) => [...prev, checkInData]);
      setLiveCheckIn(checkInData);
      setTaskCheckIn({ ...taskCheckIn, workType: '', location: '', comments: '', taskID: null });
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
      const userID = parseInt(localStorage.getItem('userID') || '0');
      const data = await getTimesheet(userID);
      setTimesheet(data);
      setLiveCheckIn(null);
    } catch (error) {
      console.error('Error checking out:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = parseISO(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toLocaleString();
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Employee Timesheet Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Normal Work Check-In
              </Typography>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Work Type"
                  value={normalCheckIn.workType}
                  onChange={(e) => setNormalCheckIn({ ...normalCheckIn, workType: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Location"
                  value={normalCheckIn.location}
                  onChange={(e) => setNormalCheckIn({ ...normalCheckIn, location: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Comments"
                  value={normalCheckIn.comments}
                  onChange={(e) => setNormalCheckIn({ ...normalCheckIn, comments: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNormalCheckIn}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                Check In
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Task Timer
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel id="task-label">Select Task</InputLabel>
                <Select
                  labelId="task-label"
                  value={taskCheckIn.taskID || ''}
                  onChange={(e) => setTaskCheckIn({ ...taskCheckIn, taskID: e.target.value as number })}
                >
                  {tasks.map((task) => (
                    <MenuItem key={task.ID} value={task.ID}>
                      {task.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Work Type"
                  value={taskCheckIn.workType}
                  onChange={(e) => setTaskCheckIn({ ...taskCheckIn, workType: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Location"
                  value={taskCheckIn.location}
                  onChange={(e) => setTaskCheckIn({ ...taskCheckIn, location: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Comments"
                  value={taskCheckIn.comments}
                  onChange={(e) => setTaskCheckIn({ ...taskCheckIn, comments: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                onClick={handleTaskCheckIn}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                Start Task Timer
              </Button>
            </CardContent>
          </Card>
        </Grid>
        {liveCheckIn && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Check-In
                </Typography>
                <Typography variant="body2">
                  Check-in Time: {formatDate(liveCheckIn.Checkin)}
                </Typography>
                <Typography variant="body2">
                  Duration: {formatDistanceToNow(parseISO(liveCheckIn.Checkin))}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleCheckOut(liveCheckIn.ID)}
                  disabled={loading}
                >
                  Check Out
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Check-In/Check-Out History
              </Typography>
              <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                {timesheet
                  .filter((entry) => entry.Checkout)
                  .map((entry) => (
                    <Card key={entry.ID} sx={{ marginBottom: 2 }}>
                      <CardContent>
                        <Typography variant="body2">
                          Check-in: {formatDate(entry.Checkin)}
                        </Typography>
                        <Typography variant="body2">
                          Check-out: {entry.Checkout ? formatDate(entry.Checkout) : 'In Progress'}
                        </Typography>
                        <Typography variant="body2">
                          Duration: {entry.Duration.toFixed(2)} hours
                        </Typography>
                        <Typography variant="body2">
                          Comments: {entry.Comments}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;
