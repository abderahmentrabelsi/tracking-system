'use client'
import WorkHoursChart from './workhours'
import WorkHoursRadarChart from './WorkHoursRadarChart'
import WorkHoursDoughnutChart from './WorkHoursDoughnutChart'
import { Box, Card, CardContent } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const WorkHoursPage = () => {
  const theme = useTheme()

  return (
    <Box>
      <Card
        sx={{
          marginBottom: 4,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(0, 0, 0, 0.1)', // Smooth black border
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)' // Enhanced shadow on hover
          }
        }}
      >
        <CardContent>
          <WorkHoursChart />
        </CardContent>
      </Card>
      <Box mt={4} display='flex' justifyContent='space-between'>
        <Card
          sx={{
            flex: 1,
            marginRight: 2,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(0, 0, 0, 0.1)', // Smooth black border
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)' // Enhanced shadow on hover
            }
          }}
        >
          <CardContent>
            <WorkHoursRadarChart />
          </CardContent>
        </Card>
        <Card
          sx={{
            flex: 1,
            marginLeft: 2,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(0, 0, 0, 0.1)', // Smooth black border
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)' // Enhanced shadow on hover
            }
          }}
        >
          <CardContent>
            <WorkHoursDoughnutChart />
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default WorkHoursPage
