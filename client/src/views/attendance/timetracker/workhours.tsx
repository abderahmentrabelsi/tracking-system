'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { getTimesheet } from '@/app/api/timesheetApi'
import { Box, CircularProgress, Card, CardHeader, CardContent, Chip, MenuItem, Select, FormControl, InputLabel, useTheme } from '@mui/material'
import { Bar } from 'react-chartjs-2'
import 'chart.js/auto'
import { eachDayOfInterval, startOfWeek, endOfWeek, format, startOfMonth, endOfMonth, getWeeksInMonth, getWeek, getMonth, getDaysInMonth } from 'date-fns'

// Define work types and their colors
const workTypes = [
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
];

const WorkHoursChart = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [timesheet, setTimesheet] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [selectedWorkType, setSelectedWorkType] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedWeek, setSelectedWeek] = useState('currentWeek')
  const userId = typeof window !== 'undefined' ? Number(localStorage.getItem('userID')) : null

  // Fetch data
  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        const data = await getTimesheet(userId)
        if (data) {
          setTimesheet(data)
          setFilteredData(data)
        }
      } catch (error) {
        console.error('Failed to fetch timesheet:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchTimesheet()
    }
  }, [userId])

  // Filter data by work type
  const filterDataByWorkType = (workType) => {
    setSelectedWorkType(workType)
    if (workType) {
      const filtered = timesheet.filter((entry) => entry.workType === workType)
      setFilteredData(filtered)
    } else {
      setFilteredData(timesheet)
    }
  }

  // Get the dates for a specific month
  const getDatesForMonth = (month) => {
    return eachDayOfInterval({
      start: startOfMonth(new Date(new Date().getFullYear(), month)),
      end: endOfMonth(new Date(new Date().getFullYear(), month))
    }).map(date => format(date, 'yyyy-MM-dd'))
  }

  // Get the dates for a specific week of the selected month
  const getDatesForWeek = (weekNumber) => {
    const start = startOfMonth(new Date(new Date().getFullYear(), selectedMonth))
    const weekStart = startOfWeek(start, { weekStartsOn: 1 })
    return eachDayOfInterval({
      start: new Date(weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7)),
      end: endOfWeek(new Date(weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7)), { weekStartsOn: 1 })
    }).map(date => format(date, 'yyyy-MM-dd'))
  }

  // Handle month change
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value)
    setSelectedWeek('currentWeek')
  }

  // Handle week change
  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value)
  }

  // Get current week dates
  const currentWeek = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 })
  }).map(date => format(date, 'yyyy-MM-dd'))

  // Prepare date ranges
  const dateRanges = {
    currentWeek,
    currentMonth: getDatesForMonth(selectedMonth),
    week1: getDatesForWeek(1),
    week2: getDatesForWeek(2),
    week3: getDatesForWeek(3),
    week4: getDatesForWeek(4)
  }

  const chartData = dateRanges[selectedWeek === 'currentWeek' ? 'currentWeek' : selectedWeek].map(date => {
    const dateData = filteredData
      .filter(entry => format(new Date(entry.checkin * 1000), 'yyyy-MM-dd') === date)
    return {
      date,
      totalDuration: dateData.reduce((sum, entry) => sum + entry.duration, 0),
      workTypes: dateData
    }
  })

  const datasets = workTypes.map(workType => ({
    label: workType.type,
    backgroundColor: workType.color,
    borderColor: workType.color.replace('0.9', '1'),
    borderWidth: 1,
    hoverBackgroundColor: workType.color.replace('0.9', '0.7'),
    hoverBorderColor: workType.color.replace('0.9', '1'),
    data: chartData.map(data => data.workTypes
      .filter(entry => entry.workType === workType.type)
      .reduce((sum, entry) => sum + entry.duration, 0)),
  }))

  const data = {
    labels: dateRanges[selectedWeek === 'currentWeek' ? 'currentWeek' : selectedWeek],
    datasets: selectedWorkType
      ? [datasets.find(dataset => dataset.label === selectedWorkType)]
      : datasets,
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: theme.palette.mode === 'dark' ? '#fff' : '#000', // Dynamic color based on theme
        }
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw} hours`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)', // Dynamic grid color
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.2)', // Dynamic border color
          borderWidth: 1, // Increase border width
        },
        ticks: {
          color: theme.palette.mode === 'dark' ? '#fff' : '#000', // Dynamic color for x-axis labels
        }
      },
      y: {
        grid: {
          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)', // Dynamic grid color
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.2)', // Dynamic border color
          borderWidth: 1, // Increase border width
        },
        ticks: {
          color: theme.palette.mode === 'dark' ? '#fff' : '#000', // Dynamic color for y-axis labels
        }
      }
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Card>
      <CardHeader
        title={
          <Box
            sx={{
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              padding: '8px 16px',
              borderRadius: '8px',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.7), 0 -6px 16px rgba(255, 255, 255, 0.3)',
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              border: '1px solid rgba(255, 255, 255, 0.2)', // Adding a subtle border for better visibility
              transition: 'all 0.3s ease', // Smooth transition for hover effect
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2), 0 -6px 16px rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            Time Tracker Analysis
          </Box>
        }
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: ['flex-start', 'center'],
          '& .MuiCardHeader-action': { mb: 0 },
          '& .MuiCardHeader-content': { mb: [2, 0] },
          justifyContent: 'center', // Center the title horizontally
          mt: 2, // Add some margin on top
        }}
      />

      <CardContent>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" mb={4}>
          <Box display="flex" flexWrap="wrap" justifyContent="center" mb={2}>
            <Chip
              label="All"
              onClick={() => filterDataByWorkType(null)}
              color={!selectedWorkType ? 'primary' : 'default'}
              sx={{ margin: 1 }}
            />
            {workTypes.map((workType) => (
              <Chip
                key={workType.type}
                label={workType.type}
                onClick={() => filterDataByWorkType(workType.type)}
                color={selectedWorkType === workType.type ? 'primary' : 'default'}
                icon={<Box sx={{ width: 12, height: 12, backgroundColor: workType.color, borderRadius: '50%' }} />}
                sx={{ margin: 1 }}
              />
            ))}
          </Box>
          <Box display="flex" gap={2} justifyContent="center">
            <FormControl variant="outlined" sx={{ minWidth: 150 }}>
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                onChange={handleMonthChange}
                label="Month"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i} value={i}>
                    {format(new Date(2020, i, 1), 'MMMM')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined" sx={{ minWidth: 150 }}>
              <InputLabel>Week</InputLabel>
              <Select
                value={selectedWeek}
                onChange={handleWeekChange}
                label="Week"
              >
                <MenuItem value="currentWeek">Current Week</MenuItem>
                <MenuItem value="week1">Week 1</MenuItem>
                <MenuItem value="week2">Week 2</MenuItem>
                <MenuItem value="week3">Week 3</MenuItem>
                <MenuItem value="week4">Week 4</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Bar data={data} options={options} />
      </CardContent>
    </Card>
  )
}

export default WorkHoursChart
