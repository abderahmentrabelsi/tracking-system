'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { getTimesheet } from '@/app/api/timesheetApi'
import { Box, CircularProgress, Card, CardHeader, CardContent, Chip, useTheme } from '@mui/material'
import { Bar } from 'react-chartjs-2'
import 'chart.js/auto'
import { eachDayOfInterval, startOfWeek, endOfWeek, format } from 'date-fns'

// Define work types and their colors
const workTypes = [
  { type: 'Workday', color: 'rgba(25,124,185,0.89)' }, // Soft Blue
  { type: 'Overtime', color: 'rgba(231, 76, 60, 0.7)' }, // Soft Red
  { type: 'Meeting', color: 'rgba(26, 188, 156, 0.7)' }, // Soft Teal
  { type: 'Training', color: 'rgba(241, 196, 15, 0.7)' }, // Soft Yellow
  { type: 'Break', color: 'rgba(142, 68, 173, 0.7)' }, // Rich Purple
  { type: 'Administrative', color: 'rgba(230, 126, 34, 0.7)' }, // Carrot Orange
  { type: 'Task', color: 'rgba(31,144,122,0.7)' }, // Green Sea
  { type: 'Client Work', color: 'rgba(211, 84, 0, 0.7)' }, // Dark Orange
  { type: 'Travel', color: 'rgba(39, 174, 96, 0.7)' }, // Emerald Green
  { type: 'On Call', color: 'rgba(59,82,104,0.7)' }, // Wet Asphalt
  { type: 'Research', color: 'rgba(192, 57, 43, 0.7)' }, // Pomegranate Red
  { type: 'Support', color: 'rgba(149, 165, 166, 0.7)' }, // Concrete Grey
  { type: 'Development', color: 'rgba(58,61,62,0.7)' } // Asbestos Grey
]

const WorkHoursChart = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [timesheet, setTimesheet] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [selectedWorkType, setSelectedWorkType] = useState(null)
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

  // Get the current week dates
  const currentWeek = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 })
  }).map(date => format(date, 'yyyy-MM-dd'))

  // Prepare data for chart
  const chartData = currentWeek.map(date => {
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
    borderColor: workType.color.replace('0.5', '1'),
    borderWidth: 1,
    hoverBackgroundColor: workType.color.replace('0.5', '0.7'),
    hoverBorderColor: workType.color.replace('0.5', '1'),
    data: chartData.map(data => data.workTypes
      .filter(entry => entry.workType === workType.type)
      .reduce((sum, entry) => sum + entry.duration, 0)),
  }))

  const data = {
    labels: currentWeek,
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
        <Box mb={2}>
          <Chip
            label="All"
            onClick={() => filterDataByWorkType(null)}
            color={!selectedWorkType ? 'primary' : 'default'}
            sx={{ marginRight: 1, marginBottom: 1 }}
          />
          {workTypes.map((workType) => (
            <Chip
              key={workType.type}
              label={workType.type}
              onClick={() => filterDataByWorkType(workType.type)}
              color={selectedWorkType === workType.type ? 'primary' : 'default'}
              icon={<Box sx={{ width: 12, height: 12, backgroundColor: workType.color, borderRadius: '50%' }} />}
              sx={{ marginRight: 1, marginBottom: 1 }}
            />
          ))}
        </Box>
        <Bar data={data} options={options} />
      </CardContent>
    </Card>
  )
}

export default WorkHoursChart
