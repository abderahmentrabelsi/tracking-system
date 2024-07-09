import React, { useState, useEffect } from 'react';
import { TaskType } from '@/types/taskTypes';
import { TextField, Button, DialogActions, FormControl, InputLabel, Select, MenuItem, Box, IconButton, Tooltip, ListItemIcon, ListItemText ,Typography } from '@mui/material';
import { updateTask, getDepartmentById } from '@/app/api/taskApi';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DescriptionIcon from '@mui/icons-material/Description';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import AssigneeIcon from '@mui/icons-material/Person';
import StatusIcon from '@mui/icons-material/Assignment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { motion } from 'framer-motion';

interface UpdateTaskFormProps {
  task: TaskType;
  onTaskUpdated: (updatedTask: TaskType) => void;
  onClose: () => void;
}

const statusOptions = [
  { value: 'Pending', label: 'Pending', icon: <PendingActionsIcon /> },
  { value: 'In Progress', label: 'In Progress', icon: <AutorenewIcon /> },
  { value: 'Completed', label: 'Completed', icon: <CheckCircleIcon /> },
  { value: 'Approved', label: 'Approved', icon: <ThumbUpIcon /> },
];

const UpdateTaskForm: React.FC<UpdateTaskFormProps> = ({ task, onTaskUpdated, onClose }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueDate.split('T')[0]);
  const [status, setStatus] = useState(task.status);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId);
  const [departmentUsers, setDepartmentUsers] = useState<{ ID: number, firstName: string, lastName: string }[]>([]);

  useEffect(() => {
    const fetchDepartmentUsers = async () => {
      try {
        const department = await getDepartmentById(task.departmentId);
        setDepartmentUsers(department.users);
      } catch (error) {
        console.error('Failed to fetch department users', error);
      }
    };

    fetchDepartmentUsers();
  }, [task.departmentId]);

  const handleSubmit = async () => {
    const updatedTask: TaskType = {
      ...task,
      title,
      description,
      dueDate: dueDate + "T00:00:00Z",
      status,
      assigneeId
    };
    try {
      const result = await updateTask(task.ID, updatedTask);
      onTaskUpdated(result);
      onClose();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AssignmentTurnedInIcon sx={{ mr: 1, color: '#3f51b5' }} />
          <TextField
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DateRangeIcon sx={{ mr: 1, color: '#3f51b5' }} />
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <AssigneeIcon sx={{ mr: 1, color: '#3f51b5' }} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Assignee</InputLabel>
            <Select
              label="Assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              sx={{ height: 50 }}
            >
              {departmentUsers.map(user => (
                <MenuItem key={user.ID} value={user.ID}>{user.firstName} {user.lastName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DescriptionIcon sx={{ mr: 1, color: '#3f51b5' }} />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <StatusIcon sx={{ mr: 3, color: '#3f51b5' }} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ height: 40 }}
              renderValue={(selected) => {
                const selectedOption = statusOptions.find(option => option.value === selected);
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {selectedOption?.icon}
                    <ListItemText sx={{ ml: 1 }}>{selectedOption?.label}</ListItemText>
                  </Box>
                );
              }}
            >
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  <ListItemIcon>{option.icon}</ListItemIcon>
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <DialogActions>
          <Tooltip title="Cancel">
            <IconButton onClick={onClose} color="primary">
              <CancelIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Update">
            <IconButton onClick={handleSubmit} color="primary">
              <SaveIcon />
            </IconButton>
          </Tooltip>
        </DialogActions>
      </Box>
    </motion.div>
  );
};

export default UpdateTaskForm;
