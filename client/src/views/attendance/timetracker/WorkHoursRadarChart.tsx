'use client'

import React, { useState, useEffect } from 'react'
import { getTimesheet } from '@/app/api/timesheetApi'
import { Box, CircularProgress, Card, CardHeader, CardContent, Chip } from '@mui/material'
import { Radar } from 'react-chartjs-2'
import 'chart.js/auto'
import { useColorScheme } from '@mui/material/styles'

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
]

const WorkHoursRadarChart = () => {
  const [loading, setLoading] = useState(true)
  const [timesheet, setTimesheet] = useState([])
  const [ignoredWorkTypes, setIgnoredWorkTypes] = useState<string[]>([])
  const userId = typeof window !== 'undefined' ? Number(localStorage.getItem('userID')) : null
  const { mode } = useColorScheme()

  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        const data = await getTimesheet(userId)
        if (data) {
          setTimesheet(data)
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

  const handleWorkTypeClick = (workType: string) => {
    setIgnoredWorkTypes(prev =>
      prev.includes(workType) ? prev.filter(type => type !== workType) : [...prev, workType]
    )
  }

  const filteredTimesheet = timesheet.filter(entry => !ignoredWorkTypes.includes(entry.workType))

  const workTypeDurations = workTypes.map(workType => {
    return filteredTimesheet
      .filter(entry => entry.workType === workType.type)
      .reduce((sum, entry) => sum + entry.duration, 0)
  })

  const data = {
    labels: workTypes.map(workType => workType.type),
    datasets: [
      {
        label: 'Work Hours',
        backgroundColor: 'rgba(34, 202, 236, 0.2)',
        borderColor: 'rgba(34, 202, 236, 1)',
        pointBackgroundColor: workTypes.map(workType => workType.color),
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: workTypes.map(workType => workType.color),
        data: workTypeDurations
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          fontSize: 13,
          usePointStyle: true,
          color: mode === 'dark' ? '#fff' : '#000'
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
      r: {
        angleLines: {
          color: 'rgba(0, 0, 0, 1)', // Black color for angle lines
          lineWidth: 1.5, // Increase line thickness
          borderDash: [5, 5] // Dashed lines for a different effect
        },
        grid: {
          color: 'rgba(0, 0, 0, 1)', // Black color for grid lines
          lineWidth: 1.5 // Increase line thickness
        },
        suggestedMin: 0,
        suggestedMax: Math.max(...workTypeDurations) + 5,
        pointLabels: {
          fontSize: 12,
          color: mode === 'dark' ? '#fff' : '#000'
        },
        ticks: {
          backdropColor: 'transparent',
          callback: function (value) {
            return value
          },
          color: mode === 'dark' ? '#fff' : '#000',
          font: {
            size: 10
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
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
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              border: '9px solid rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease', // Smooth transition for hover effect
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.9), 0 -6px 16px rgba(255, 255, 255, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2), 0 -6px 16px rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            Radar Analysis
          </Box>
        }
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: ['flex-start', 'center'],
          '& .MuiCardHeader-action': { mb: 0 },
          '& .MuiCardHeader-content': { mb: [2, 0] },
          justifyContent: 'center', // Center the title horizontally
          mt: 2 // Add some margin on top
        }}
      />

      <CardContent>
        <Box display='flex' justifyContent='center' mt={2} mb={2} flexWrap='wrap'>
          <Chip
            key='All'
            label='All'
            onClick={() => setIgnoredWorkTypes([])}
            color='primary'
            style={{
              color: '#fff',
              margin: '5px',
              boxShadow: '0 4px 8px rgba(0, 0, 0.6, 0.9)',
              borderRadius: '4px', // Rectangle form
              padding: '5px',
              fontSize: '10px', // Smaller font size
              textDecoration: ignoredWorkTypes.length === 0 ? 'none' : 'line-through' // Remove line-through for "All"
            }}
          />
          {workTypes.map(workType => (
            <Chip
              key={workType.type}
              label={workType.type}
              onClick={() => handleWorkTypeClick(workType.type)}
              style={{
                backgroundColor: workType.color,
                color: '#fff',
                margin: '5px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.9)',
                borderRadius: '4px', // Rectangle form
                padding: '5px',
                fontSize: '10px', // Smaller font size
                textDecoration: ignoredWorkTypes.includes(workType.type) ? 'line-through' : 'none' // Line-through for ignored types
              }}
            />
          ))}
        </Box>
        <Radar data={data} options={options} />
      </CardContent>
    </Card>
  )
}

export default WorkHoursRadarChart
