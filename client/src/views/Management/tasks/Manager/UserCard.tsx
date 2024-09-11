import React, { useState, useEffect } from 'react'
import { UserType } from '@/types/departmentTypes'
import { TaskType } from '@/types/taskTypes'
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  CircularProgress,
  Box
} from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import EmailIcon from '@mui/icons-material/Email'
import BusinessIcon from '@mui/icons-material/Business'
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { getTasksByUserId, deleteTask } from '@/app/api/taskApi'
import TaskList from './TaskList'
import TaskDetails from './TaskDetails'
import CreateTaskForm from './CreateTaskForm'
import PersonIcon from '@mui/icons-material/Person'
import Avatar from 'react-avatar'
import { useTheme } from '@mui/material/styles'

const COLORS = ['#ca5555', '#0f5b90', '#b79c5b', '#28922d']

interface UserCardProps {
  user: UserType
  onTaskCreated: (task: TaskType) => void
  departmentId: number
  managerId: number
  onUserClick: (user: UserType) => void
  departmentName: string
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onTaskCreated,
  departmentId,
  managerId,
  onUserClick,
  departmentName
}) => {
  const [open, setOpen] = useState(false)
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [taskStats, setTaskStats] = useState({ pending: 0, inProgress: 0, completed: 0, approved: 0 })
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null)
  const [openTaskDialog, setOpenTaskDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const theme = useTheme()

  const fetchTasks = async () => {
    try {
      const fetchedTasks = await getTasksByUserId(user.ID)
      setTasks(fetchedTasks)
      setTaskStats({
        pending: fetchedTasks.filter(task => task.status === 'Pending').length,
        inProgress: fetchedTasks.filter(task => task.status === 'In Progress').length,
        completed: fetchedTasks.filter(task => task.status === 'Completed').length,
        approved: fetchedTasks.filter(task => task.status === 'Approved').length
      })
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch tasks', error)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [user.ID])

  const handleClickOpen = () => {
    onUserClick(user)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedTask(null)
  }

  const handleTaskClick = (task: TaskType) => {
    setSelectedTask(task)
    setOpenTaskDialog(true)
  }

  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false)
    setSelectedTask(null)
  }

  const handleTaskUpdated = (updatedTask: TaskType) => {
    setTasks(tasks.map(task => (task.ID === updatedTask.ID ? updatedTask : task)))
    fetchTasks() // Ensure the task list is updated
  }

  const handleTaskCreated = (createdTask: TaskType) => {
    onTaskCreated(createdTask)
    setTasks([...tasks, createdTask])
    setTaskStats(prevStats => ({
      ...prevStats,
      [createdTask.status.toLowerCase()]: prevStats[createdTask.status.toLowerCase()] + 1
    }))
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId)
      setTasks(tasks.filter(task => task.ID !== taskId))
    } catch (error) {
      console.error('Failed to delete task', error)
    }
  }

  const taskData = [
    { name: 'Pending', value: taskStats.pending },
    { name: 'In Progress', value: taskStats.inProgress },
    { name: 'Completed', value: taskStats.completed },
    { name: 'Approved', value: taskStats.approved }
  ]

  return (
    <Card
      sx={{
        margin: '10px',
        padding: '20px',
        position: 'relative',
        width: '100%',
        maxWidth: { xs: '100%', sm: '500px' },
        minHeight: '350px',
        transition: 'transform 0.3s, box-shadow 0.3s',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.4)'
        }
      }}
    >
      <CardContent>
        <Grid container spacing={2} alignItems='center'>
          <Grid item>
            {user.picture ? (
              <Avatar src={user.picture} alt={`${user.firstName} ${user.lastName}`} round size='80' />
            ) : (
              <Avatar name={`${user.firstName} ${user.lastName}`} round size='80' color={theme.palette.primary.main} />
            )}
          </Grid>
          <Grid item xs>
            <Typography variant='h5' align='center' sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Grid container spacing={1} justifyContent='center' alignItems='center'>
              <Grid item>
                <EmailIcon sx={{ color: theme.palette.primary.main }} />
              </Grid>
              <Grid item>
                <Typography color='textSecondary' align='center'>
                  {user.email}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={1} justifyContent='center' alignItems='center'>
              <Grid item>
                <BusinessIcon sx={{ color: theme.palette.primary.main }} />
              </Grid>
              <Grid item>
                <Typography color='textSecondary' align='center'>
                  Department: {departmentName}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          {!loading && tasks.length > 0 && (
            <Grid item>
              <IconButton onClick={handleClickOpen} sx={{ position: 'absolute', top: 10, right: 10 }}>
                <AssignmentIcon sx={{ color: theme.palette.primary.main }} />
              </IconButton>
            </Grid>
          )}
        </Grid>
        <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
          {loading ? (
            <CircularProgress />
          ) : tasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
              <Typography variant='subtitle1' color='textSecondary'>
                No tasks assigned
              </Typography>
              <CreateTaskForm
                assigneeId={user.ID}
                departmentId={departmentId}
                managerId={managerId}
                onTaskCreated={handleTaskCreated}
              />
            </Box>
          ) : (
            <>
              <Grid container spacing={2} justifyContent='center' alignItems='center'>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle1' align='center'>
                    Task Distribution
                  </Typography>
                  <PieChart width={150} height={150}>
                    <Pie
                      data={taskData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      outerRadius={60}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {taskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle1' align='center'>
                    Task Status
                  </Typography>
                  <BarChart width={150} height={150} data={taskData}>
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='value' fill='#8884d8'>
                      {taskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </Grid>
              </Grid>
              <Grid container spacing={1} justifyContent='center' alignItems='center' sx={{ marginTop: '20px' }}>
                <Grid item>
                  <Typography sx={{ color: '#ca5555' }}>Pending</Typography>
                </Grid>
                <Grid item>
                  <Typography sx={{ color: '#0f5b90' }}>In Progress</Typography>
                </Grid>
                <Grid item>
                  <Typography sx={{ color: '#b79c5b' }}>Completed</Typography>
                </Grid>
                <Grid item>
                  <Typography sx={{ color: '#28922d' }}>Approved</Typography>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </CardContent>
      <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
        <DialogTitle sx={{ textAlign: 'center', borderBottom: '1px solid #CCCCCC', paddingBottom: '10px' }}>
          <PersonIcon sx={{ fontSize: '2.5rem', verticalAlign: 'middle', marginRight: '10px' }} />
          {`${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}`}
        </DialogTitle>
        <DialogContent>
          <TaskList
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onTaskCreated={handleTaskCreated}
            assigneeId={user.ID}
            departmentId={departmentId}
            managerId={managerId}
            fetchTasks={fetchTasks}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {selectedTask && (
        <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog} maxWidth='md' fullWidth>
          <DialogContent>
            <TaskDetails
              task={selectedTask}
              onTaskDeleted={handleCloseTaskDialog}
              onTaskUpdated={handleTaskUpdated}
              fetchTasks={fetchTasks}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTaskDialog} color='primary'>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Card>
  )
}

export default UserCard
