'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { getTimesheet } from '@/app/api/timesheetApi'
import { Box, Button, CircularProgress, Card, CardHeader, CardContent, Chip } from '@mui/material'
import { Bar } from 'react-chartjs-2'
import 'chart.js/auto'
import { eachDayOfInterval, startOfWeek, endOfWeek, format } from 'date-fns'

// Define work types and their colors
const workTypes = [
  { type: 'Workday', color: 'rgba(75, 192, 192, 0.5)' },
  { type: 'Overtime', color: 'rgba(255, 99, 132, 0.5)' },
  { type: 'Meeting', color: 'rgba(54, 162, 235, 0.5)' },
  { type: 'Training', color: 'rgba(255, 206, 86, 0.5)' },
  { type: 'Break', color: 'rgba(153, 102, 255, 0.5)' },
  { type: 'Administrative', color: 'rgba(255, 159, 64, 0.5)' },
  { type: 'Task', color: 'rgba(0, 207, 232, 0.5)' },
  { type: 'Client Work', color: 'rgba(75, 192, 192, 0.5)' },
  { type: 'Travel', color: 'rgba(255, 99, 132, 0.5)' },
  { type: 'On Call', color: 'rgba(54, 162, 235, 0.5)' },
  { type: 'Research', color: 'rgba(255, 206, 86, 0.5)' },
  { type: 'Support', color: 'rgba(153, 102, 255, 0.5)' },
  { type: 'Development', color: 'rgba(255, 159, 64, 0.5)' },
]

const WorkHoursChart = () => {
  const [loading, setLoading] = useState(true)
  const [timesheet, setTimesheet] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [selectedWorkType, setSelectedWorkType] = useState(null)
  const userId = Number(localStorage.getItem('userID'))

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

    fetchTimesheet()
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
        title='Work Hours Analysis'
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: ['flex-start', 'center'],
          '& .MuiCardHeader-action': { mb: 0 },
          '& .MuiCardHeader-content': { mb: [2, 0] }
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
        <Bar data={data} />
      </CardContent>
    </Card>
  )
}

export default WorkHoursChart
