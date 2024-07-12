'use client';

import React, { useState, useEffect } from 'react';
import { getDepartmentById } from '@/app/api/departmentApi';
import UserCard from './UserCard';
import {
  Box, Typography, CircularProgress, Grid
} from '@mui/material';

const TimesheetManagement = () => {
  const [users, setUsers] = useState([]);
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(true);

  const departmentId = typeof window !== 'undefined' ? Number(localStorage.getItem('departmentId')) : null;

  useEffect(() => {
    if (departmentId) {
      const fetchDepartment = async () => {
        try {
          const department = await getDepartmentById(departmentId);
          setUsers(department.users);
          setDepartmentName(department.name);
          setLoading(false);
        } catch (error) {
          console.error('Failed to fetch department', error);
          setLoading(false);
        }
      };

      fetchDepartment();
    } else {
      setLoading(false);
    }
  }, [departmentId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!departmentId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6" color="error">
          Department ID not found in localStorage.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Timesheet Management Dashboard
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {users.map(user => (
          <Grid item xs={12} sm={6} md={4} key={user.ID}>
            <UserCard user={user} departmentName={departmentName} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TimesheetManagement;
