import React, { useEffect, useState } from 'react';
import { getTimesheet } from '@/app/api/timesheetApi';
import {
  Box, Typography, Paper, Tooltip, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, CircularProgress, MenuItem, Select, FormControl, InputLabel, Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UpdateIcon from '@mui/icons-material/Update';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CalendarView from './CalendarView';
import RequestEditForm from './RequestEditForm';

const TimesheetContainer = styled(Box)(({ theme }) => ({
  padding: '20px',
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '12px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#000000',
    borderRadius: '10px',
  },
}));

const TimesheetPaper = styled(Paper)(({ theme }) => ({
  padding: '20px',
  borderRadius: '15px',
  boxShadow: theme.shadows[3],
  marginTop: '20px',
  backgroundColor: theme.palette.background.paper,
}));

const PresentIcon = styled(CheckCircleIcon)(({ theme }) => ({
  color: theme.palette.success.main,
  fontSize: '1.5rem',
}));

const HalfIcon = styled(HourglassEmptyIcon)(({ theme }) => ({
  color: theme.palette.warning.main,
  fontSize: '1.5rem',
}));

const AbsentIcon = styled(CancelIcon)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: '1.5rem',
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  gap: '20px',
}));

const TitleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px',
  padding: '10px 16px', // Adjust padding for better alignment
  backgroundColor: theme.palette.primary.main,
  color: '#e8e5e5',
  borderRadius: '15px',
  border: '1px solid rgba(255, 255, 255, 0.2)', // Subtle border for visibility
  backgroundClip: 'padding-box',
  boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.7), 0 -6px 16px rgba(255, 255, 255, 0.3)', // Enhanced box shadow
  position: 'relative',
  textAlign: 'center', // Center text horizontally
  fontSize: '1.5rem',
  fontWeight: 'bold',
  transition: 'all 0.3s ease', // Smooth transition for hover effect
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2), 0 -6px 16px rgba(255, 255, 255, 0.2)', // Hover effect
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    padding: '2px',
    background: 'linear-gradient(black, black)',
    '-webkit-mask': 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    '-webkit-mask-composite': 'xor',
    maskComposite: 'exclude',
  },
}));
const Attendance = () => {
  const theme = useTheme();
  const [timesheet, setTimesheet] = useState([]);
  const [filteredTimesheet, setFilteredTimesheet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [requestEditOpen, setRequestEditOpen] = useState(false);

  const userID = Number(localStorage.getItem('userID'));

  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        const data = await getTimesheet(userID);
        const workdayTimesheet = data.filter(entry => entry.workType === 'Workday');
        setTimesheet(workdayTimesheet);
        setFilteredTimesheet(workdayTimesheet);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch timesheet data', error);
        setLoading(false);
      }
    };

    fetchTimesheet();
  }, [userID]);

  useEffect(() => {
    const filterTimesheet = () => {
      const filtered = timesheet.filter(entry => {
        const date = new Date(entry.checkin * 1000);
        const isSelectedMonth = date.getMonth() + 1 === selectedMonth;
        const isSelectedYear = date.getFullYear() === selectedYear;
        const isSelectedStatus = selectedStatus === 'All' || getStatusLabel(entry.duration) === selectedStatus;

        return isSelectedMonth && isSelectedYear && isSelectedStatus;
      });
      setFilteredTimesheet(filtered);
    };

    filterTimesheet();
  }, [selectedMonth, selectedYear, selectedStatus, timesheet]);

  if (loading) {
    return (
      <TimesheetContainer>
        <CircularProgress />
      </TimesheetContainer>
    );
  }

  const getStatusIcon = (duration) => {
    if (duration >= 8) {
      return <PresentIcon />;
    } else if (duration >= 4) {
      return <HalfIcon />;
    } else {
      return <AbsentIcon />;
    }
  };

  const getStatusLabel = (duration) => {
    if (duration >= 8) {
      return 'Present';
    } else if (duration >= 4) {
      return 'Half Day';
    } else {
      return 'Absent';
    }
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [];
  for (let i = 2020; i <= new Date().getFullYear(); i++) {
    years.push(i);
  }

  return (
    <TimesheetContainer>
      <TitleContainer>
        <Typography variant="h4" gutterBottom sx={{ color: '#000000', fontWeight: 'bold' }}>
          Check-In/Check-Out: WORKDAY
        </Typography>
      </TitleContainer>
      <FilterContainer>
        <Box display="flex" gap="20px">
          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              label="Month"
            >
              {months.map((month, index) => (
                <MenuItem key={index} value={index + 1}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              onChange={handleYearChange}
              label="Year"
            >
              {years.map(year => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={handleStatusChange}
              label="Status"
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Present">Present</MenuItem>
              <MenuItem value="Half Day">Half Day</MenuItem>
              <MenuItem value="Absent">Absent</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box display="flex" alignItems="center">
          <Button
            variant="outlined"
            sx={{
              height: '56px',
              borderColor: 'primary',
              color: '#000',
              '&:hover': {
                borderColor: 'primary',
                backgroundColor: '#f0f0f0',
              }
            }}
            startIcon={<UpdateIcon style={{ fontSize: '2em' }} />}
            onClick={() => setRequestEditOpen(true)}
          >
            Request Update
          </Button>
          <Button
            variant="outlined"
            sx={{
              height: '56px',
              marginLeft: '20px',
              borderColor: 'primary',
              color: '#000',
              '&:hover': {
                borderColor: '#000',
                backgroundColor: '#f0f0f0',
              }
            }}
            startIcon={<CalendarTodayIcon style={{ fontSize: '2em' }} />}
            onClick={() => setCalendarOpen(true)}
          >
            Calendar View
          </Button>
        </Box>
      </FilterContainer>
      <TimesheetPaper>
        <List>
          {filteredTimesheet.map((entry) => {
            const checkinTime = new Date(entry.checkin * 1000);
            const checkoutTime = new Date(entry.checkout * 1000);
            const duration = entry.duration;
            const statusIcon = getStatusIcon(duration);
            const statusLabel = getStatusLabel(duration);
            const dayName = checkinTime.toLocaleDateString('en-US', { weekday: 'long' });

            return (
              <React.Fragment key={entry.ID}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <WorkIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${dayName} (${checkinTime.toLocaleDateString()})`}
                    secondary={
                      <Box>
                        <Box display="flex" alignItems="center">
                          <LocationOnIcon fontSize="small" />
                          <Typography variant="body2" sx={{ marginLeft: 1 }}>
                            {entry.location}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <AccessTimeIcon fontSize="small" />
                          <Typography variant="body2" sx={{ marginLeft: 1 }}>
                            Check-in: {checkinTime.toLocaleTimeString()} - Check-out: {checkoutTime.toLocaleTimeString()} - Duration: {duration.toFixed(2)} hrs
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <Tooltip title={statusLabel}>
                    <Box display="flex" alignItems="center">
                      {statusIcon}
                      <Typography variant="body2" sx={{ marginLeft: 1 }}>
                        {statusLabel}
                      </Typography>
                    </Box>
                  </Tooltip>
                </ListItem>
                <Divider />
              </React.Fragment>
            );
          })}
        </List>
      </TimesheetPaper>
      <CalendarView open={calendarOpen} onClose={() => setCalendarOpen(false)} userID={userID} />
      <Dialog open={requestEditOpen} onClose={() => setRequestEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Request Edit</DialogTitle>
        <DialogContent>
          <RequestEditForm userID={userID} onClose={() => setRequestEditOpen(false)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestEditOpen(false)} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </TimesheetContainer>
  );
};

export default Attendance;

