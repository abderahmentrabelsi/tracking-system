'use client'
import React, { useEffect, useState } from 'react';
import { Grid, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { getDepartmentById } from '@/app/api/departmentApi';
import { DepartmentType, UserType } from '@/types/departmentTypes';
import { TaskType } from '@/types/taskTypes';
import UserCard from './UserCard';
import TaskDetails from './TaskDetails';
import CreateTaskForm from './CreateTaskForm';
import Cookies from 'js-cookie';

const ManagerDashboard: React.FC = () => {
  const [department, setDepartment] = useState<DepartmentType | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openCreateTaskDialog, setOpenCreateTaskDialog] = useState(false);

  const getTokenData = () => {
    const token = Cookies.get('access_token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      return decodedToken;
    }
    return null;
  };

  useEffect(() => {
    const tokenData = getTokenData();
    if (tokenData && tokenData.DepartmentID) {
      fetchDepartment(tokenData.DepartmentID);
    }
  }, []);

  const fetchDepartment = async (departmentId: number) => {
    try {
      const fetchedDepartment = await getDepartmentById(departmentId);
      setDepartment(fetchedDepartment);
    } catch (error) {
      console.error('Failed to fetch department', error);
    }
  };

  const handleUserClick = (user: UserType) => {
    setSelectedUser(user);
  };

  const handleTaskCreated = (newTask: TaskType) => {
    if (selectedUser) {
      setTasks([...tasks, newTask]);
    }
  };

  const handleTaskUpdated = (updatedTask: TaskType) => {
    setTasks(tasks.map(task => task.ID === updatedTask.ID ? updatedTask : task));
    const tokenData = getTokenData();
    if (tokenData && tokenData.DepartmentID) {
      fetchDepartment(tokenData.DepartmentID);
    }
  };

  const handleTaskClick = (task: TaskType) => {
    setSelectedTask(task);
    setOpenTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    setSelectedTask(null);
  };

  const handleOpenCreateTaskDialog = () => {
    setOpenCreateTaskDialog(true);
  };

  const handleCloseCreateTaskDialog = () => {
    setOpenCreateTaskDialog(false);
  };

  return (
    <div>
      <Typography variant="h2" align="center" gutterBottom>
        Task Management Dashboard
      </Typography>
      <Grid container spacing={2}>
        {department?.users.map((user) => (
          <UserCard
            key={user.ID}
            user={user}
            onTaskCreated={handleTaskCreated}
            departmentId={user.DepartmentID}
            managerId={getTokenData()?.ID || 0}
            onUserClick={handleUserClick}
            departmentName={department?.name || 'N/A'}
          />
        ))}
      </Grid>
      {selectedTask && (
        <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog} maxWidth="md" fullWidth>
          <DialogTitle>Task Details</DialogTitle>
          <DialogContent>
            <TaskDetails
              task={selectedTask}
              onTaskDeleted={handleCloseTaskDialog}
              onTaskUpdated={handleTaskUpdated}
              fetchTasks={() => {
                const tokenData = getTokenData();
                if (tokenData && tokenData.DepartmentID) {
                  fetchDepartment(tokenData.DepartmentID);
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTaskDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Dialog open={openCreateTaskDialog} onClose={handleCloseCreateTaskDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create Task</DialogTitle>
        <DialogContent>
          <CreateTaskForm
            assigneeId={selectedUser ? selectedUser.ID : 0}
            departmentId={selectedUser ? selectedUser.DepartmentID : 0}
            managerId={getTokenData()?.ID || 0}
            onTaskCreated={handleTaskCreated}
            fetchTasks={() => {
              const tokenData = getTokenData();
              if (tokenData && tokenData.DepartmentID) {
                fetchDepartment(tokenData.DepartmentID);
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateTaskDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManagerDashboard;
