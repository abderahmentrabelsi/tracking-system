import React, { useState, useEffect } from 'react';
import { TaskType, CommentType } from '@/types/taskTypes';
import { UsersType } from '@/types/userTypes';
import { getCommentsByTaskId, createComment, deleteComment, deleteTask } from '@/app/api/taskApi';
import { fetchUserById } from '@/app/api/userApi';
import {
  Typography, Card, CardContent, TextField, List, ListItem, IconButton, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, Tooltip, Box, Divider, Snackbar, Alert, Avatar, Button
} from '@mui/material';
import NoteIcon from '@mui/icons-material/Note';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SyncIcon from '@mui/icons-material/Sync';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DescriptionIcon from '@mui/icons-material/Description';
import AddCommentIcon from '@mui/icons-material/AddComment';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import UpdateTaskForm from './UpdateTaskForm';
import RequestStatusChangeDialog from './RequestStatusChangeDialog';
import { styled } from '@mui/material/styles';

const statusIcons = {
  Pending: <HourglassEmptyIcon style={{ color: 'orange' }} />,
  'In Progress': <SyncIcon style={{ color: 'blue' }} />,
  Completed: <CheckCircleIcon style={{ color: 'green' }} />,
  Approved: <ThumbUpIcon style={{ color: 'purple' }} />,
};

const statusColors = {
  "Pending": "#ca5555",
  "In Progress": "#0f5b90",
  "Completed": "#b79c5b",
  "Approved": "#28922d",
};

const StatusBadge = styled(Box)(({ status }) => ({
  backgroundColor: statusColors[status],
  color: '#FFFFFF',
  padding: '5px 20px',
  borderRadius: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: '20px',
  marginRight: 'auto',
}));

const StatusChangeIndicator = styled(Box)(({ status }) => ({
  backgroundColor: statusColors[status],
  color: '#FFFFFF',
  padding: '2px 10px',
  borderRadius: '10px',
  display: 'inline-block',
  marginLeft: '10px',
}));

const CommentContainer = styled(Box)(({ theme }) => ({
  marginBottom: '10px',
  padding: '10px',
  borderRadius: '5px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default,
}));

const CommentActions = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

const CommentInputContainer = styled(Box)(({ theme }) => ({
  marginTop: '10px',
  padding: '10px',
  borderRadius: '5px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
}));

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

