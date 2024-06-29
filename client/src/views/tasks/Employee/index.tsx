import React, { useEffect, useState } from 'react';
import { TaskType } from '@/types/taskTypes';
import { getTasksByUserId, getDepartmentById } from '@/app/api/taskApi';
import { fetchUserById } from '@/app/api/userApi';
import {UserType} from '@/types/departmentTypes';
import { Box, Typography, Grid, Avatar, Card, CardContent } from '@mui/material';
import TaskList from './TaskList';
import { styled } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BusinessIcon from '@mui/icons-material/Business';

const EmployeeInfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  textAlign: 'center',
}));

const EmployeeAvatar = styled(Avatar)(({ theme }) => ({
  marginRight: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
}));

const EmployeeDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [department, setDepartment] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = parseInt(localStorage.getItem('userID') || '0', 10);
        const departmentId = parseInt(localStorage.getItem('departmentId') || '0', 10);

        const [fetchedTasks, fetchedUser, fetchedDepartment] = await Promise.all([
          getTasksByUserId(userId),
          fetchUserById(userId),
          getDepartmentById(departmentId),
        ]);

        setTasks(fetchedTasks);
        setUser(fetchedUser);
        setDepartment(fetchedDepartment.name);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };

    fetchData();
  }, []);

  const groupedTasks = (status: string) => tasks.filter((task) => task.status === status);

  return (
    <Box sx={{ padding: '20px' }}>
      {user && (
        <EmployeeInfoBox>
          <Box>
            <Typography variant="h5" gutterBottom sx={{textTransform: 'uppercase'}}>
              {user.firstName} {user.lastName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BusinessIcon sx={{ marginRight: '4px' }} />
              <Typography variant="body1">{department}</Typography>
            </Box>
          </Box>
        </EmployeeInfoBox>
      )}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={2}>
          {['Pending', 'In Progress', 'Completed', 'Approved'].map((status) => (
            <Grid item xs={12} md={6} lg={3} key={status}>
              <TaskList tasks={groupedTasks(status)} status={status} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default EmployeeDashboard;
