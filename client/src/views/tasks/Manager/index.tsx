'use client'
import React, { useEffect, useState } from 'react';
import { getDepartmentById, getTasksByUserId } from '@/app/api/taskApi';
import { DepartmentType, UserType } from '@/types/departmentTypes';
import { TaskType } from '@/types/taskTypes';
import { Card, CardContent, Typography, List, ListItem, Grid } from '@mui/material';
import TaskDetails from './TaskDetails';
import CreateTaskForm from './CreateTaskForm';

const ManagerDashboard: React.FC = () => {
  const [department, setDepartment] = useState<DepartmentType | null>(null);
  const [tasks, setTasks] = useState<{ [key: number]: TaskType[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartmentAndTasks = async () => {
      const storedDepartmentId = localStorage.getItem('departmentId');
      if (storedDepartmentId) {
        try {
          const departmentData = await getDepartmentById(parseInt(storedDepartmentId, 10));
          setDepartment(departmentData);

          const tasksByUser: { [key: number]: TaskType[] } = {};
          await Promise.all(departmentData.users.map(async (user: UserType) => {
            const userTasks = await getTasksByUserId(user.ID);
            tasksByUser[user.ID] = userTasks;
          }));
          setTasks(tasksByUser);
        } catch (error) {
          console.error('Failed to fetch department or tasks', error);
        }
      }
      setLoading(false);
    };

    fetchDepartmentAndTasks();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Typography variant="h4">
          {department ? `${department.name} - Client: ${department.clientName}` : 'No Department Found'}
        </Typography>
      </div>
      <CreateTaskForm />
      <Grid container spacing={3} style={{ justifyContent: 'center' }}>
        {department && department.users.map(user => (
          <Grid item xs={12} sm={6} md={4} key={user.ID}>
            <Card>
              <CardContent>
                <Typography variant="h6">{user.firstName} {user.lastName}</Typography>
                <List>
                  {tasks[user.ID]?.length ? tasks[user.ID].map(task => (
                    <ListItem key={task.ID}>
                      <TaskDetails task={task} />
                    </ListItem>
                  )) : (
                    <ListItem>No tasks assigned</ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default ManagerDashboard;
