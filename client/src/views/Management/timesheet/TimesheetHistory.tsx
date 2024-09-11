'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider
} from '@mui/material'
import { getTimesheet } from '@/app/api/timesheetApi'
import {
  BusinessCenter,
  WatchLater,
  MeetingRoom,
  School,
  LocalCafe,
  Assignment,
  Build,
  DirectionsCar,
  Call,
  Science,
  AccessTime,
  DeveloperMode,
  ArrowBackIos,
  ArrowForwardIos,
  CalendarToday,
  LocationOn,
  NotificationsActive
} from '@mui/icons-material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import EditRequestForm from './EditRequestForm'
import CalendarView from './CalendarView'
import { useTheme } from '@mui/material/styles'

interface TimesheetHistoryProps {
  userId: number
  userFullName: string
  open: boolean
  onClose: () => void
}

interface WorkHours {
  ID: number
  userId: number
  taskId?: number | null
  checkin: number
  checkout?: number | null
  duration: number
  workType: string
  location: string
  comments: string
  approved: boolean
  requestedEdit: boolean
  editRequestMsg: string
  requestCheckin?: number
  requestCheckout?: number
  RequestDuration: number
  managerComment: string
}

const workTypeIcons = {
  Workday: <BusinessCenter style={{ marginRight: 8, color: 'primary' }} />,
  Overtime: <WatchLater style={{ marginRight: 8, color: 'primary' }} />,
  Meeting: <MeetingRoom style={{ marginRight: 8, color: 'primary' }} />,
  Task: <Assignment style={{ marginRight: 8, color: 'primary' }} />,
  Training: <School style={{ marginRight: 8, color: 'primary' }} />,
  Break: <LocalCafe style={{ marginRight: 8, color: 'primary' }} />,
  Administrative: <Assignment style={{ marginRight: 8, color: 'primary' }} />,
  'Client Work': <Build style={{ marginRight: 8, color: 'primary' }} />,
  Travel: <DirectionsCar style={{ marginRight: 8, color: 'primary' }} />,
  'On Call': <Call style={{ marginRight: 8, color: 'primary' }} />,
  Research: <Science style={{ marginRight: 8, color: 'primary' }} />,
  Support: <AccessTime style={{ marginRight: 8, color: 'primary' }} />,
  Development: <DeveloperMode style={{ marginRight: 8, color: 'primary' }} />
}

const workTypeArray = Object.keys(workTypeIcons)

