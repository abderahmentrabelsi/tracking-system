import React from 'react';
import { TaskType } from '@/types/taskTypes';
import { List, ListItem, Card, CardContent, Typography, Grid, Box, IconButton, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface TaskListProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
  onAddTaskClick: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick, onAddTaskClick }) => {
  const statusColors: { [key: string]: string } = {
    "Pending": "#FF6384",
    "In Progress": "#36A2EB",
    "Completed": "#FFCE56",
    "Approved": "#4CAF50",
  };

  const renderTasks = (status: string) => (
    tasks.filter(task => task.status === status).map((task) => (
      <ListItem key={task.ID} button onClick={() => onTaskClick(task)} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
        <Card style={{ width: '100%', marginBottom: '10px', backgroundColor: '#1E1E2F', color: '#FFFFFF' }}>
          <CardContent>
            <Typography variant="h6">{task.title}</Typography>
            <Typography color="textSecondary">{task.description}</Typography>
            <Typography variant="body2" color="textSecondary">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </Typography>
          </CardContent>
        </Card>
      </ListItem>
    ))
  );

  return (
    <Box sx={{ padding: '10px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <Typography variant="h5" sx={{ color: '#FFFFFF' }}>Task Management</Typography>
        <IconButton onClick={onAddTaskClick} style={{ color: '#FFFFFF' }}>
          <AddIcon fontSize="large" />
        </IconButton>
      </Box>
      <Grid container spacing={2}>
        {['Pending', 'In Progress', 'Completed', 'Approved'].map((status) => (
          <Grid item xs={12} md={6} lg={3} key={status}>
            <Box sx={{ textAlign: 'center', marginBottom: '10px', backgroundColor: statusColors[status], padding: '10px', borderRadius: '5px' }}>
              <Typography variant="h6" sx={{ color: '#FFFFFF' }}>{status}</Typography>
            </Box>
            <Divider />
            <List>
              {renderTasks(status)}
            </List>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TaskList;
