import React, { useEffect, useState } from 'react'
import { getTimesheet } from '@/app/api/timesheetApi'
import { Box, Typography, Paper, CircularProgress, Dialog, DialogTitle, DialogContent } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

const CalendarContainer = styled(Box)(({ theme }) => ({
  height: '70vh', // Adjust height as needed
  padding: '20px',
  backgroundColor: theme.palette.background.default
}))

const Event = styled(Paper)(({ theme, status }) => ({
  padding: '5px',
  backgroundColor:
    status === 'Present'
      ? theme.palette.success.light
      : status === 'Half Day'
        ? theme.palette.warning.light
        : theme.palette.error.light,
  color: theme.palette.getContrastText(
    status === 'Present'
      ? theme.palette.success.light
      : status === 'Half Day'
        ? theme.palette.warning.light
        : theme.palette.error.light
  ),
  borderRadius: '5px',
  textAlign: 'center'
}))

const CalendarView = ({ open, onClose, userID }) => {
  const [timesheet, setTimesheet] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        const data = await getTimesheet(userID)
        const workdayTimesheet = data.filter(entry => entry.workType === 'Workday')
        setTimesheet(workdayTimesheet)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch timesheet data', error)
        setLoading(false)
      }
    }

    fetchTimesheet()
  }, [userID])

  const events = timesheet.map(entry => {
    const start = new Date(entry.checkin * 1000)
    const end = new Date(entry.checkout * 1000)
    const duration = entry.duration
    const status = duration >= 8 ? 'Present' : duration >= 4 ? 'Half Day' : 'Absent'

    return {
      title: `Check-in: ${start.toLocaleTimeString()} - Check-out: ${end.toLocaleTimeString()} - Duration: ${duration.toFixed(2)} hrs`,
      start,
      end,
      status,
      allDay: true
    }
  })

  return (
    <Dialog maxWidth='lg' open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        <Typography variant='h4'>Attendance Calendar</Typography>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <CalendarContainer>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor='start'
              endAccessor='end'
              style={{ height: '100%' }}
              components={{
                event: ({ event }) => (
                  <Event status={event.status}>
                    <Typography variant='body2'>{event.title}</Typography>
                  </Event>
                )
              }}
            />
          </CalendarContainer>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CalendarView
