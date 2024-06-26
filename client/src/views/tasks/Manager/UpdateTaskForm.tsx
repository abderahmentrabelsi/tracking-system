import React, { useState, useEffect } from 'react';
import { TaskType } from '@/types/taskTypes';
import { updateTask, getDepartmentById } from '@/app/api/taskApi';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

interface UpdateTaskFormProps {
  task: TaskType;
  onTaskUpdated: (updatedTask: TaskType) => void;
  onClose: () => void;
}

const UpdateTaskForm: React.FC<UpdateTaskFormProps> = ({ task, onTaskUpdated, onClose }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueDate.split('T')[0]);
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

  const handleUpdate = async () => {
    try {
      const updatedTask = await updateTask(task.ID, { title, description, dueDate: dueDate + "T00:00:00Z", assigneeId });
      onTaskUpdated(updatedTask);
      onClose();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Task</DialogTitle>
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
          <InputLabel>Assignee</InputLabel>
          <Select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            {departmentUsers.map(user => (
              <MenuItem key={user.ID} value={user.ID}>{user.firstName} {user.lastName}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleUpdate} color="primary">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateTaskForm;
