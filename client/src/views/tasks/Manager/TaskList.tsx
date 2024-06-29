import React, { useState } from 'react';
import { Box, Typography, Grid, Tooltip, Snackbar, Divider } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CreateTaskForm from './CreateTaskForm';
import { styled } from '@mui/material/styles';
import { updateTask } from '@/app/api/taskApi';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TaskIcon from '@mui/icons-material/Task';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const statusColors: { [key: string]: string } = {
  "Pending": "#ca5555",
  "In Progress": "#0f5b90",
  "Completed": "#b79c5b",
  "Approved": "#28922d",
};

const TaskCard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#FFFFFF' : '#1E1E2F',
  color: theme.palette.mode === 'light' ? '#000000' : '#FFFFFF',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
}));

const TaskListContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#F0F0F0' : '#1E1E2F',
  borderRadius: '5px',
  padding: '10px',
  marginBottom: '10px',
}));

const StatusHeader = styled(Typography)(({ theme }) => ({
  color: '#FFFFFF',
  backgroundColor: '#333333',
  padding: '8px 16px',
  borderRadius: '5px',
  marginBottom: '5px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  fontWeight: 'bold',
}));

interface TaskListProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
  onTaskCreated: (task: TaskType) => void;
  assigneeId: number;
  departmentId: number;
  managerId: number;
  fetchTasks: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick, onTaskCreated, assigneeId, departmentId, managerId, fetchTasks }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const taskId = parseInt(result.draggableId);
      const updatedTask = tasks.find(task => task.ID === taskId);
      if (updatedTask) {
        updatedTask.status = destination.droppableId;
        try {
          await updateTask(taskId, updatedTask);
          setSnackbarMessage(`Task moved to ${destination.droppableId}`);
          setOpenSnackbar(true);
          fetchTasks(); // Refresh the tasks
        } catch (error) {
          console.error('Failed to update task status', error);
        }
      }
    }
  };

  const renderTasks = (tasks: TaskType[]) => (
    tasks.map((task, index) => (
      <Draggable key={task.ID} draggableId={task.ID.toString()} index={index}>
        {(provided) => (
          <TaskCard
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => onTaskClick(task)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TaskIcon sx={{ mr: 1, color: '#3f51b5' }} />
              <Typography variant="h6">{task.title}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DateRangeIcon sx={{ mr: 1, color: '#3f51b5' }} />
              <Typography variant="body2" color="textSecondary">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </Typography>
            </Box>
          </TaskCard>
        )}
      </Draggable>
    ))
  );

  return (
    <Box sx={{ padding: '10px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <Typography variant="h5">Task Management</Typography>
        <Tooltip title="Assign Task">
          <CreateTaskForm
            assigneeId={assigneeId}
            departmentId={departmentId}
            managerId={managerId}
            onTaskCreated={onTaskCreated}
            fetchTasks={fetchTasks}
          />
        </Tooltip>
      </Box>
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={2}>
          {['Pending', 'In Progress', 'Completed', 'Approved'].map((status) => (
            <Grid item xs={12} md={6} lg={3} key={status}>
              <TaskListContainer sx={{ backgroundColor: statusColors[status], padding: '10px', borderRadius: '5px' }}>
                <StatusHeader variant="h6">{status}</StatusHeader>
                <Divider sx={{ margin: '5px 0', backgroundColor: '#888888' }} />
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        backgroundColor: snapshot.isDraggingOver ? '#A7CFF6' : 'transparent',
                        transition: 'background-color 0.2s ease-in-out',
                        borderRadius: '5px',
                        minHeight: '100px',
                        marginTop: '10px',
                      }}
                    >
                      {renderTasks(tasks.filter(task => task.status === status))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </TaskListContainer>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskList;
