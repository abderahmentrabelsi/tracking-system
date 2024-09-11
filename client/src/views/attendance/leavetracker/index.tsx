'use client'

import React, { useState } from 'react'
import { Box, Typography, Divider } from '@mui/material'
import LeaveTrackerPage from '@views/attendance/leavetracker/LeaveTracker'
import LeaveRequestList from '@views/attendance/leavetracker/LeaveRequestList'

const App = () => {
  const [refreshList, setRefreshList] = useState(false)

  const handleLeaveRequestSubmitted = () => {
    setRefreshList(!refreshList)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        Leave Tracker
      </Typography>
      <LeaveTrackerPage onLeaveRequestSubmitted={handleLeaveRequestSubmitted} />
      <Divider sx={{ my: 4 }} />
      <Typography variant='h4' gutterBottom>
        Leave Requests
      </Typography>
      <LeaveRequestList refresh={refreshList} />
    </Box>
  )
}

export default App
