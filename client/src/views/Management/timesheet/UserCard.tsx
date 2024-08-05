import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Grid, Box, IconButton, Divider, LinearProgress, useTheme
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import HistoryIcon from '@mui/icons-material/History';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import TimesheetHistory from './TimesheetHistory';  // Ensure the import path is correct
import { getTimesheet } from '@/app/api/timesheetApi';  // Ensure the import path is correct
import Avatar from 'react-avatar';

// Registering the required chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface UserCardProps {
  user: any;  // Replace with actual UserType if available
  departmentName: string;
}

const UserCard: React.FC<UserCardProps> = ({ user, departmentName }) => {
  const theme = useTheme();
  const [showHistory, setShowHistory] = useState(false);
  const [workTypeData, setWorkTypeData] = useState([]); // State for work type data
  const [weekDayData, setWeekDayData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchTimesheetData = async () => {
      try {
        const data = await getTimesheet(user.ID);
        setWorkTypeData(processWorkTypeData(data));
        setWeekDayData(processWeekDayData(data));
      } catch (error) {
        console.error('Failed to fetch timesheet data', error);
      }
    };

    fetchTimesheetData();
  }, [user.ID]);

  useEffect(() => {
    const fetchTimesheetData = async () => {
      try {
        const data = await getTimesheet(user.ID);
        setWeekDayData(processWeekDayData(data));
      } catch (error) {
        console.error('Failed to fetch timesheet data', error);
      }
    };

    fetchTimesheetData();
  }, [theme.palette.primary.main]);

  const handleHistoryClick = () => {
    setShowHistory(true);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  const processWorkTypeData = (data) => {
    const workTypes = [
      'Workday', 'Overtime', 'Meeting', 'Training', 'Break',
      'Administrative', 'Task', 'Client Work', 'Development'
    ];
    const workTypeCounts = workTypes.map(type => ({
      type,
      count: data.filter(entry => entry.workType === type).length,
      color: getColorForWorkType(type),
    }));

    return workTypeCounts;
  };

  const getColorForWorkType = (workType) => {
    const workTypeColors = {
      Workday: 'rgba(10,147,237,0.9)',
      Overtime: 'rgba(246,32,10,0.9)',
      Meeting: 'rgba(2,42,69,0.9)',
      Training: 'rgba(230,188,18,0.9)',
      Break: 'rgba(142, 68, 173, 0.9)',
      Administrative: 'rgba(230, 126, 34, 0.9)',
      Task: 'rgba(7,183,81,0.9)',
      Development: 'rgba(32,33,33,0.9)',
    };
    return workTypeColors[workType];
  };

  const processWeekDayData = (data) => {
    const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    const workHours = weekDays.map((day, index) => {
      const dayEntries = data.filter(entry => new Date(entry.checkin * 1000).getDay() === index + 1);
      return dayEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
    });

    return {
      labels: weekDays,
      datasets: [{
        label: 'Work Hours',
        data: workHours,
        backgroundColor: theme.palette.primary.main,
      }],
    };
  };

  return (
    <>
      <Card
        sx={{
          margin: '10px',
          padding: '30px',
          width: '100%',
          maxWidth: '600px',
          transition: 'transform 0.3s, box-shadow 0.3s',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
          },
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={3}>
              {user.picture ? (
                <Avatar
                  src={user.picture}
                  alt={`${user.firstName} ${user.lastName}`}
                  round
                  size="60"
                />
              ) : (
                <Avatar
                  name={`${user.firstName} ${user.lastName}`}
                  round
                  size="60"
                  color={theme.palette.primary.main}
                />
              )}
            </Grid>
            <Grid item xs={7}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <EmailIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography color="textSecondary">{user.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <BusinessIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography color="textSecondary">Department: {departmentName}</Typography>
              </Box>
            </Grid>
            <Grid item xs={2}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <IconButton onClick={handleHistoryClick} sx={{ color: '#101010', position: 'absolute' }}>
                  <HistoryIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 5 }} />
          <Grid container spacing={7} justifyContent="center">
            {workTypeData.map((workType, index) => (
              <Grid item xs={4} key={index}>
                <Typography variant="body2" sx={{ color: workType.color, textAlign: 'center' }}>
                  {workType.type}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  {workType.count}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(workType.count / 10) * 100}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': { backgroundColor: workType.color },
                  }}
                />
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ my: 5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <Bar data={weekDayData} options={{ responsive: true, maintainAspectRatio: false }} height={150} />
          </Box>
        </CardContent>
      </Card>
      <TimesheetHistory userFullName={`${user.firstName} ${user.lastName}`} userId={user.ID} open={showHistory} onClose={handleCloseHistory} />
    </>
  );
};

export default UserCard;
