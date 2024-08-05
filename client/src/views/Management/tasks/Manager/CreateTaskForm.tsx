import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Select, InputLabel, FormControl, Box, Snackbar, Tooltip, Alert, ListItemIcon, ListItemText, Typography
} from '@mui/material';
import {
  AddCircleOutline as AddCircleOutlineIcon, Title as TitleIcon, Description as DescriptionIcon, DateRange as DateRangeIcon, AssignmentTurnedIn as AssignmentTurnedInIcon, PendingActions as PendingActionsIcon, Autorenew as AutorenewIcon, CheckCircle as CheckCircleIcon, ThumbUp as ThumbUpIcon, Close as CloseIcon, Check as CheckIcon, SupervisorAccount as SupervisorAccountIcon
} from '@mui/icons-material';
import { createTask } from '@/app/api/taskApi';
import { fetchUserById } from '@/app/api/userApi'; // Assuming the path to the user API
import { TaskType, UsersType } from '@/types/taskTypes';

interface CreateTaskFormProps {
  assigneeId: number;
  departmentId: number;
  managerId: number;
  onTaskCreated: (task: TaskType) => void;
}

const statusOptions = [
  { value: 'Pending', label: 'Pending', icon: <PendingActionsIcon /> },
  { value: 'In Progress', label: 'In Progress', icon: <AutorenewIcon /> },
  { value: 'Completed', label: 'Completed', icon: <CheckCircleIcon /> },
  { value: 'Approved', label: 'Approved', icon: <ThumbUpIcon /> },
];

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ assigneeId, departmentId, managerId, onTaskCreated }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [managerName, setManagerName] = useState('');

  useEffect(() => {
    const fetchManagerName = async () => {
      const currentUserID = localStorage.getItem('userID');
      if (currentUserID) {
        try {
          const user = await fetchUserById(parseInt(currentUserID));
          setManagerName(`${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}`);
        } catch (error) {
          console.error('Failed to fetch manager name', error);
        }
      }
    };

    fetchManagerName();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async () => {
    const newTask: TaskType = {
      ID: 0,
      title,
      description,
      status,
      requestedStatus: '',
      assigneeId,
      managerId,
      dueDate: dueDate + "T00:00:00Z",
      departmentId,
      comments: []
    };
    try {
      const createdTask = await createTask(newTask);
      onTaskCreated(createdTask);
      handleClose();
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  return (
    <div>
      <Tooltip title="Create Task">
        <IconButton onClick={handleClickOpen} sx={{ color: '#242428', fontSize: 40, transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.2)' } }}>
          <AddCircleOutlineIcon />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Create Task</span>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SupervisorAccountIcon sx={{ mr: 1, color: '#3f51b5' }} />
              <Typography sx={{ fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' }}>
                Reports to: {managerName}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
            <TitleIcon sx={{ mr: 1, color: '#3f51b5' }} />
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              type="text"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
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
              sx={{ flexGrow: 1 }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
            <AssignmentTurnedInIcon sx={{ mr: 1, color: '#3f51b5' }} />
            <FormControl fullWidth margin="dense" sx={{ flexGrow: 1 }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, flexWrap: 'wrap' }}>
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
              sx={{ flexGrow: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} startIcon={<CloseIcon />} sx={{ transition: 'background-color 0.3s', '&:hover': { backgroundColor: '#e0e0e0' } }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} startIcon={<CheckIcon />} sx={{ transition: 'background-color 0.3s', '&:hover': { backgroundColor: '#e0e0e0' } }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Task created successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CreateTaskForm;
