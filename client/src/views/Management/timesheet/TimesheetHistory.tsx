'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

interface TimesheetHistoryProps {
  userId: number;
}

const TimesheetHistory: React.FC<TimesheetHistoryProps> = ({ userId }) => {
  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Timesheet History for Employee ID: {userId}
      </Typography>
      <Typography variant="body1" align="center">
        This is a placeholder for the timesheet history of the employee.
      </Typography>
    </Box>
  );
};

export default TimesheetHistory;
