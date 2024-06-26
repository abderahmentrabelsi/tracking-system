import React, { useState, useEffect } from 'react';
import { TaskType, CommentType } from '@/types/taskTypes';
import { getCommentsByTaskId, createComment, updateComment, deleteComment, deleteTask, updateTask } from '@/app/api/taskApi';
import {
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Tooltip,
  Box
} from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SyncIcon from '@mui/icons-material/Sync';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import UpdateTaskForm from './UpdateTaskForm';

const statusIcons = {
  Pending: <HourglassEmptyIcon style={{ color: 'orange' }} />,
  'In Progress': <SyncIcon style={{ color: 'blue' }} />,
  Completed: <CheckCircleIcon style={{ color: 'green' }} />,
  Approved: <ThumbUpIcon style={{ color: 'purple' }} />,
};

const statusColors = {
  Pending: 'orange',
  'In Progress': 'blue',
  Completed: 'green',
  Approved: 'purple',
};

interface TaskDetailsProps {
  task: TaskType;
  onTaskDeleted: () => void;
  onTaskUpdated: (updatedTask: TaskType) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task, onTaskDeleted, onTaskUpdated }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<string>('');
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const fetchedComments = await getCommentsByTaskId(task.ID);
        setComments(fetchedComments);
      } catch (error) {
        console.error('Failed to fetch comments', error);
      }
    };

    fetchComments();
  }, [task.ID]);

  const handleAddComment = async () => {
    try {
      const userId = parseInt(localStorage.getItem('userID') || '0', 10);
      const comment: CommentType = {
        ID: 0,
        taskId: task.ID,
        userId,
        content: newComment,
        createdAt: new Date().toISOString(),
      };

      const createdComment = await createComment(comment);
      setComments([...comments, createdComment]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment', error);
    }
  };

  const handleEditComment = async (id: number) => {
    try {
      const updatedComment = await updateComment(id, { content: editingComment });
      setComments(comments.map(comment => comment.ID === id ? updatedComment : comment));
      setEditingCommentId(null);
      setEditingComment('');
    } catch (error) {
      console.error('Failed to update comment', error);
    }
  };

  const handleDeleteComment = async (id: number) => {
    try {
      await deleteComment(id);
      setComments(comments.filter(comment => comment.ID !== id));
    } catch (error) {
      console.error('Failed to delete comment', error);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask(task.ID);
      onTaskDeleted();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const handleOpenUpdateDialog = () => {
    setEditingTask(task);
    setOpenUpdateDialog(true);
  };

  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false);
    setEditingTask(null);
  };

  const handleDeleteDialogOpen = () => setDeleteDialogOpen(true);
  const handleDeleteDialogClose = () => setDeleteDialogOpen(false);

  return (
    <>
      <Card sx={{ margin: '20px', padding: '20px', position: 'relative' }}>
        <CardContent>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h4" align="center" sx={{ fontWeight: 'bold' }}>
                {task.title}
              </Typography>
            </Grid>
            <Grid item>
              <Tooltip title="Update Task">
                <IconButton onClick={handleOpenUpdateDialog}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            {statusIcons[task.status]}
            <span style={{ color: statusColors[task.status], marginLeft: '10px' }}>{task.status}</span>
          </Typography>
          <Typography color="textSecondary" sx={{ marginTop: '20px' }}>{task.description}</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ marginTop: '10px' }}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </Typography>
          <Typography variant="h6" sx={{ marginTop: '20px' }}>Comments</Typography>
          <List>
            {comments.map((comment) => (
              <ListItem key={comment.ID} sx={{ display: 'flex', alignItems: 'center' }}>
                <CommentIcon />
                {editingCommentId === comment.ID ? (
                  <TextField
                    value={editingComment}
                    onChange={(e) => setEditingComment(e.target.value)}
                    fullWidth
                    sx={{ margin: '0 10px' }}
                  />
                ) : (
                  <ListItemText primary={comment.content} secondary={`User ID: ${comment.userId}`} />
                )}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {editingCommentId === comment.ID ? (
                    <>
                      <Button onClick={() => handleEditComment(comment.ID)} color="primary">Save</Button>
                      <Button onClick={() => setEditingCommentId(null)} color="secondary">Cancel</Button>
                    </>
                  ) : (
                    <>
                      <IconButton onClick={() => { setEditingCommentId(comment.ID); setEditingComment(comment.content); }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteComment(comment.ID)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </div>
              </ListItem>
            ))}
          </List>
          <TextField
            label="Add Comment"
            multiline
            rows={4}
            variant="outlined"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            fullWidth
            sx={{ marginTop: '10px' }}
          />
          <Button variant="contained" color="primary" onClick={handleAddComment} sx={{ marginTop: '10px' }}>
            Add Comment
          </Button>
          <Tooltip title="Delete Task">
            <IconButton onClick={handleDeleteDialogOpen} sx={{ position: 'absolute', right: '20px', bottom: '20px' }}>
              <DeleteIcon sx={{ color: 'red' }} />
            </IconButton>
          </Tooltip>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>{"Delete Task"}</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteTask} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {editingTask && (
        <Dialog open={openUpdateDialog} onClose={handleCloseUpdateDialog} fullWidth maxWidth="md">
          <DialogTitle>Update Task</DialogTitle>
          <DialogContent>
            <UpdateTaskForm
              task={editingTask}
              onTaskUpdated={(updatedTask) => {
                onTaskUpdated(updatedTask);
                setEditingTask(null);
                setOpenUpdateDialog(false);
              }}
              onClose={handleCloseUpdateDialog}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUpdateDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default TaskDetails;
