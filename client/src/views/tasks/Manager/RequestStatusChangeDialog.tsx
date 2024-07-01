import React, { useState } from 'react';
import { TaskType, CommentType } from '@/types/taskTypes';
import { createComment, approveStatusChange, requestStatusChange } from '@/app/api/taskApi';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, TextField, Snackbar, Alert
} from '@mui/material';

interface RequestStatusChangeDialogProps {
  task: TaskType;
  open: boolean;
  onClose: () => void;
  onRequestHandled: (updatedTask: TaskType) => void;
  fetchComments: () => void;
}

const RequestStatusChangeDialog: React.FC<RequestStatusChangeDialogProps> = ({ task, open, onClose, onRequestHandled, fetchComments }) => {
  const [comment, setComment] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleApprove = async () => {
    try {
      await createComment({
        ID: 0,
        taskId: task.ID,
        userId: parseInt(localStorage.getItem('userID') || '0', 10),
        content: `[Status Change Approved] ${comment}`,
        createdAt: new Date().toISOString(),
      });
      const updatedTask = await approveStatusChange(task.ID);
      onRequestHandled(updatedTask);
      setSnackbarMessage('Status change approved successfully');
      onClose();
      setTimeout(() => setOpenSnackbar(true), 500);
      fetchComments();
    } catch (error) {
      console.error('Failed to approve status change', error);
      setSnackbarMessage('Failed to approve status change');
      setOpenSnackbar(true);
    }
  };

  const handleDecline = async () => {
    try {
      await createComment({
        ID: 0,
        taskId: task.ID,
        userId: parseInt(localStorage.getItem('userID') || '0', 10),
        content: `[Status Change Declined] ${comment}`,
        createdAt: new Date().toISOString(),
      });
      await requestStatusChange(task.ID, '');
      onRequestHandled({ ...task, requestedStatus: '' });
      setSnackbarMessage('Status change declined');
      onClose();
      setTimeout(() => setOpenSnackbar(true), 500);
      fetchComments();
    } catch (error) {
      console.error('Failed to decline status change', error);
      setSnackbarMessage('Failed to decline status change');
      setOpenSnackbar(true);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Requested Status Change</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Requested Status: {task.requestedStatus}</Typography>
          <TextField
            label="Leave a Comment"
            multiline
            rows={4}
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDecline} color="secondary">Decline</Button>
          <Button onClick={handleApprove} color="primary">Approve</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RequestStatusChangeDialog;
