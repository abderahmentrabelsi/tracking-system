import React, { useState, useEffect } from 'react';
import { UserType } from '@/types/departmentTypes';
import { TaskType } from '@/types/taskTypes';
import { Card, CardContent, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Avatar, CircularProgress } from '@mui/material';
import TaskIcon from '@mui/icons-material/Assignment';
import { getTasksByUserId, deleteTask } from '@/app/api/taskApi';
import CreateTaskForm from './CreateTaskForm';
import TaskList from './TaskList';
import TaskDetails from './TaskDetails';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

interface UserCardProps {
  user: UserType;
  onTaskCreated: (task: TaskType) => void;
  departmentId: number;
  managerId: number;
  onUserClick: (user: UserType) => void;
  departmentName: string;
}

const UserCard: React.FC<UserCardProps> = ({ user, onTaskCreated, departmentId, managerId, onUserClick, departmentName }) => {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [taskStats, setTaskStats] = useState({ pending: 0, inProgress: 0, completed: 0, approved: 0 });
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async (userId: number) => {
    try {
      const fetchedTasks = await getTasksByUserId(userId);
      setTasks(fetchedTasks);
      setTaskStats({
        pending: fetchedTasks.filter(task => task.status === 'Pending').length,
        inProgress: fetchedTasks.filter(task => task.status === 'In Progress').length,
        completed: fetchedTasks.filter(task => task.status === 'Completed').length,
        approved: fetchedTasks.filter(task => task.status === 'Approved').length,
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  };

  useEffect(() => {
    fetchTasks(user.ID);
  }, [user.ID]);

  const handleClickOpen = () => {
    onUserClick(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTask(null);
  };

  const handleTaskClick = (task: TaskType) => {
    setSelectedTask(task);
    setOpenTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    setSelectedTask(null);
  };

  const handleTaskUpdated = (updatedTask: TaskType) => {
    setTasks(tasks.map(task => task.ID === updatedTask.ID ? updatedTask : task));
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.ID !== taskId));
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const data = (label: string, color: string, value: number) => ({
    labels: [label],
    datasets: [{
      data: [value, 100 - value],
      backgroundColor: [color, '#e0e0e0'],
      borderWidth: 1,
    }]
  });

  return (
    <Card style={{ margin: '10px', padding: '20px', position: 'relative', width: '45%', minHeight: '250px' }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar
              alt={user.firstName}
              src={`https://randomuser.me/api/portraits/men/${user.ID}.jpg`}
              sx={{ width: 80, height: 80 }}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" align="center">{`${user.firstName} ${user.lastName}`}</Typography>
            <Typography color="textSecondary" align="center">{user.email}</Typography>
            <Typography color="textSecondary" align="center">
              Department: {departmentName}
            </Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={handleClickOpen}>
              <TaskIcon />
            </IconButton>
          </Grid>
        </Grid>
        <div style={{ marginTop: '20px' }}>
          {loading ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={2} justifyContent="space-around">
              <Grid item xs={3}>
                <Typography variant="subtitle1" align="center">Pending</Typography>
                <Doughnut data={data('Pending', '#FF6384', taskStats.pending)} />
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle1" align="center">In Progress</Typography>
                <Doughnut data={data('In Progress', '#36A2EB', taskStats.inProgress)} />
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle1" align="center">Completed</Typography>
                <Doughnut data={data('Completed', '#FFCE56', taskStats.completed)} />
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle1" align="center">Approved</Typography>
                <Doughnut data={data('Approved', '#4CAF50', taskStats.approved)} />
              </Grid>
            </Grid>
          )}
        </div>
      </CardContent>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{`${user.firstName} ${user.lastName}`}</DialogTitle>
        <DialogContent>
          <CreateTaskForm assigneeId={user.ID} departmentId={departmentId} managerId={managerId} onTaskCreated={onTaskCreated} />
          <TaskList tasks={tasks} onTaskClick={handleTaskClick} onDeleteTask={handleDeleteTask} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {selectedTask && (
        <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog} maxWidth="md" fullWidth>
          <DialogTitle>Task Details</DialogTitle>
          <DialogContent>
            <TaskDetails task={selectedTask} onTaskDeleted={handleCloseTaskDialog} onTaskUpdated={handleTaskUpdated} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTaskDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Card>
  );
};

export default UserCard;
