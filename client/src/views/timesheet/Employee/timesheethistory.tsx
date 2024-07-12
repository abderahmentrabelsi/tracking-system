import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Card, CardContent, Typography, Switch, FormControlLabel, IconButton, TablePagination, CircularProgress, MenuItem, Select, TextField, Box, Divider
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import { WorkHours, TaskType } from '@/types/timesheetTypes';
import { FirstPage, LastPage, KeyboardArrowLeft, KeyboardArrowRight, EventNote, Work, Home, BusinessCenter, WatchLater, MeetingRoom, School, LocalCafe, Assignment, Build, DirectionsCar, Call, Science, AccessTime, DeveloperMode } from '@mui/icons-material';
import { fetchUserById } from '@/app/api/userApi';
import { Person } from '@mui/icons-material';

interface TimesheetHistoryProps {
  workHours: WorkHours[];
  tasks: TaskType[];
}

const primaryColor = 'rgba(21,20,20,0.62)';

const TimesheetHistory: React.FC<TimesheetHistoryProps> = ({ workHours, tasks }) => {
  const [showTaskHistory, setShowTaskHistory] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [filterLocation, setFilterLocation] = useState<string | null>('');
  const [filterWorkType, setFilterWorkType] = useState<string | null>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [durationFilter, setDurationFilter] = useState<string | null>('');
  const [orderBy, setOrderBy] = useState<string | null>('checkin');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
  const [user, setUser] = useState<{ firstName: string; lastName: string; JobName: string } | null>(null);

  const userId = Number(localStorage.getItem('userID'));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUserById(userId);
        setUser({
          firstName: userData.firstName,
          lastName: userData.lastName,
          JobName: userData.jobTitle,
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
    setLoading(false);
  }, [userId]);

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

  const calculateDuration = (checkin: number, checkout: number) => {
    if (!checkin || !checkout) return 'N/A';
    const diff = new Date(checkout * 1000).getTime() - new Date(checkin * 1000).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes} HRS`;
  };

  const getTaskTitle = (taskID: number | null) => {
    const task = tasks.find(task => task.ID === taskID);
    return task ? task.title : 'N/A';
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRowsPerPage(parseInt(event.target.value as string, 10));
    setPage(0);
  };

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const resetFilters = () => {
    setFilterLocation('');
    setFilterWorkType('');
    setStartDate(null);
    setEndDate(null);
    setDurationFilter('');
  };

  const sortedWorkHours = workHours.sort((a, b) => {
    if (!orderBy) return 0;
    const valueA = orderBy === 'checkin' ? a.checkin : a.checkout;
    const valueB = orderBy === 'checkin' ? b.checkin : b.checkout;
    if (valueA === valueB) return 0;
    return (valueA < valueB ? -1 : 1) * (orderDirection === 'asc' ? 1 : -1);
  });

  const filteredWorkHours = sortedWorkHours.filter(entry => {
    if (showTaskHistory && entry.taskId == null) return false;
    if (filterLocation && filterLocation !== entry.location) return false;
    if (filterWorkType && filterWorkType !== entry.workType) return false;
    if (startDate && new Date(entry.checkin * 1000) < startDate) return false;
    if (endDate && new Date(entry.checkin * 1000) > endDate) return false;
    if (durationFilter) {
      const duration = calculateDuration(entry.checkin, entry.checkout);
      if (duration === 'N/A') return false;
      const durationHours = parseInt(duration.split(':')[0], 10);
      switch (durationFilter) {
        case '< 2 hours':
          if (durationHours >= 2) return false;
          break;
        case '< 5 hours':
          if (durationHours >= 5) return false;
          break;
        case '< 8 hours':
          if (durationHours >= 8) return false;
          break;
        case '8+ hours':
          if (durationHours < 8) return false;
          break;
        default:
          break;
      }
    }
    return true;
  });

  return (
    <Card>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Typography variant="h6" gutterBottom style={{ display: 'flex', alignItems: 'center' }}>
            <EventNote style={{ marginRight: 8 }} />
            Check-In/Check-Out History
            {user && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: `2px solid ${primaryColor}`, // Primary color solid border
                  borderRadius: '8px', // Rounded corners
                  padding: '8px', // Padding inside the box
                  marginLeft: '200px', // Margin to the left
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
                  backgroundColor: 'primary', // Light background color with some opacity
                  transition: 'all 0.3s ease', // Smooth transition for hover effects
                  '&:hover': {
                    borderColor: 'rgba(21, 20, 20, 0.8)', // Darker border color on hover
                    boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.2)' // Slightly stronger shadow on hover
                  }
                }}
              >
                <Person style={{ marginRight: '8px' }} />
                {`${user.firstName} ${user.lastName} - ${user.JobName}`}
              </Box>

            )}
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showTaskHistory}
                  onChange={() => setShowTaskHistory(!showTaskHistory)}
                  name="showTaskHistory"
                  color="default"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'black',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'black',
                    },
                  }}
                />
              }
              label="Task Timer History"
            />
          </div>
        </div>
        <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box display="flex" alignItems="center">
            <TextField
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setStartDate(e.target.value ? parseISO(e.target.value) : null)}
              style={{ marginRight: 10 }}
              variant="outlined"
              size="small"
            />
            <TextField
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setEndDate(e.target.value ? parseISO(e.target.value) : null)}
              style={{ marginRight: 10 }}
              variant="outlined"
              size="small"
            />
            <Select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value as string)}
              displayEmpty
              inputProps={{ 'aria-label': 'Filter by location' }}
              style={{ minWidth: 150 }}
              variant="outlined"
              size="small"
              renderValue={(selected) => {
                if (selected === 'Remote') {
                  return (
                    <Box display="flex" alignItems="center">
                      <Home style={{ marginRight: 8 }} /> Remote
                    </Box>
                  );
                }
                if (selected === 'Office') {
                  return (
                    <Box display="flex" alignItems="center">
                      <Work style={{ marginRight: 8 }} /> Office
                    </Box>
                  );
                }
                return <em>All Locations</em>;
              }}
            >
              <MenuItem value="">
                <em>All Locations</em>
              </MenuItem>
              <MenuItem value="Remote">
                <Box display="flex" alignItems="center">
                  <Home style={{ marginRight: 8 }} /> Remote
                </Box>
              </MenuItem>
              <MenuItem value="Office">
                <Box display="flex" alignItems="center">
                  <Work style={{ marginRight: 8 }} /> Office
                </Box>
              </MenuItem>
            </Select>
            <Select
              value={filterWorkType}
              onChange={(e) => setFilterWorkType(e.target.value as string)}
              displayEmpty
              inputProps={{ 'aria-label': 'Filter by work type' }}
              style={{ minWidth: 150, marginLeft: 10 }}
              variant="outlined"
              size="small"
              renderValue={(selected) => {
                switch (selected) {
                  case 'Workday':
                    return (
                      <Box display="flex" alignItems="center">
                        <BusinessCenter style={{ marginRight: 8 }} /> Workday
                      </Box>
                    );
                  case 'Overtime':
                    return (
                      <Box display="flex" alignItems="center">
                        <WatchLater style={{ marginRight: 8 }} /> Overtime
                      </Box>
                    );
                  case 'Meeting':
                    return (
                      <Box display="flex" alignItems="center">
                        <MeetingRoom style={{ marginRight: 8 }} /> Meeting
                      </Box>
                    );
                  case 'Training':
                    return (
                      <Box display="flex" alignItems="center">
                        <School style={{ marginRight: 8 }} /> Training
                      </Box>
                    );
                  case 'Break':
                    return (
                      <Box display="flex" alignItems="center">
                        <LocalCafe style={{ marginRight: 8 }} /> Break
                      </Box>
                    );
                  case 'Administrative':
                    return (
                      <Box display="flex" alignItems="center">
                        <Assignment style={{ marginRight: 8 }} /> Administrative
                      </Box>
                    );
                  case 'Task':
                    return (
                      <Box display="flex" alignItems="center">
                        <Assignment style={{ marginRight: 8 }} /> Task
                      </Box>
                    );
                  case 'Client Work':
                    return (
                      <Box display="flex" alignItems="center">
                        <Build style={{ marginRight: 8 }} /> Client Work
                      </Box>
                    );
                  case 'Travel':
                    return (
                      <Box display="flex" alignItems="center">
                        <DirectionsCar style={{ marginRight: 8 }} /> Travel
                      </Box>
                    );
                  case 'On Call':
                    return (
                      <Box display="flex" alignItems="center">
                        <Call style={{ marginRight: 8 }} /> On Call
                      </Box>
                    );
                  case 'Research':
                    return (
                      <Box display="flex" alignItems="center">
                        <Science style={{ marginRight: 8 }} /> Research
                      </Box>
                    );
                  case 'Support':
                    return (
                      <Box display="flex" alignItems="center">
                        <AccessTime style={{ marginRight: 8 }} /> Support
                      </Box>
                    );
                  case 'Development':
                    return (
                      <Box display="flex" alignItems="center">
                        <DeveloperMode style={{ marginRight: 8 }} /> Development
                      </Box>
                    );
                  default:
                    return <em>All Work Types</em>;
                }
              }}
            >
              <MenuItem value="">
                <em>All Work Types</em>
              </MenuItem>
              <MenuItem value="Workday">
                <Box display="flex" alignItems="center">
                  <BusinessCenter style={{ marginRight: 8 }} /> Workday
                </Box>
              </MenuItem>
              <MenuItem value="Overtime">
                <Box display="flex" alignItems="center">
                  <WatchLater style={{ marginRight: 8 }} /> Overtime
                </Box>
              </MenuItem>
              <MenuItem value="Meeting">
                <Box display="flex" alignItems="center">
                  <MeetingRoom style={{ marginRight: 8 }} /> Meeting
                </Box>
              </MenuItem>
              <MenuItem value="Training">
                <Box display="flex" alignItems="center">
                  <School style={{ marginRight: 8 }} /> Training
                </Box>
              </MenuItem>
              <MenuItem value="Break">
                <Box display="flex" alignItems="center">
                  <LocalCafe style={{ marginRight: 8 }} /> Break
                </Box>
              </MenuItem>
              <MenuItem value="Administrative">
                <Box display="flex" alignItems="center">
                  <Assignment style={{ marginRight: 8 }} /> Administrative
                </Box>
              </MenuItem>
              <MenuItem value="Task">
                <Box display="flex" alignItems="center">
                  <Assignment style={{ marginRight: 8 }} /> Task
                </Box>
              </MenuItem>
              <MenuItem value="Client Work">
                <Box display="flex" alignItems="center">
                  <Build style={{ marginRight: 8 }} /> Client Work
                </Box>
              </MenuItem>
              <MenuItem value="Travel">
                <Box display="flex" alignItems="center">
                  <DirectionsCar style={{ marginRight: 8 }} /> Travel
                </Box>
              </MenuItem>
              <MenuItem value="On Call">
                <Box display="flex" alignItems="center">
                  <Call style={{ marginRight: 8 }} /> On Call
                </Box>
              </MenuItem>
              <MenuItem value="Research">
                <Box display="flex" alignItems="center">
                  <Science style={{ marginRight: 8 }} /> Research
                </Box>
              </MenuItem>
              <MenuItem value="Support">
                <Box display="flex" alignItems="center">
                  <AccessTime style={{ marginRight: 8 }} /> Support
                </Box>
              </MenuItem>
              <MenuItem value="Development">
                <Box display="flex" alignItems="center">
                  <DeveloperMode style={{ marginRight: 8 }} /> Development
                </Box>
              </MenuItem>
            </Select>
            <Select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value as string)}
              displayEmpty
              inputProps={{ 'aria-label': 'Filter by duration' }}
              style={{ minWidth: 150, marginLeft: 10 }}
              variant="outlined"
              size="small"
              renderValue={(selected) => {
                if (!selected) {
                  return <em>All Durations</em>;
                }
                return selected;
              }}
            >
              <MenuItem value="">
                <em>All Durations</em>
              </MenuItem>
              <MenuItem value="< 2 hours">&lt; 2 hours</MenuItem>
              <MenuItem value="< 5 hours">&lt; 5 hours</MenuItem>
              <MenuItem value="< 8 hours">&lt; 8 hours</MenuItem>
              <MenuItem value="8+ hours">8+ hours</MenuItem>
            </Select>
          </Box>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress />
          </div>
        ) : (
          <>
            <Table sx={{ border: `2px solid ${primaryColor}` }}>
              <TableHead>
                <TableRow>
                  <TableCell onClick={() => handleSort('checkin')} style={{ cursor: 'pointer', borderBottom: `2px solid ${primaryColor}` }}>
                    Check-in {orderBy === 'checkin' ? (orderDirection === 'asc' ? '↑' : '↓') : ''}
                  </TableCell>
                  <TableCell onClick={() => handleSort('checkout')} style={{ cursor: 'pointer', borderBottom: `2px solid ${primaryColor}` }}>
                    Check-out {orderBy === 'checkout' ? (orderDirection === 'asc' ? '↑' : '↓') : ''}
                  </TableCell>
                  <TableCell style={{ borderBottom: `2px solid ${primaryColor}` }}>Duration</TableCell>
                  <TableCell style={{ borderBottom: `2px solid ${primaryColor}` }}>Work Type</TableCell>
                  <TableCell style={{ borderBottom: `2px solid ${primaryColor}` }}>Location</TableCell>
                  {showTaskHistory && <TableCell style={{ borderBottom: `2px solid ${primaryColor}` }}>Task</TableCell>}
                  <TableCell style={{ borderBottom: `2px solid ${primaryColor}` }}>Comments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredWorkHours.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((entry) => (
                  <TableRow key={entry.ID} hover>
                    <TableCell>{formatTime(entry.checkin)}</TableCell>
                    <TableCell>{entry.checkout ? formatTime(entry.checkout) : 'N/A'}</TableCell>
                    <TableCell>{calculateDuration(entry.checkin, entry.checkout)}</TableCell>
                    <TableCell>{entry.workType}</TableCell>
                    <TableCell>{entry.location}</TableCell>
                    {showTaskHistory && <TableCell>{entry.taskId != null ? getTaskTitle(entry.taskId) : 'N/A'}</TableCell>}
                    <TableCell>{entry.comments}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Divider />
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredWorkHours.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={(paginationProps) => (
                <div style={{ flexShrink: 0, marginLeft: 20, display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    onClick={(event) => paginationProps.onPageChange(event, 0)}
                    disabled={paginationProps.page === 0}
                    aria-label="first page"
                  >
                    <FirstPage style={{ color: '#110a0a' }} />
                  </IconButton>
                  <IconButton
                    onClick={(event) => paginationProps.onPageChange(event, paginationProps.page - 1)}
                    disabled={paginationProps.page === 0}
                    aria-label="previous page"
                  >
                    <KeyboardArrowLeft style={{ color: '#110a0a' }} />
                  </IconButton>
                  <Typography variant="body2" style={{ margin: '0 10px', color: 'default' }}>
                    {paginationProps.page + 1}
                  </Typography>
                  <IconButton
                    onClick={(event) => paginationProps.onPageChange(event, paginationProps.page + 1)}
                    disabled={paginationProps.page >= Math.ceil(paginationProps.count / paginationProps.rowsPerPage) - 1}
                    aria-label="next page"
                  >
                    <KeyboardArrowRight style={{ color: '#110a0a' }} />
                  </IconButton>
                  <IconButton
                    onClick={(event) => paginationProps.onPageChange(event, Math.max(0, Math.ceil(paginationProps.count / paginationProps.rowsPerPage) - 1))}
                    disabled={paginationProps.page >= Math.ceil(paginationProps.count / paginationProps.rowsPerPage) - 1}
                    aria-label="last page"
                  >
                    <LastPage style={{ color: '#110a0a' }} />
                  </IconButton>
                  <Box display="flex" justifyContent="flex-start" alignItems="center">
                    <IconButton onClick={resetFilters} style={{ position: 'absolute', left: 0 }}>
                      <Typography variant="body2">Reset Filters</Typography>
                    </IconButton>
                  </Box>
                </div>
              )}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TimesheetHistory;
