import React, { useState, useEffect } from 'react'
import { TaskType, CommentType } from '@/types/taskTypes'
import { UsersType } from '@/types/userTypes'
import { getCommentsByTaskId, createComment, deleteComment } from '@/app/api/taskApi'
import { fetchUserById } from '@/app/api/userApi'
import {
  Typography,
  Card,
  CardContent,
  TextField,
  List,
  ListItem,
  IconButton,
  Grid,
  Tooltip,
  Box,
  Divider,
  Snackbar,
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material'
import NoteIcon from '@mui/icons-material/Note'
import DateRangeIcon from '@mui/icons-material/DateRange'
import DescriptionIcon from '@mui/icons-material/Description'
import AddCommentIcon from '@mui/icons-material/AddComment'
import DeleteIcon from '@mui/icons-material/Delete'
import UpdateIcon from '@mui/icons-material/Update'
import { styled } from '@mui/material/styles'
import RequestStatusChange from './RequestStatusChange'

const statusColors = {
  Pending: '#ca5555',
  'In Progress': '#0f5b90',
  Completed: '#b79c5b',
  Approved: '#28922d'
}

const StatusBadge = styled(Box)(({ status }) => ({
  backgroundColor: statusColors[status],
  color: '#FFFFFF',
  padding: '5px 20px',
  borderRadius: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: '20px',
  marginRight: 'auto'
}))

const StatusChangeIndicator = styled(Box)(({ theme, status }) => ({
  backgroundColor:
    status === 'Declined'
      ? theme.palette.error.main
      : status === 'Approved'
        ? theme.palette.success.main
        : theme.palette.info.main,
  color: '#FFFFFF',
  padding: '2px 10px',
  borderRadius: '10px',
  display: 'inline-block',
  marginLeft: '10px'
}))

const CommentContainer = styled(Box)(({ theme }) => ({
  marginBottom: '10px',
  padding: '10px',
  borderRadius: '5px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default
}))

const CommentActions = styled(Box)({
  display: 'flex',
  alignItems: 'center'
})

const CommentInputContainer = styled(Box)(({ theme }) => ({
  marginTop: '10px',
  padding: '10px',
  borderRadius: '5px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper
}))

interface TaskDetailsProps {
  task: TaskType
  onTaskDeleted: () => void
  onTaskUpdated: (updatedTask: TaskType) => void
  fetchTasks: () => void
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task, onTaskDeleted, onTaskUpdated, fetchTasks }) => {
  const [taskDetails, setTaskDetails] = useState<TaskType>(task)
  const [comments, setComments] = useState<CommentType[]>([])
  const [commentUsers, setCommentUsers] = useState<Record<number, UsersType>>({})
  const [newComment, setNewComment] = useState<string>('')
  const [openRequestDialog, setOpenRequestDialog] = useState(false)
  const [openWarningDialog, setOpenWarningDialog] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  useEffect(() => {
    const fetchCommentsAndUsers = async () => {
      try {
        const fetchedComments = await getCommentsByTaskId(task.ID)
        setComments(fetchedComments)

        const userFetchPromises = fetchedComments.map(comment => fetchUserById(comment.userId))
        const users = await Promise.all(userFetchPromises)
        const usersById = users.reduce((acc, user) => ({ ...acc, [user.ID]: user }), {})
        setCommentUsers(usersById)
      } catch (error) {
        console.error('Failed to fetch comments or users', error)
      }
    }

    fetchCommentsAndUsers()
  }, [task])

  const handleAddComment = async () => {
    try {
      const userId = parseInt(localStorage.getItem('userID') || '0', 10)
      const comment: CommentType = {
        ID: 0,
        taskId: taskDetails.ID,
        userId,
        content: newComment,
        createdAt: new Date().toISOString()
      }

      const createdComment = await createComment(comment)
      const user = await fetchUserById(userId)

      setComments([...comments, createdComment])
      setCommentUsers({ ...commentUsers, [userId]: user })
      setNewComment('')
    } catch (error) {
      console.error('Failed to create comment', error)
    }
  }

  const handleDeleteComment = async (id: number) => {
    try {
      await deleteComment(id)
      setComments(comments.filter(comment => comment.ID !== id))
      setSnackbarMessage('Comment deleted successfully')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Failed to delete comment', error)
    }
  }

  const handleRequestSubmitted = async (requestedStatus: string, statusComment: string) => {
    try {
      const userId = parseInt(localStorage.getItem('userID') || '0', 10)
      const comment: CommentType = {
        ID: 0,
        taskId: taskDetails.ID,
        userId,
        content: `${statusComment}`,
        createdAt: new Date().toISOString()
      }
      const createdComment = await createComment(comment)
      const user = await fetchUserById(userId)
      setComments([...comments, createdComment])
      setCommentUsers({ ...commentUsers, [userId]: user })
      setSnackbarMessage('Status change requested successfully')
      setOpenSnackbar(true)
      fetchTasks()
    } catch (error) {
      console.error('Failed to request status change', error)
    }
  }

  const handleRequestStatusChangeClick = () => {
    if (taskDetails.requestedStatus) {
      setOpenWarningDialog(true)
    } else {
      setOpenRequestDialog(true)
    }
  }

  const handleSnackbarClose = () => setOpenSnackbar(false)

  return (
    <>
      <Card sx={{ margin: '20px', padding: '20px', position: 'relative', borderRadius: '15px', boxShadow: 3 }}>
        <CardContent>
          <Grid container justifyContent='space-between' alignItems='center'>
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant='h4' sx={{ fontWeight: 'bold' }}>
                  {taskDetails.title}
                </Typography>
                <Box sx={{ width: '20px' }} /> {/* Indent added here */}
                <StatusBadge status={taskDetails.status}>{taskDetails.status}</StatusBadge>
              </Box>
            </Grid>
            <Grid item>
              <Tooltip title='Request Status Change'>
                <IconButton
                  onClick={handleRequestStatusChangeClick}
                  sx={{ position: 'absolute', top: '10px', right: '10px' }}
                >
                  <UpdateIcon sx={{ color: 'black' }} />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          <Divider sx={{ margin: '20px 0' }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant='body1' sx={{ display: 'flex', alignItems: 'center' }}>
                <DescriptionIcon sx={{ mr: 1, color: 'black' }} />
                <Typography variant='h6' sx={{ marginLeft: '10px' }}>
                  Description :{' '}
                </Typography>
              </Typography>
              <Typography color='textSecondary' sx={{ marginTop: '10px', marginLeft: '34px' }}>
                {taskDetails.description}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='body1' sx={{ display: 'flex', alignItems: 'center' }}>
                <DateRangeIcon sx={{ mr: 1, color: 'black' }} />
                <Typography variant='h6' sx={{ marginLeft: '10px' }}>
                  Due Date:
                </Typography>
                <Typography variant='body2' color='textSecondary' sx={{ marginLeft: '10px' }}>
                  {new Date(taskDetails.dueDate).toLocaleDateString()}
                </Typography>
              </Typography>
            </Grid>
          </Grid>
          <Typography variant='h6' sx={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
            <NoteIcon sx={{ mr: 1, color: 'black' }} /> Notes :
          </Typography>
          <List>
            {comments.map(comment => {
              const user = commentUsers[comment.userId]
              const isOwner = comment.userId === parseInt(localStorage.getItem('userID') || '0', 10)
              const isStatusChangeComment =
                comment.content.startsWith('[Status Change]') || comment.content.startsWith('[Request Status Change]')

              return (
                <ListItem
                  key={comment.ID}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '10px',
                    backgroundColor: 'primary',
                    padding: '10px',
                    borderRadius: '5px'
                  }}
                >
                  <Avatar sx={{ mr: 2 }}>{user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}</Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant='body1'>
                      {comment.content.replace('[Status Change]', '').replace('[Request Status Change]', '')}
                      {isStatusChangeComment && (
                        <StatusChangeIndicator
                          status={
                            comment.content.startsWith('[Status Change]') ? comment.content.split(' ')[2] : 'Requested'
                          }
                        >
                          {comment.content.startsWith('[Status Change]')
                            ? comment.content.split(' ')[2]
                            : 'REQUEST STATUS'}
                        </StatusChangeIndicator>
                      )}
                    </Typography>
                    <Typography variant='caption' color='textSecondary'>
                      {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'} -{' '}
                      {new Date(comment.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  {isOwner && (
                    <CommentActions>
                      <Tooltip title='Delete'>
                        <IconButton onClick={() => handleDeleteComment(comment.ID)} sx={{ color: '#1a1313' }}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </CommentActions>
                  )}
                </ListItem>
              )
            })}
          </List>
          <CommentInputContainer>
            <TextField
              label='Add Note'
              multiline
              rows={1}
              variant='outlined'
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              fullWidth
              sx={{ flexGrow: 1, marginRight: '10px' }}
            />
            <IconButton color='primary' onClick={handleAddComment} sx={{ color: 'primary' }}>
              <AddCommentIcon />
            </IconButton>
          </CommentInputContainer>
        </CardContent>
      </Card>

      <RequestStatusChange
        task={taskDetails}
        open={openRequestDialog}
        onClose={() => setOpenRequestDialog(false)}
        onRequestSubmitted={handleRequestSubmitted}
      />

      <Dialog open={openWarningDialog} onClose={() => setOpenWarningDialog(false)}>
        <DialogTitle>Request Already Exists</DialogTitle>
        <DialogContent>
          <Alert severity='warning'>
            This task already has a pending status change request. Please wait for it to be processed before submitting
            another request.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWarningDialog(false)} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity='success'>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default TaskDetails