interface TaskDetailsProps {
  task: TaskType;
  onTaskDeleted: () => void;
  onTaskUpdated: (updatedTask: TaskType) => void;
  fetchTasks: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task, onTaskDeleted, onTaskUpdated, fetchTasks }) => {
  const [taskDetails, setTaskDetails] = useState<TaskType | null>(task);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentUsers, setCommentUsers] = useState<Record<number, UsersType>>({});
  const [newComment, setNewComment] = useState<string>('');
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestStatusDialogOpen, setRequestStatusDialogOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (task) {
      setTaskDetails(task);
      const fetchCommentsAndUsers = async () => {
        try {
          const fetchedComments = await getCommentsByTaskId(task.ID);
          setComments(fetchedComments);

          const userFetchPromises = fetchedComments.map(comment => fetchUserById(comment.userId));
          const users = await Promise.all(userFetchPromises);
          const usersById = users.reduce((acc, user) => ({ ...acc, [user.ID]: user }), {});
          setCommentUsers(usersById);
        } catch (error) {
          console.error('Failed to fetch comments or users', error);
        }
      };

      fetchCommentsAndUsers();
    }
  }, [task]);

  const handleAddComment = async () => {
    try {
      const userId = parseInt(localStorage.getItem('userID') || '0', 10);
      const comment: CommentType = {
        ID: 0,
        taskId: taskDetails!.ID,
        userId,
        content: newComment,
        createdAt: new Date().toISOString(),
      };

      const createdComment = await createComment(comment);
      const user = await fetchUserById(userId);

      setComments([...comments, createdComment]);
      setCommentUsers({ ...commentUsers, [userId]: user });
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment', error);
    }
  };

  const handleDeleteComment = async (id: number) => {
    try {
      await deleteComment(id);
      setComments(comments.filter(comment => comment.ID !== id));
      setSnackbarMessage('Comment deleted successfully');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Failed to delete comment', error);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask(taskDetails!.ID);
      onTaskDeleted();
      fetchTasks(); // Ensure the task list is updated
      setSnackbarMessage('Task deleted successfully');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const handleOpenUpdateDialog = () => setOpenUpdateDialog(true);
  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false);
    setEditingTask(null);
  };
  const handleDeleteDialogOpen = () => setDeleteDialogOpen(true);
  const handleDeleteDialogClose = () => setDeleteDialogOpen(false);
  const handleRequestStatusDialogOpen = () => setRequestStatusDialogOpen(true);
  const handleRequestStatusDialogClose = () => setRequestStatusDialogOpen(false);
  const handleSnackbarClose = () => setOpenSnackbar(false);

  if (!taskDetails) {
    return null; // Or a loading indicator
  }

  return (
    <>
      <Card sx={{ margin: '20px', padding: '20px', position: 'relative', borderRadius: '15px', boxShadow: 3 }}>
        <CardContent>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {taskDetails.title}
                </Typography>
                <Box sx={{ width: '20px' }} />
                <StatusBadge status={taskDetails.status}>
                  {taskDetails.status}
                </StatusBadge>
                {taskDetails.requestedStatus && (
                  <Tooltip title="Status Change Requested">
                    <IconButton onClick={handleRequestStatusDialogOpen}>
                      <NotificationImportantIcon sx={{ color: 'primary', ml: 3 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>
            <Grid item>
              <Tooltip title="Update Task">
                <IconButton onClick={() => { setEditingTask(taskDetails); handleOpenUpdateDialog(); }} sx={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <EditIcon sx={{ color: 'black' }} />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          <Divider sx={{ margin: '20px 0' }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                <DescriptionIcon sx={{ mr: 1, color: 'black' }} />
                <Typography variant="h6" sx={{ marginLeft: '10px' }}>Description : </Typography>
              </Typography>
              <Typography color="textSecondary" sx={{ marginTop: '10px', marginLeft: '34px' }}>{taskDetails.description}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                <DateRangeIcon sx={{ mr: 1, color: 'black' }} />
                <Typography variant="h6" sx={{ marginLeft: '10px' }}>Due Date:</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ marginLeft: '10px' }}>
                  {new Date(taskDetails.dueDate).toLocaleDateString()}
                </Typography>
              </Typography>
            </Grid>
          </Grid>
          <Typography variant="h6" sx={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
            <NoteIcon sx={{ mr: 1, color: 'black' }} /> Notes :
          </Typography>
          <List>
            {comments.map((comment) => {
              const user = commentUsers[comment.userId];
              const isOwner = comment.userId === parseInt(localStorage.getItem('userID') || '0', 10);
              const isStatusChangeComment = comment.content.startsWith('[Status Change] ');
              const isRequestStatusComment = comment.content.startsWith('[Request Status Change] ');

              return (
                <ListItem key={comment.ID} sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px', padding: '10px', borderRadius: '5px', backgroundColor: 'primary' }}>
                  <Avatar sx={{ mr: 2 }}>{user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}</Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">
                      {isStatusChangeComment ? comment.content.split(' ').slice(2).join(' ') : comment.content}
                      {isRequestStatusComment && (
                        <StatusChangeIndicator status={taskDetails.requestedStatus}>
                          REQUEST STATUS
                        </StatusChangeIndicator>
                      )}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'} - {new Date(comment.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  {isOwner && (
                    <CommentActions>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteComment(comment.ID)} sx={{ color: '#1a1313' }}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </CommentActions>
                  )}
                </ListItem>
              );
            })}
          </List>
          <CommentInputContainer>
            <TextField
              label="Add Note"
              multiline
              rows={1}
              variant="outlined"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              fullWidth
              sx={{ flexGrow: 1, marginRight: '10px' }}
            />
            <IconButton color="primary" onClick={handleAddComment} sx={{ color: 'primary' }}>
              <AddCommentIcon />
            </IconButton>
          </CommentInputContainer>
          <Tooltip title="Delete Task">
            <IconButton onClick={handleDeleteDialogOpen} sx={{ position: 'absolute', right: '3px', bottom: '2px', color: 'black' }}>
              <DeleteForeverIcon />
            </IconButton>
          </Tooltip>
        </CardContent>
      </Card>

      <CustomDialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>{"Delete Task"}</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteTask} color="primary">
            Delete
          </Button>
        </DialogActions>
      </CustomDialog>

      <RequestStatusChangeDialog
        task={taskDetails}
        open={requestStatusDialogOpen}
        onClose={handleRequestStatusDialogClose}
        onRequestHandled={(updatedTask) => {
          setTaskDetails(updatedTask); // Update the task details state
          onTaskUpdated(updatedTask);
          setRequestStatusDialogOpen(false);
        }}
        fetchComments={() => getCommentsByTaskId(task.ID).then(setComments)}
      />

      {editingTask && (
        <CustomDialog open={openUpdateDialog} onClose={handleCloseUpdateDialog} fullWidth maxWidth="md">
          <DialogTitle>Update Task</DialogTitle>
          <DialogContent>
            <UpdateTaskForm
              task={editingTask}
              onTaskUpdated={(updatedTask) => {
                setTaskDetails(updatedTask); // Update the task details state
                onTaskUpdated(updatedTask);
                setEditingTask(null);
                setOpenUpdateDialog(false);
                fetchTasks(); // Ensure the task list is updated
                setSnackbarMessage('Task updated successfully');
                setOpenSnackbar(true);
              }}
              onClose={handleCloseUpdateDialog}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUpdateDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </CustomDialog>
      )}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TaskDetails;
