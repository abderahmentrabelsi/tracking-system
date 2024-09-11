'use client'

import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import TimesheetDashboard from '@/views/timesheet'

const theme = createTheme({
  palette: {
    mode: 'light'
  }
})

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <TimesheetDashboard />
  </ThemeProvider>
)

export default App
