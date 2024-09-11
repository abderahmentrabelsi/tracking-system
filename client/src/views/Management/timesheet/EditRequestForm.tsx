'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material'
import { MobileTimePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CloseIcon from '@mui/icons-material/Close'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import CheckIcon from '@mui/icons-material/Check'
import { approveEdit } from '@/app/api/timesheetApi'
import CancelIcon from '@mui/icons-material/Cancel'
import { styled } from '@mui/material/styles'
const steps = ['View Request', 'Approve or Decline']

interface EditRequestFormProps {
  open: boolean
  onClose: () => void
  workHours: WorkHours | null
}

const EditRequestForm: React.FC<EditRequestFormProps> = ({ open, onClose, workHours }) => {
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [managerComment, setManagerComment] = useState('')
  const [adjustedCheckin, setAdjustedCheckin] = useState<Date | null>(null)
  const [adjustedCheckout, setAdjustedCheckout] = useState<Date | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')

  useEffect(() => {
    if (workHours) {
      setAdjustedCheckin(new Date(workHours.requestCheckin * 1000))
      setAdjustedCheckout(new Date(workHours.requestCheckout * 1000))
    }
  }, [workHours])

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleApprove = async () => {
    try {
      setLoading(true)
      const requestDuration =
        adjustedCheckin && adjustedCheckout
          ? (adjustedCheckout.getTime() - adjustedCheckin.getTime()) / 3600000
          : workHours.duration
      await approveEdit({
        workHoursID: workHours.ID,
        approved: true,
        managerComment,
        requestCheckin: adjustedCheckin ? Math.floor(adjustedCheckin.getTime() / 1000) : undefined,
        requestCheckout: adjustedCheckout ? Math.floor(adjustedCheckout.getTime() / 1000) : undefined,
        requestDuration
      })
      setSnackbarMessage('Edit request approved successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
      onClose()
    } catch (error) {
      console.error('Failed to approve edit request', error)
      setSnackbarMessage('Failed to approve edit request')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    try {
      setLoading(true)
      await approveEdit({
        workHoursID: workHours.ID,
        approved: false,
        managerComment,
        requestCheckin: adjustedCheckin ? Math.floor(adjustedCheckin.getTime() / 1000) : undefined,
        requestCheckout: adjustedCheckout ? Math.floor(adjustedCheckout.getTime() / 1000) : undefined,
        requestDuration: workHours.requestDuration
      })
      setSnackbarMessage('Edit request declined successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
      onClose()
    } catch (error) {
      console.error('Failed to decline edit request', error)
      setSnackbarMessage('Failed to decline edit request')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
        <DialogTitle>
          Request Edit
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ? (
            <Typography sx={{ mt: 2, mb: 3 }}>All steps completed - you're finished</Typography>
          ) : (
            <Box sx={{ mt: 2, mb: 1 }}>
              {loading ? (
                <CircularProgress />
              ) : (
                <>
                  {activeStep === 0 && workHours && (
                    <Box component='form' sx={{ '& .MuiTextField-root': { mb: 3 }, mt: 4 }}>
                      <Typography variant='h6' mb={2}>
                        Workday Details
                      </Typography>
                      <CustomTextField
                        label='Date'
                        fullWidth
                        value={new Date(workHours.checkin * 1000).toLocaleDateString()}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position='start'>
                              <AccessTimeIcon />
                            </InputAdornment>
                          )
                        }}
                      />
                      <CustomTextField
                        label='Location'
                        fullWidth
                        value={workHours.location}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position='start'>
                              <AccessTimeIcon />
                            </InputAdornment>
                          )
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <Typography>Current Check-in Time</Typography>
                          <CustomTextField
                            fullWidth
                            value={new Date(workHours.checkin * 1000).toLocaleTimeString()}
                            InputProps={{
                              readOnly: true,
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <AccessTimeIcon />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <Typography>Adjusted Check-in Time</Typography>
                          <CustomTextField
                            fullWidth
                            value={adjustedCheckin ? adjustedCheckin.toLocaleTimeString() : ''}
                            InputProps={{
                              readOnly: true,
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <AccessTimeIcon />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <Typography>Current Check-out Time</Typography>
                          <CustomTextField
                            fullWidth
                            value={workHours.checkout ? new Date(workHours.checkout * 1000).toLocaleTimeString() : ''}
                            InputProps={{
                              readOnly: true,
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <AccessTimeIcon />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <Typography>Adjusted Check-out Time</Typography>
                          <CustomTextField
                            fullWidth
                            value={adjustedCheckout ? adjustedCheckout.toLocaleTimeString() : ''}
                            InputProps={{
                              readOnly: true,
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <AccessTimeIcon />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <Typography>Current Duration</Typography>
                          <CustomTextField
                            fullWidth
                            value={`${workHours.duration.toFixed(2)} hrs`}
                            InputProps={{
                              readOnly: true,
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <AccessTimeIcon />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <Typography>Adjusted Duration</Typography>
                          <CustomTextField
                            fullWidth
                            value={
                              adjustedCheckin && adjustedCheckout
                                ? `${((adjustedCheckout.getTime() - adjustedCheckin.getTime()) / 3600000).toFixed(2)} hrs`
                                : ''
                            }
                            InputProps={{
                              readOnly: true,
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <AccessTimeIcon />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Box>
                      </Box>
                      <CustomTextField
                        label='Edit Request Message'
                        fullWidth
                        multiline
                        rows={4}
                        value={workHours.editRequestMsg}
                        InputProps={{
                          readOnly: true
                        }}
                      />
                    </Box>
                  )}
                  {activeStep === 1 && (
                    <Box component='form' sx={{ '& .MuiTextField-root': { mb: 5 }, mt: 5 }}>
                      <Typography variant='h6' mb={4}>
                        Manager Comment
                      </Typography>
                      <CustomTextField
                        label='Manager Comment'
                        fullWidth
                        multiline
                        rows={4}
                        value={managerComment}
                        onChange={e => setManagerComment(e.target.value)}
                        required
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {activeStep === 0 ? (
            <Button color='inherit' onClick={handleBack} startIcon={<NavigateBeforeIcon />}>
              Back
            </Button>
          ) : (
            <>
              <Button color='inherit' onClick={handleBack} startIcon={<NavigateBeforeIcon />}>
                Back
              </Button>
              <Button
                color='primary'
                onClick={handleApprove}
                startIcon={<CheckIcon />}
                disabled={loading}
                style={{ position: 'absolute', right: 10, transition: 'transform 0.3s ease' }}
              >
                Approve
              </Button>
              <Button
                color='secondary'
                onClick={handleDecline}
                startIcon={<CancelIcon />}
                disabled={loading}
                style={{ position: 'absolute', left: 650 }}
              >
                Decline
              </Button>
            </>
          )}
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep < steps.length - 1 && (
            <Button onClick={handleNext} endIcon={<NavigateNextIcon />}>
              Next
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={10000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  )
}

export default EditRequestForm

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'black'
    },
    '&:hover fieldset': {
      borderColor: 'black'
    },
    '&.Mui-focused fieldset': {
      borderColor: 'black'
    }
  },
  '& .MuiInputBase-input.Mui-disabled': {
    WebkitTextFillColor: theme.palette.text.primary
  }
}))
