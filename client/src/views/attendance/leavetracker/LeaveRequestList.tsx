'use client';

import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Stack } from '@mui/material';
import { getLeaveRequestsByUserId } from '@/app/api/leaveApi';
import { LeaveRequestType } from '@/types/leaveTypes';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import { CheckCircleOutline, ErrorOutline, Pending, AccessTime, Comment, CalendarToday } from '@mui/icons-material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const getUserIdFromToken = () => {
  const token = Cookies.get('access_token');
  if (token) {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    return decodedToken.UserID;
  }
  return null;
};

const LeaveRequestList = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestType[]>([]);
  const userId = getUserIdFromToken();

  useEffect(() => {
    if (userId) {
      getLeaveRequestsByUserId(userId)
        .then((data) => setLeaveRequests(data))
        .catch((error) => console.error('Failed to fetch leave requests:', error));
    }
  }, [userId]);

  const leaveTypeColors = {
    SICK: 'primary',
    Vacation: 'secondary',
    Personal: 'success',
    default: 'default'
  };

  const statusColors = {
    Approved: 'success',
    Declined: 'error',
    Processing: 'warning'
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircleOutline />;
      case 'Declined':
        return <ErrorOutline />;
      default:
        return <Pending />;
    }
  };

  const statusBgColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success.light';
      case 'Declined':
        return 'error.light';
      default:
        return 'warning.light';
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={2}>
        {leaveRequests.map((request) => (
          <Grid item xs={12} sm={6} md={4} key={request.id}>
            <Card
              variant="outlined"
              sx={{
                bgcolor: 'background.paper',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.9)',
                height: '100%',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Chip
                    label={request.leaveType}
                    color={leaveTypeColors[request.leaveType] || 'default'}
                    sx={{ fontWeight: 'bold', fontSize: '0.875rem', textTransform: 'uppercase' }}
                  />
                  <Box
                    sx={{
                      bgcolor: statusBgColor(request.leaveStatus),
                      borderRadius: 1,
                      p: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {statusIcon(request.leaveStatus)}
                  </Box>
                </Stack>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ mr: 1 }} />
                      <strong>Start Date:</strong> {dayjs.unix(request.startDate).format('DD/MM/YYYY')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ mr: 1 }} />
                      <strong>End Date:</strong> {dayjs.unix(request.endDate).format('DD/MM/YYYY')}
                    </Typography>
                  </Grid>
                </Grid >
                <Typography  variant="body2" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <AccessTime sx={{ mr: 1 }} />
                  <strong>Duration:</strong> {request.duration} days
                </Typography>
                <Typography  variant="body2" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <MonetizationOnIcon sx={{ mr: 1 }} />
                  <strong>Paid Leave:</strong>
                  <Box
                    sx={{
                      ml: 1,
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: request.paid ? 'success.light' : 'error.light',
                      color: 'white',
                      display: 'inline-block'
                    }}
                  >
                    {request.paid ? 'Yes' : 'No'}
                  </Box>
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Comment sx={{ mr: 1 }} />
                  <strong>Comments:</strong> {request.comments || 'N/A'}
                </Typography>
                {request.managerComment && (
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Comment sx={{ mr: 1 }} />
                    <strong>Manager Comment:</strong> {request.managerComment}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LeaveRequestList;
