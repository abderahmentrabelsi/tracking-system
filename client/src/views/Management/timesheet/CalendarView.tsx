import React, { useEffect, useState } from 'react'
import { getTimesheet } from '@/app/api/timesheetApi'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Chip,
  IconButton
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import CloseIcon from '@mui/icons-material/Close'

const localizer = momentLocalizer(moment)

const CalendarContainer = styled(Box)(({ theme }) => ({
  height: '70vh', // Adjust height as needed
  padding: '20px',
  backgroundColor: theme.palette.background.default
}))

const Event = styled(Paper)(({ theme, workType }) => {
  const workTypeColors = {
    Workday: 'rgba(10,147,237,0.9)', // Soft Blue
    Overtime: 'rgba(246,32,10,0.9)', // Soft Red
    Meeting: 'rgba(2,42,69,0.9)', // Moderate Blue
    Training: 'rgba(230,188,18,0.9)', // Soft Yellow
    Break: 'rgba(142, 68, 173, 0.9)', // Rich Purple
    Administrative: 'rgba(230, 126, 34, 0.9)', // Carrot Orange
    Task: 'rgba(7,183,81,0.9)', // Emerald Green
    'Client Work': 'rgba(172,66,55,0.9)', // Pomegranate Red
    Travel: 'rgba(26, 188, 156, 0.9)', // Soft Teal
    'On Call': 'rgba(83,115,146,0.9)', // Wet Asphalt
    Research: 'rgba(64,76,88,0.9)', // Dark Blue
    Support: 'rgba(149, 165, 166, 0.9)', // Concrete Grey
    Development: 'rgba(32,33,33,0.9)' // Asbestos Grey
  }

  return {
    padding: '5px',
    backgroundColor: workTypeColors[workType] || theme.palette.grey[500],
    color: theme.palette.getContrastText(workTypeColors[workType] || theme.palette.grey[500]),
    borderRadius: '5px',
    textAlign: 'center'
  }
})

const workTypes = [
  { type: 'All', color: 'primary' },
  { type: 'Workday', color: 'rgba(10,147,237,0.9)' }, // Soft Blue
  { type: 'Overtime', color: 'rgba(246,32,10,0.9)' }, // Soft Red
  { type: 'Meeting', color: 'rgba(2,42,69,0.9)' }, // Moderate Blue
  { type: 'Training', color: 'rgba(230,188,18,0.9)' }, // Soft Yellow
  { type: 'Break', color: 'rgba(142, 68, 173, 0.9)' }, // Rich Purple
  { type: 'Administrative', color: 'rgba(230, 126, 34, 0.9)' }, // Carrot Orange
  { type: 'Task', color: 'rgba(7,183,81,0.9)' }, // Emerald Green
  { type: 'Client Work', color: 'rgba(172,66,55,0.9)' }, // Pomegranate Red
  { type: 'Travel', color: 'rgba(26, 188, 156, 0.9)' }, // Soft Teal
  { type: 'On Call', color: 'rgba(83,115,146,0.9)' }, // Wet Asphalt
  { type: 'Research', color: 'rgba(64,76,88,0.9)' }, // Dark Blue
  { type: 'Support', color: 'rgba(149, 165, 166, 0.9)' }, // Concrete Grey
  { type: 'Development', color: 'rgba(32,33,33,0.9)' } // Asbestos Grey
]

const CalendarView = ({ open, onClose, userId }) => {
  const [timesheet, setTimesheet] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedWorkType, setSelectedWorkType] = useState('All')

  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        const data = await getTimesheet(userId)
        setTimesheet(data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch timesheet data', error)
        setLoading(false)
      }
    }

    fetchTimesheet()
  }, [userId])

  const handleWorkTypeChange = workType => {
    setSelectedWorkType(workType)
  }

  const events = timesheet
    .filter(entry => selectedWorkType === 'All' || entry.workType === selectedWorkType)
    .map(entry => {
      const start = new Date(entry.checkin * 1000)
      const end = new Date(entry.checkout * 1000)

      return {
        title: `${entry.workType} - Check-in: ${start.toLocaleTimeString()} - Check-out: ${end.toLocaleTimeString()} - Duration: ${entry.duration.toFixed(2)} hrs`,
        start,
        end,
        workType: entry.workType,
        allDay: true
      }
    })

  return (
    <Dialog maxWidth='lg' open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h4'>Attendance Calendar</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box display='flex' justifyContent='center' alignItems='center' mb={2} flexWrap='wrap'>
              {workTypes.map(workType => (
                <Chip
                  key={workType.type}
                  label={workType.type}
                  onClick={() => handleWorkTypeChange(workType.type)}
                  style={{
                    backgroundColor: selectedWorkType === workType.type ? '#0c0b0b' : workType.color,
                    color: selectedWorkType === workType.type ? '#fff' : '#000',
                    margin: '5px',
                    fontWeight: selectedWorkType === workType.type ? 'bold' : 'normal'
                  }}
                />
              ))}
            </Box>
            <CalendarContainer>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor='start'
                endAccessor='end'
                style={{ height: '100%' }}
                components={{
                  event: ({ event }) => (
                    <Event workType={event.workType}>
                      <Typography variant='body2'>{event.title}</Typography>
                    </Event>
                  )
                }}
              />
            </CalendarContainer>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CalendarView
