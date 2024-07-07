'use client'

import React, { useState, useEffect } from 'react'
import { getTimesheet } from '@/app/api/timesheetApi'
import { getDepartmentById } from '@/app/api/taskApi'
import { Box, CircularProgress, Card, CardHeader, CardContent, Chip } from '@mui/material'
import { Doughnut } from 'react-chartjs-2'
import 'chart.js/auto'
import { useSpring, animated } from '@react-spring/web'

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

const WorkHoursDoughnutChart = () => {
  const [loading, setLoading] = useState(true)
  const [timesheet, setTimesheet] = useState([])
  const [ignoredWorkTypes, setIgnoredWorkTypes] = useState<string[]>([])
  const [departmentName, setDepartmentName] = useState<string>('')
  const [clientName, setClientName] = useState<string>('')
  const userId = typeof window !== 'undefined' ? Number(localStorage.getItem('userID')) : null

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

  useEffect(() => {
    const storedDepartmentId = typeof window !== 'undefined' ? parseInt(localStorage.getItem('departmentId') || '0', 10) : 0
    if (storedDepartmentId) {
      fetchDepartmentDetails(storedDepartmentId)
    }
  }, [])

  const fetchDepartmentDetails = async (id: number) => {
    try {
      const response = await getDepartmentById(id)
      const department = response
      setDepartmentName(department.name)
      const parentDepartment = await getDepartmentById(department.parentDepartmentId)
      setClientName(parentDepartment.name)
    } catch (error) {
      console.error('Failed to fetch department details:', error)
    }
  }

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
        backgroundColor: workTypes.map(workType => workType.color),
        borderColor: workTypes.map(workType => workType.color.replace('0.7', '1')),
        borderWidth: 1,
        hoverBackgroundColor: workTypes.map(workType => workType.color.replace('0.7', '0.9')),
        hoverBorderColor: workTypes.map(workType => workType.color.replace('0.7', '1')),
        data: workTypeDurations,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide the circle legend
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw} hours`
          }
        }
      }
    }
  }

  const textAnimation = useSpring({
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
    config: { duration: 10000 },
    reset: true,
    loop: true,
  })

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
            Doughnut Analysis
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
        <Box display="flex" justifyContent="center" mb={4} flexWrap="wrap">
          <Chip
            key="All"
            label="All"
            onClick={() => setIgnoredWorkTypes([])}
            color='primary'
            style={{
              color: '#fff',
              margin: '5px',
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
                borderRadius: '4px', // Rectangle form
                padding: '5px',
                fontSize: '10px', // Smaller font size
                textDecoration: ignoredWorkTypes.includes(workType.type) ? 'line-through' : 'none' // Line-through for ignored types
              }}
            />
          ))}
        </Box>
        <Box position="relative" display="flex" justifyContent="center" alignItems="center">
          <Doughnut data={data} options={options} />
          <animated.div style={{ ...textAnimation, position: 'absolute', fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
            <svg width="10000" height="300" viewBox="0 0 200 200">
              <path id="circlePath" d="
                M 100, 100
                m -75, 0
                a 75,75 0 1,1 150,0
                a 75,75 0 1,1 -150,0
              " fill="transparent" />
              <text>
                <textPath href="#circlePath">
                  {`${clientName}  - ${departmentName}`}
                </textPath>
              </text>
            </svg>
          </animated.div>
        </Box>
      </CardContent>
    </Card>
  )
}

export default WorkHoursDoughnutChart
