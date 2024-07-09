'use client'

import React, {useEffect, useState} from 'react'
import {getTimesheet} from '@/app/api/timesheetApi'
import {getDepartmentById} from '@/app/api/taskApi'
import {Box, Card, CardContent, CardHeader, Chip, CircularProgress} from '@mui/material'
import {Doughnut} from 'react-chartjs-2'
import 'chart.js/auto'
import {animated, useSpring} from '@react-spring/web'
import BusinessIcon from '@mui/icons-material/Business';
import ApartmentIcon from '@mui/icons-material/Apartment';

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
    from: {transform: 'rotate(0deg)'},
    to: {transform: 'rotate(360deg)'},
    config: {duration: 10000},
    reset: true,
    loop: true,
  })

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress/>
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
              boxShadow: '0 6px 16px rgba(0, 0, 0.8, 0.9), 0 -6px 16px rgba(255, 255, 255, 0.3)',
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
          '& .MuiCardHeader-action': {mb: 0},
          '& .MuiCardHeader-content': {mb: [2, 0]},
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
              boxShadow: '0 4px 8px rgba(0, 0, 0.9, 0.9)',
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
                boxShadow: '0 4px 8px rgba(0, 0, 0.9, 0.9)',
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
          <Doughnut data={data} options={options}/>
          <animated.div
            style={{
              ...textAnimation,
              position: 'absolute',
              fontSize: '1.4rem', // Increased font size
              fontWeight: 'bold', // Bold text
              color: '#fff',
              padding: '5px' // Added padding
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 200 200">
              <defs>
                <filter id="border">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="black"/>
                </filter>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <path
                id="circlePath"
                d="
        M 100, 100
        m -75, 0
        a 75,75 0 1,1 150,0
        a 75,75 0 1,1 -150,0
      "
                fill="transparent"
              />
              <text filter="url(#glow)" fill="black"
                    style={{textShadow: '0 0 5px rgba(255,255,255,0.5), 0 0 10px rgba(255,255,255,0.5)'}}>
                <textPath href="#circlePath">
                  {` ★ ${clientName} - ${departmentName} ★`}
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
