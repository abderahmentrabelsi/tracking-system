'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Grid,
  Snackbar,
  Alert
} from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import EventNoteIcon from '@mui/icons-material/EventNote'
import useUserData from './useUserData'
import { createLeaveRequest } from '@/app/api/leaveApi'
import { LeaveRequestPayload } from '@/types/leaveTypes'
import Cookies from 'js-cookie'

const getUserIdFromToken = () => {
  const token = Cookies.get('access_token')
  if (token) {
    const decodedToken = JSON.parse(atob(token.split('.')[1]))
    return decodedToken.UserID
  }
  return null
}

const steps = [
  { label: 'User Details', icon: <AccountCircleIcon /> },
  { label: 'Leave Request', icon: <EventNoteIcon /> }
]

const LeaveTrackerPage = () => {
  const userId = getUserIdFromToken()
  const { user, departmentName, clientName } = useUserData(userId)
  const [formData, setFormData] = useState<Omit<LeaveRequestPayload, 'userId'>>({
    startDate: '',
    endDate: '',
    duration: 0,
    leaveType: '',
    paid: false,
    comments: ''
  })

  const [activeStep, setActiveStep] = useState(0)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleDateChange = (field: 'startDate' | 'endDate') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormData(prev => {
      const updatedForm = {
        ...prev,
        [field]: value,
        duration:
          field === 'startDate'
            ? Math.ceil((new Date(prev.endDate).getTime() - new Date(value).getTime()) / (1000 * 60 * 60 * 24)) + 1
            : Math.ceil((new Date(value).getTime() - new Date(prev.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      }
      return updatedForm
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formattedFormData: LeaveRequestPayload = {
        ...formData,
        userId: parseInt(userId, 10),
        startDate: Math.floor(new Date(formData.startDate).getTime() / 1000), // Convert to Unix timestamp
        endDate: Math.floor(new Date(formData.endDate).getTime() / 1000) // Convert to Unix timestamp
      }
      const response = await createLeaveRequest(formattedFormData)
      setSuccessMessage('Leave request created successfully!')
      setFormData({
        startDate: '',
        endDate: '',
        duration: 0,
        leaveType: '',
        paid: false,
        comments: ''
      })
    } catch (error: any) {
      console.error('Failed to create leave request:', error.message)
      setSuccessMessage(null) // Clear success message on error
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel icon={step.icon}>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {activeStep === 0 && (
        <Box sx={{ p: 3 }}>
          {user && (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  label='Full Name'
                  value={`${user.firstName} ${user.lastName}`}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    sx: {
                      '& .MuiInputBase-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='Job Title'
                  value={user.JobName}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    sx: {
                      '& .MuiInputBase-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='Department'
                  value={departmentName}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    sx: {
                      '& .MuiInputBase-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='Client'
                  value={clientName}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    sx: {
                      '& .MuiInputBase-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant='contained' onClick={handleNext}>
              Next
            </Button>
          </Box>
        </Box>
      )}
      {activeStep === 1 && (
        <Box component='form' onSubmit={handleSubmit} sx={{ p: 2 }}>
          <Grid container spacing={5} mt={4}>
            <Grid item xs={14} sm={6}>
              <TextField
                label='Start Date'
                type='date'
                value={formData.startDate}
                onChange={handleDateChange('startDate')}
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label='End Date'
                type='date'
                value={formData.endDate}
                onChange={handleDateChange('endDate')}
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name='duration'
                label='Duration (days)'
                value={formData.duration.toString()}
                InputProps={{ readOnly: true }}
                fullWidth
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name='leaveType'
                label='Leave Type'
                select
                value={formData.leaveType}
                onChange={handleChange}
                fullWidth
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                {['Sick Leave', 'Vacation', 'Other'].map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={formData.paid} onChange={handleSwitchChange} name='paid' />}
                label='Paid Leave'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name='comments'
                label='Comments'
                value={formData.comments}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack} sx={{ mt: 3 }}>
                Back
              </Button>
              <Button type='submit' variant='contained' color='primary' sx={{ mt: 3 }}>
                Submit
              </Button>
            </Grid>
          </Grid>
          <Snackbar
            open={!!successMessage}
            autoHideDuration={6000}
            onClose={() => setSuccessMessage(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={() => setSuccessMessage(null)} severity='success' sx={{ width: '100%' }}>
              {successMessage}
            </Alert>
          </Snackbar>
        </Box>
      )}
    </Box>
  )
}

export default LeaveTrackerPage
