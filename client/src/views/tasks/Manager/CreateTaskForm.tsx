import React, { useState } from 'react';
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { createTask } from '@/app/api/taskApi';
import { TaskType } from '@/types/taskTypes';

interface CreateTaskFormProps {
  assigneeId: number;
  departmentId: number;
  managerId: number;
  onTaskCreated: (task: TaskType) => void;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ assigneeId, departmentId, managerId, onTaskCreated }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [initialComment, setInitialComment] = useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
      comments: initialComment ? [{ ID: 0, taskId: 0, userId: managerId, content: initialComment, createdAt: new Date().toISOString() }] : []
    };
    try {
      const createdTask = await createTask(newTask);
      onTaskCreated(createdTask);
      handleClose();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  return (
    <div>
      <IconButton onClick={handleClickOpen}>
        <AddIcon />
      </IconButton>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Initial Comment"
            type="text"
            fullWidth
            value={initialComment}
            onChange={(e) => setInitialComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CreateTaskForm;
