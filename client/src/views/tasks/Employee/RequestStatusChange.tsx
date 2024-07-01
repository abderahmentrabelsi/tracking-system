import React, { useState } from 'react';
import { requestStatusChange, createComment } from '@/app/api/taskApi';
import { TaskType } from '@/types/taskTypes';
import {
  Dialog, DialogActions, DialogContent, DialogTitle, Button, MenuItem, Select, FormControl, InputLabel, TextField, Box, Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const CustomDialog = styled(Dialog)({
  '& .MuiPaper-root': {
    borderRadius: '15px',
    padding: '20px',
    animation: 'pop-up 0.5s ease',
  },
  '@keyframes pop-up': {
    '0%': {
      transform: 'scale(0.5)',
      opacity: 0,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 1,
    },
  },
});

const statusOptions = [
  { value: 'Pending', label: 'Pending', icon: <PendingActionsIcon /> },
  { value: 'In Progress', label: 'In Progress', icon: <AutorenewIcon /> },
  { value: 'Completed', label: 'Completed', icon: <CheckCircleIcon /> },
  { value: 'Approved', label: 'Approved', icon: <ThumbUpIcon /> },
];

interface RequestStatusChangeProps {
  task: TaskType;
  open: boolean;
  onClose: () => void;
  onRequestSubmitted: (requestedStatus: string, statusComment: string) => void;
}

const RequestStatusChange: React.FC<RequestStatusChangeProps> = ({ task, open, onClose, onRequestSubmitted }) => {
  const [requestedStatus, setRequestedStatus] = useState<string>(task.requestedStatus || task.status);
  const [statusComment, setStatusComment] = useState<string>('');

  const handleRequestStatusChange = async () => {
    try {
      await requestStatusChange(task.ID, requestedStatus);
      onRequestSubmitted(requestedStatus, `[Request Status Change] ${statusComment}`);
      onClose();
    } catch (error) {
      console.error('Failed to request status change', error);
    }
  };

  return (
    <CustomDialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Request Status Change</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ marginBottom: '20px', marginTop: '20px' }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            fullWidth
            value={requestedStatus}
            onChange={(e) => setRequestedStatus(e.target.value)}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {option.icon}
                  <Typography sx={{ marginLeft: '10px' }}>{option.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Comment"
          multiline
          rows={4}
          variant="outlined"
          value={statusComment}
          onChange={(e) => setStatusComment(e.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" startIcon={<PendingActionsIcon />}>
          Cancel
        </Button>
        <Button onClick={handleRequestStatusChange} color="primary" endIcon={<CheckCircleIcon />}>
          Submit
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default RequestStatusChange;