const TimesheetHistory: React.FC<TimesheetHistoryProps> = ({ userId, open, onClose, userFullName }) => {
  const [loading, setLoading] = useState(true)
  const theme = useTheme()
  const [timesheetData, setTimesheetData] = useState<WorkHours[]>([])
  const [selectedTab, setSelectedTab] = useState<string>('Workday')
  const [visibleWorkTypes, setVisibleWorkTypes] = useState<string[]>(workTypeArray.slice(0, 5))
  const [filters, setFilters] = useState({
    status: 'All',
    durationRange: [0, 24],
    date: `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
    location: 'All'
  })
  const [editRequestOpen, setEditRequestOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedWorkHours, setSelectedWorkHours] = useState<WorkHours | null>(null)

  useEffect(() => {
    if (open) {
      const fetchTimesheet = async () => {
        setLoading(true)
        try {
          const data: WorkHours[] = await getTimesheet(userId)
          setTimesheetData(data)
        } catch (error) {
          console.error('Failed to fetch timesheet data', error)
        } finally {
          setLoading(false)
        }
      }

      fetchTimesheet()
    }
  }, [userId, open])

  const handleTabChange = workType => {
    setSelectedTab(workType)
  }

  const handleScrollLeft = () => {
    const currentIndex = workTypeArray.indexOf(visibleWorkTypes[0])
    if (currentIndex > 0) {
      setVisibleWorkTypes(workTypeArray.slice(currentIndex - 1, currentIndex + 4))
    }
  }

  const handleScrollRight = () => {
    const currentIndex = workTypeArray.indexOf(visibleWorkTypes[visibleWorkTypes.length - 1])
    if (currentIndex < workTypeArray.length - 1) {
      setVisibleWorkTypes(workTypeArray.slice(currentIndex - 3, currentIndex + 2))
    }
  }

  const getStatusIcon = duration => {
    if (duration >= 8) {
      return <CheckCircleIcon style={{ color: 'green' }} />
    } else if (duration > 4 && duration < 8) {
      return <HourglassEmptyIcon style={{ color: 'orange' }} />
    } else {
      return <CancelIcon style={{ color: 'red' }} />
    }
  }

  const handleFilterChange = event => {
    const { name, value } = event.target
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }))
  }

  const handleDurationRangeChange = (event, newValue) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      durationRange: newValue
    }))
  }

  const handleEditRequestClick = (workHours: WorkHours) => {
    setSelectedWorkHours(workHours)
    setEditRequestOpen(true)
  }

  const handleEditRequestClose = () => {
    setEditRequestOpen(false)
  }

  const handleCalendarClick = () => {
    setCalendarOpen(true)
  }

  const handleCalendarClose = () => {
    setCalendarOpen(false)
  }

  const renderContent = () => {
    const filteredData = timesheetData
      .filter(entry => entry.workType === selectedTab)
      .filter(entry => {
        const { durationRange, date, location, status } = filters
        const entryDate = new Date(entry.checkin * 1000)
        const entryMonthYear = `${entryDate.getFullYear()}-${(entryDate.getMonth() + 1).toString().padStart(2, '0')}`
        return (
          entry.duration >= durationRange[0] &&
          entry.duration <= durationRange[1] &&
          (date === '' || entryMonthYear === date) &&
          (location === 'All' || entry.location === location) &&
          (status === 'All' ||
            (status === 'Present' && entry.duration >= 8) ||
            (status === 'Half Day' && entry.duration > 4 && entry.duration < 8) ||
            (status === 'Absent' && entry.duration <= 4))
        )
      })

    return (
      <Box display='flex' flexWrap='wrap' justifyContent='center' mt={3}>
        {filteredData.map((entry, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: 5,
              margin: 2,
              width: 350,
              border: '1px solid #primary',
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0.2,1.0)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0 4px 8px rgba(0,0,0,1)'
              }
            }}
          >
            <Box display='flex' alignItems='center' mb={1}>
              {React.cloneElement(workTypeIcons[entry.workType], { style: { color: theme.palette.primary.main } })}
              <Typography variant='body1' color='textPrimary'>
                {` ${new Date(entry.checkin * 1000).toLocaleString()} (${new Date(entry.checkin * 1000).toLocaleDateString('en-US', { weekday: 'long' })})`}
              </Typography>
              {entry.requestedEdit && (
                <IconButton onClick={() => handleEditRequestClick(entry)}>
                  <NotificationsActive style={{ color: '#100f10', position: 'absolute', left: 40 }} />
                </IconButton>
              )}
            </Box>
            <Box display='flex' alignItems='center' mb={1}>
              <AccessTime style={{ marginRight: 8, color: theme.palette.primary.main }} />
              <Typography variant='body2' color='textSecondary'>
                Duration: {entry.duration.toFixed(2)} hours
              </Typography>
            </Box>
            <Box display='flex' alignItems='center' mb={1}>
              <LocationOn style={{ marginRight: 8, color: theme.palette.primary.main }} />
              <Typography variant='body2' color='textSecondary'>
                Location: {entry.location}
              </Typography>
            </Box>
            {entry.workType === 'Workday' && (
              <Box display='flex' alignItems='center'>
                {getStatusIcon(entry.duration)}
                <Typography variant='body2' color='textSecondary' ml={1}>
                  {entry.duration >= 8 ? 'Present' : entry.duration > 4 && entry.duration < 8 ? 'Half Day' : 'Absent'}
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    )
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
        <DialogTitle>
          <Box
            display='flex'
            justifyContent='center'
            alignItems='center'
            position='relative'
            borderRadius='8px'
            p={2}
            boxShadow='0 4px 8px rgba(0, 0, 0.2, 0.9)'
            style={{ border: `2px solid #000` }}
          >
            <Typography
              variant='h4'
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 700,
                color: theme.palette.primary.main,
                textShadow: '1px 1px 2px black',
                textAlign: 'center',
                animation: 'fadeIn 1s'
              }}
            >
              WORK HOURS SUMMARY: {userFullName.toUpperCase()}
            </Typography>
            <IconButton
              onClick={handleCalendarClick}
              style={{
                position: 'absolute',
                right: 0,
                transition: 'transform 0.3s ease',
                color: theme.palette.primary.main
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <CalendarToday />
            </IconButton>
          </Box>

          <style jsx global>{`
            @keyframes fadeIn {
              0% {
                opacity: 0;
              }
              100% {
                opacity: 1;
              }
            }
          `}</style>
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
              <CircularProgress color='primary' />
            </Box>
          ) : (
            <Box>
              <Box display='flex' alignItems='center' mb={4}>
                <IconButton onClick={handleScrollLeft} disabled={workTypeArray.indexOf(visibleWorkTypes[0]) === 0}>
                  <ArrowBackIos color='primary' />
                </IconButton>
                <Box style={{ display: 'flex', flexGrow: 1, justifyContent: 'center' }}>
                  {visibleWorkTypes.map(workType => (
                    <Button
                      key={workType}
                      onClick={() => handleTabChange(workType)}
                      style={{
                        minWidth: '150px',
                        textAlign: 'center',
                        margin: '0 10px',
                        color: selectedTab === workType ? 'Primary' : 'Primary',
                        backgroundColor: selectedTab === workType ? '#000' : 'inherit',
                        transition: 'all 0.3s'
                      }}
                    >
                      {workTypeIcons[workType]}
                      <Typography variant='caption' display='block'>
                        {workType}
                      </Typography>
                    </Button>
                  ))}
                </Box>
                <IconButton
                  onClick={handleScrollRight}
                  disabled={
                    workTypeArray.indexOf(visibleWorkTypes[visibleWorkTypes.length - 1]) === workTypeArray.length - 1
                  }
                >
                  <ArrowForwardIos color='primary' />
                </IconButton>
              </Box>
              <Box
                display='flex'
                justifyContent='center'
                alignItems='center'
                mb={2}
                borderBottom='1px solid #ccc'
                pb={2}
              >
                <FormControl variant='outlined' sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel>Month</InputLabel>
                  <Select value={filters.date} onChange={handleFilterChange} label='Month' name='date'>
                    {Array.from({ length: 12 }, (_, index) => (
                      <MenuItem
                        key={index}
                        value={`${new Date().getFullYear()}-${(index + 1).toString().padStart(2, '0')}`}
                      >
                        {new Date(0, index).toLocaleString('default', { month: 'long' })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedTab === 'Workday' && (
                  <FormControl variant='outlined' sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={filters.status} onChange={handleFilterChange} label='Status' name='status'>
                      <MenuItem value='All'>All</MenuItem>
                      <MenuItem value='Present'>Present</MenuItem>
                      <MenuItem value='Half Day'>Half Day</MenuItem>
                      <MenuItem value='Absent'>Absent</MenuItem>
                    </Select>
                  </FormControl>
                )}
                <FormControl variant='outlined' sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel>Location</InputLabel>
                  <Select value={filters.location} onChange={handleFilterChange} label='Location' name='location'>
                    <MenuItem value='All'>All</MenuItem>
                    <MenuItem value='Office'>Office</MenuItem>
                    <MenuItem value='QORE ENTREPRISES, TUNIS, TUNISIA'>QORE ENTREPRISES, TUNIS, TUNISIA</MenuItem>
                    <MenuItem value='Remote'>Remote</MenuItem>
                  </Select>
                </FormControl>
                <Box ml={3} display='flex' alignItems='center'>
                  <Typography variant='body2' color='textSecondary' mr={5}>
                    Duration Range (hours)
                  </Typography>
                  <Slider
                    value={filters.durationRange}
                    onChange={handleDurationRangeChange}
                    valueLabelDisplay='auto'
                    min={0}
                    max={24}
                    style={{ width: 150 }}
                  />
                </Box>
              </Box>
              <Box mt={2}>{renderContent()}</Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <EditRequestForm
        open={editRequestOpen}
        onClose={handleEditRequestClose}
        workHours={selectedWorkHours} // Pass the selected workHours
      />
      <CalendarView open={calendarOpen} onClose={handleCalendarClose} userId={userId} />
    </>
  )
}

export default TimesheetHistory
