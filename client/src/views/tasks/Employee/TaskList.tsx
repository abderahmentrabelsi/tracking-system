import React, { useState } from 'react'
import { TaskType } from '@/types/taskTypes'
import {
  List,
  ListItem,
  Typography,
  Box,
  Divider,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material'
import DateRangeIcon from '@mui/icons-material/DateRange'
import TaskIcon from '@mui/icons-material/Task'
import InfoIcon from '@mui/icons-material/Info'
import { styled } from '@mui/material/styles'
import TaskDetails from './TaskDetails' // Ensure this import path is correct

const statusColors: { [key: string]: string } = {
  Pending: '#ca5555',
  'In Progress': '#0f5b90',
  Completed: '#b79c5b',
  Approved: '#28922d'
}

const TaskCard = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#FFFFFF' : '#1E1E2F',
  color: theme.palette.mode === 'light' ? '#000000' : '#FFFFFF',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' ? '#F9F9F9' : '#2E2E3F',
    transform: 'scale(1.02)',
    transition: 'all 0.3s ease-in-out'
  }
}))

const StatusHeader = styled(Typography)<{ status: string }>(({ status }) => ({
  color: '#FFFFFF',
  backgroundColor: statusColors[status],
  padding: '8px 16px',
  borderRadius: '5px',
  marginBottom: '5px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  fontWeight: 'bold'
}))

interface TaskListProps {
  tasks: TaskType[]
  status: string
}

const TaskList: React.FC<TaskListProps> = ({ tasks, status }) => {
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null)

  const handleTaskClick = (task: TaskType) => {
    setSelectedTask(task)
  }

  const handleCloseDialog = () => {
    setSelectedTask(null)
  }

  return (
    <Box>
      <StatusHeader status={status} variant='h6'>
        {status}
      </StatusHeader>
      <Divider sx={{ marginBottom: '10px' }} />
      <List>
        {tasks.map(task => (
          <TaskCard key={task.ID}>
            <ListItem>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <TaskIcon sx={{ marginRight: '10px', color: 'primary' }} />
                  <Typography variant='h6'>{task.title}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DateRangeIcon sx={{ marginRight: '10px', color: 'primary' }} />
                  <Typography variant='body2' color='textSecondary'>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => handleTaskClick(task)} sx={{ marginLeft: 'auto' }}>
                <InfoIcon />
              </IconButton>
            </ListItem>
          </TaskCard>
        ))}
      </List>

      <Dialog open={Boolean(selectedTask)} onClose={handleCloseDialog} fullWidth maxWidth='md'>
        <DialogContent>
          {selectedTask && (
            <TaskDetails
              task={selectedTask}
              onTaskDeleted={handleCloseDialog}
              onTaskUpdated={() => {}} // Dummy handler, as employee cannot update tasks
              fetchTasks={() => {}} // Dummy handler
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TaskList
