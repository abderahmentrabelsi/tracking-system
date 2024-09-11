'use client'
import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  FormControlLabel,
  IconButton,
  Tooltip,
  Switch,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Badge
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import GeneralIcon from '@mui/icons-material/Category'
import ProjectIcon from '@mui/icons-material/Work'
import MeetingIcon from '@mui/icons-material/MeetingRoom'
import CloseIcon from '@mui/icons-material/Close'
import MuiAlert from '@mui/material/Alert'
import Cookies from 'js-cookie'
import { getCalendarByDepartmentId, createCalendar, createEvent, updateEvent, deleteEvent } from '@/app/api/CalendarApi'
import { getDepartmentById } from '@/app/api/departmentApi'
import EventDialog from './EventDialog'
import EventDetails from './EventDetails'
import EventList from './EventList'

const CalendarPage = () => {
  const [departmentId, setDepartmentId] = useState<number | null>(null)
  const [departmentName, setDepartmentName] = useState<string>('')
  const [clientName, setClientName] = useState<string>('')
  const [calendar, setCalendar] = useState<any>(null)
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [open, setOpen] = useState(false)
  const [eventTypeFilter, setEventTypeFilter] = useState('All')
  const [eventPriorityFilter, setEventPriorityFilter] = useState('All')
  const [allowModify, setAllowModify] = useState(true)
  const [allowCreate, setAllowCreate] = useState(true)
  const [eventDetailOpen, setEventDetailOpen] = useState(false)
  const [selectedEventDetail, setSelectedEventDetail] = useState<any>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')
  const [eventData, setEventData] = useState({
    start_dt: '',
    end_dt: '',
    all_day: false,
    title: '',
    who: '',
    location: '',
    notes: '',
    is_remote: false,
    attendance: 'Optional', // Default value
    calendar_id: 0,
    version: '',
    department_id: 0,
    type: 'General',
    priority: 'Low'
  })
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  const getTokenData = () => {
    const token = Cookies.get('access_token')
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]))
      return decodedToken
    }
    return null
  }

  useEffect(() => {
    const tokenData = getTokenData()
    if (tokenData && tokenData.DepartmentID) {
      setDepartmentId(tokenData.DepartmentID)
    }
  }, [])

  useEffect(() => {
    if (departmentId) {
      fetchDepartmentDetails(departmentId)
      fetchCalendar(departmentId)
    }
  }, [departmentId])

  const fetchDepartmentDetails = async (id: number) => {
    try {
      const department = await getDepartmentById(id)
      setDepartmentName(department.name)
      const parentDepartment = await getDepartmentById(department.parentDepartmentId)
      setClientName(parentDepartment.name)
    } catch (error) {
      console.error('Failed to fetch department details:', error)
    }
  }

  const fetchCalendar = async (deptId: number) => {
    try {
      const response = await getCalendarByDepartmentId(deptId)
      const calendarData = response.data.data

      if (calendarData) {
        setCalendar(calendarData)
        const eventList = mapEvents(calendarData.events)
        setEvents(eventList)
        setFilteredEvents(eventList)
      } else {
        await handleNoCalendar(deptId)
      }
    } catch (error) {
      console.error('Failed to fetch calendar:', error)
      if (error.response && error.response.data && error.response.data.message === 'Calendar not found') {
        await handleNoCalendar(deptId)
      }
    }
  }

  const handleNoCalendar = async (deptId: number) => {
    const tokenData = getTokenData()
    const userRole = tokenData?.Role
    const userId = tokenData?.ID

    if (userRole === 'Admin' || userRole === 'Manager') {
      const newCalendar = {
        location: 'Default Location',
        name: `Department ${deptId} Calendar`,
        active: true,
        color: 0,
        overlap: false,
        attributes: '{}',
        image_url: 'http://example.com/image.png',
        department_id: deptId,
        created_by_id: userId
      }

      try {
        const createResponse = await createCalendar(newCalendar)
        const createdCalendar = createResponse.data.data
        setCalendar(createdCalendar)
        const eventList = mapEvents(createdCalendar.events)
        setEvents(eventList)
        setFilteredEvents(eventList)
      } catch (createError) {
        console.error('Failed to create calendar:', createError)
      }
    } else {
      setCalendar(null)
    }
  }

  const mapEvents = (events: any[]) => {
    return events.map((event: any) => ({
      id: event.ID,
      title: event.title,
      start: event.start_dt,
      end: event.end_dt,
      allDay: event.all_day,
      color: getEventColor(event.priority),
      extendedProps: {
        who: event.who,
        location: event.location,
        notes: event.notes,
        is_remote: event.is_remote,
        attendance: event.attendance,
        calendar_id: event.calendar_id,
        version: event.version,
        department_id: event.department_id,
        type: event.type,
        priority: event.priority
      }
    }))
  }

  const getEventColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return '#f44336'
      case 'Medium':
        return '#ff9800'
      case 'Low':
        return '#4caf50'
      default:
        return '#2196f3'
    }
  }

  const handleEventClick = (info: any) => {
    if (allowModify) {
      const event = info.event
      setSelectedEvent(event)
      setEventData({
        start_dt: event.startStr || '',
        end_dt: event.allDay ? event.startStr : event.endStr || '',
        all_day: event.allDay || false,
        title: event.title || '',
        who: event.extendedProps.who || '',
        location: event.extendedProps.location || '',
        notes: event.extendedProps.notes || '',
        is_remote: event.extendedProps.is_remote || false,
        attendance: event.extendedProps.attendance || 'Optional',
        calendar_id: event.extendedProps.calendar_id || 0,
        version: event.extendedProps.version || '',
        department_id: departmentId || 0,
        type: event.extendedProps.type || 'General',
        priority: event.extendedProps.priority || 'Low'
      })
      setOpen(true)
    }
  }

  const handleDateSelect = (selectInfo: any) => {
    if (calendar && allowCreate) {
      setEventData({
        start_dt: selectInfo.startStr,
        end_dt: selectInfo.allDay ? selectInfo.startStr : selectInfo.endStr,
        all_day: selectInfo.allDay,
        title: '',
        who: '',
        location: '',
        notes: '',
        is_remote: false,
        attendance: 'Optional', // Default value
        calendar_id: calendar.ID,
        version: '',
        department_id: departmentId || 0,
        type: 'General',
        priority: 'Low'
      })
      setSelectedEvent(null)
      setOpen(true)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setEventData({
      start_dt: '',
      end_dt: '',
      all_day: false,
      title: '',
      who: '',
      location: '',
      notes: '',
      is_remote: false,
      attendance: 'Optional', // Default value
      calendar_id: 0,
      version: '',
      department_id: departmentId || 0,
      type: 'General',
      priority: 'Low'
    })
  }

  const handleSave = async () => {
    try {
      const formatDateTime = (datetime: string) => {
        const date = new Date(datetime)
        return date.toISOString()
      }

      const eventPayload = {
        ...eventData,
        start_dt: eventData.start_dt ? formatDateTime(eventData.start_dt) : null,
        end_dt: eventData.end_dt ? formatDateTime(eventData.end_dt) : null
      }

      if (selectedEvent) {
        await updateEvent(eventData.calendar_id, selectedEvent.id, eventPayload)
        setSnackbarMessage('Event updated successfully')
        setSnackbarSeverity('success')
      } else {
        await createEvent(calendar.ID, eventPayload)
        setSnackbarMessage('Event created successfully')
        setSnackbarSeverity('success')
      }
      fetchCalendar(departmentId || 0)
      handleClose()
    } catch (error) {
      console.error('Failed to save event:', error.response ? error.response.data : error.message)
      setSnackbarMessage(`Failed to save event: ${error.response ? error.response.data.message : error.message}`)
      setSnackbarSeverity('error')
    } finally {
      setSnackbarOpen(true)
    }
  }

  const handleDelete = async () => {
    try {
      if (selectedEvent) {
        await deleteEvent(eventData.calendar_id, selectedEvent.id)
        fetchCalendar(departmentId || 0)
        setSnackbarMessage('Event deleted successfully')
        setSnackbarSeverity('success')
        handleClose()
      }
    } catch (error) {
      console.error('Failed to delete event:', error.response ? error.response.data : error.message)
      setSnackbarMessage(`Failed to delete event: ${error.response ? error.response.data.message : error.message}`)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const handleFilterChange = (event: React.ChangeEvent<{ value: unknown }>, type: string) => {
    if (type === 'priority') {
      setEventPriorityFilter(event.target.value as string)
    } else {
      setEventTypeFilter(event.target.value as string)
    }
  }

  useEffect(() => {
    const filtered = events.filter((event: any) => {
      const matchesType = eventTypeFilter === 'All' || event.extendedProps.type === eventTypeFilter
      const matchesPriority = eventPriorityFilter === 'All' || event.extendedProps.priority === eventPriorityFilter
      return matchesType && matchesPriority
    })
    setFilteredEvents(filtered)
  }, [eventTypeFilter, eventPriorityFilter, events])

  const handleEventDetailClick = (event: any) => {
    setSelectedEventDetail(event)
    setEventDetailOpen(true)
  }

  const handleEventDetailClose = () => {
    setEventDetailOpen(false)
    setSelectedEventDetail(null)
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant='dot' color='error' />
      case 'Medium':
        return <Badge variant='dot' color='warning' />
      case 'Low':
        return <Badge variant='dot' color='success' />
      default:
        return null
    }
  }

  if (departmentId === null) {
    return <div>Loading...</div>
  }

  if (!calendar && getTokenData()?.Role === 'Employee') {
    return (
      <div>
        No calendar available for your current department {departmentName} for client {clientName}
      </div>
    )
  }

  return (
    <Box display='flex' flexDirection='column' p={2}>
      <Box display='flex' justifyContent='center' mb={2}>
        <Typography variant='h4'>
          Department {departmentName} - {clientName} Calendar
        </Typography>
      </Box>
      <Box display='flex' justifyContent='space-between' mb={2}>
        <Box display='flex' alignItems='center'>
          <FormControlLabel
            control={<Switch checked={allowModify} onChange={() => setAllowModify(!allowModify)} />}
            label='Allow Modify'
          />
          <FormControlLabel
            control={<Switch checked={allowCreate} onChange={() => setAllowCreate(!allowCreate)} />}
            label='Allow Create'
          />
        </Box>
      </Box>
      <Box display='flex' flexDirection='row' mb={2}>
        <Box flexBasis='70%' mr={2}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView='dayGridMonth'
            selectable={allowCreate}
            editable={allowModify}
            events={filteredEvents}
            eventClick={handleEventClick}
            select={handleDateSelect}
            height='auto'
            contentHeight={500}
            dayHeaderClassNames='day-header'
          />
        </Box>
        <Box flexBasis='30%'>
          <Box display='flex' justifyContent='space-between' alignItems='center'>
            <Typography variant='h6'>Event Filters</Typography>
            <Tooltip title='Reset Filters'>
              <IconButton
                onClick={() => {
                  setEventTypeFilter('All')
                  setEventPriorityFilter('All')
                }}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box display='flex' alignItems='center' flexWrap='wrap'>
            <FormControl fullWidth margin='normal' variant='outlined' style={{ marginRight: '10px' }}>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={eventTypeFilter}
                onChange={e => handleFilterChange(e as React.ChangeEvent<{ value: unknown }>, 'type')}
                label='Event Type'
                renderValue={selected => (
                  <Box display='flex' gap={1}>
                    {selected === 'General' && <GeneralIcon />}
                    {selected === 'Project' && <ProjectIcon />}
                    {selected === 'Meeting' && <MeetingIcon />}
                    {selected}
                  </Box>
                )}
              >
                <MenuItem value='All'>All</MenuItem>
                <MenuItem value='General'>
                  <Box display='flex' alignItems='center' gap={1}>
                    <GeneralIcon />
                    General
                  </Box>
                </MenuItem>
                <MenuItem value='Project'>
                  <Box display='flex' alignItems='center' gap={1}>
                    <ProjectIcon />
                    Project
                  </Box>
                </MenuItem>
                <MenuItem value='Meeting'>
                  <Box display='flex' alignItems='center' gap={1}>
                    <MeetingIcon />
                    Meeting
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin='normal' variant='outlined'>
              <InputLabel>Priority</InputLabel>
              <Select
                value={eventPriorityFilter}
                onChange={e => handleFilterChange(e as React.ChangeEvent<{ value: unknown }>, 'priority')}
                label='Priority'
                renderValue={selected => (
                  <Box display='flex' gap={1}>
                    {getPriorityIcon(selected as string)}
                    {selected}
                  </Box>
                )}
              >
                <MenuItem value='All'>All</MenuItem>
                <MenuItem value='Low'>
                  <Box display='flex' alignItems='center' gap={1}>
                    <Badge variant='dot' color='success' />
                    Low
                  </Box>
                </MenuItem>
                <MenuItem value='Medium'>
                  <Box display='flex' alignItems='center' gap={1}>
                    <Badge variant='dot' color='warning' />
                    Medium
                  </Box>
                </MenuItem>
                <MenuItem value='High'>
                  <Box display='flex' alignItems='center' gap={1}>
                    <Badge variant='dot' color='error' />
                    High
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Typography variant='h6' gutterBottom></Typography>
          <EventList
            events={filteredEvents}
            handleEventDetailClick={handleEventDetailClick}
            getEventColor={getEventColor}
          />
        </Box>
      </Box>
      <EventDialog
        open={open}
        onClose={handleClose}
        onSave={handleSave}
        onDelete={handleDelete}
        eventData={eventData}
        setEventData={setEventData}
        selectedEvent={selectedEvent}
      />
      <Dialog open={eventDetailOpen} onClose={handleEventDetailClose} maxWidth='md' fullWidth>
        <DialogTitle>
          Event Details
          <IconButton
            aria-label='close'
            onClick={handleEventDetailClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme => theme.palette.grey[500]
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>{selectedEventDetail && <EventDetails event={selectedEventDetail} />}</DialogContent>
        <DialogActions>
          <Button onClick={handleEventDetailClose} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <MuiAlert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
      <style jsx global>{`
        .day-header {
          background-color: #f5f5f5;
          color: #000;
        }
      `}</style>
    </Box>
  )
}

export default CalendarPage
