import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { getTimesheet, requestEdit } from '@/app/api/timesheetApi';
import { getDepartmentById } from '@/app/api/taskApi';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WorkIcon from '@mui/icons-material/Work';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckIcon from '@mui/icons-material/Check';
import { styled } from '@mui/material/styles';

const steps = ['Select Workday', 'Enter Request Message', 'Review Request'];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const CustomTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'black',
    },
    '&:hover fieldset': {
      borderColor: 'black',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'black',
    },
  },
  '& .MuiInputBase-input.Mui-disabled': {
    WebkitTextFillColor: theme.palette.text.primary,
  },
}));

const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    border: '3px solid black',
    padding: theme.spacing(2),
  },
}));

const RequestEditForm = ({ userID, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [workHours, setWorkHours] = useState([]);
  const [selectedWorkHoursID, setSelectedWorkHoursID] = useState('');
  const [editRequestMsg, setEditRequestMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [departmentName, setDepartmentName] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        const data = await getTimesheet(userID);
        const workdayTimesheet = data.filter(entry => entry.workType === 'Workday');
        setWorkHours(workdayTimesheet);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch timesheet data', error);
        setLoading(false);
      }
    };

    fetchTimesheet();
  }, [userID]);

  useEffect(() => {
    const storedDepartmentId = typeof window !== 'undefined' ? parseInt(localStorage.getItem('departmentId') || '0', 10) : 0;
    setDepartmentId(storedDepartmentId);
    if (storedDepartmentId) {
      fetchDepartmentDetails(storedDepartmentId);
    }
  }, []);

  const fetchDepartmentDetails = async (id: number) => {
    try {
      const response = await getDepartmentById(id);
      const department = response;
      setDepartmentName(department.name);
      const parentDepartment = await getDepartmentById(department.parentDepartmentId);
      setClientName(parentDepartment.name);
    } catch (error) {
      console.error('Failed to fetch department details:', error);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      await requestEdit({ workHoursID: Number(selectedWorkHoursID), editRequestMsg });
      setSnackbarMessage('Edit request submitted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      onClose();
    } catch (error) {
      console.error('Failed to submit edit request', error);
      setSnackbarMessage('Failed to submit edit request');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const selectedWorkHours = workHours.find(entry => entry.ID === selectedWorkHoursID);

  return (
    <>
      <CustomDialog open onClose={onClose} maxWidth="md" fullWidth>
        <CustomDialogTitle>
          Request Edit
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </CustomDialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ? (
            <Typography sx={{ mt: 2, mb: 1 }}>
              All steps completed - you're finished
            </Typography>
          ) : (
            <Box sx={{ mt: 2, mb: 1 }}>
              {loading ? (
                <CircularProgress />
              ) : (
                <>
                  {activeStep === 0 && (
                    <Box>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Month</InputLabel>
                        <Select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          label="Month"
                        >
                          {months.map((month, index) => (
                            <MenuItem key={index} value={index + 1}>
                              {month}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth required>
                        <InputLabel>Workday</InputLabel>
                        <Select
                          value={selectedWorkHoursID}
                          onChange={(e) => setSelectedWorkHoursID(e.target.value)}
                          label="Workday"
                        >
                          {workHours
                            .filter(entry => new Date(entry.checkin * 1000).getMonth() + 1 === selectedMonth)
                            .map((entry) => (
                              <MenuItem key={entry.ID} value={entry.ID}>
                                {new Date(entry.checkin * 1000).toLocaleDateString()}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                  {activeStep === 1 && selectedWorkHours && (
                    <Box component="form" sx={{ '& .MuiTextField-root': { mb: 2 }, mt: 2 }}>
                      <Typography variant="h6" mb={2}>Workday Details</Typography>
                      <CustomTextField
                        label="Date"
                        fullWidth
                        value={new Date(selectedWorkHours.checkin * 1000).toLocaleDateString()}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              <WorkIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <CustomTextField
                        label="Location"
                        fullWidth
                        value={selectedWorkHours.location}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <CustomTextField
                        label="Check-in / Check-out"
                        fullWidth
                        value={`Check-in: ${new Date(selectedWorkHours.checkin * 1000).toLocaleTimeString()} - Check-out: ${new Date(selectedWorkHours.checkout * 1000).toLocaleTimeString()}`}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTimeIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <CustomTextField
                        label="Duration"
                        fullWidth
                        value={`${selectedWorkHours.duration.toFixed(2)} hrs`}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        label="Department"
                        fullWidth
                        value={departmentName}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        label="Client"
                        fullWidth
                        value={clientName}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        label="Edit Request Message"
                        fullWidth
                        multiline
                        rows={4}
                        value={editRequestMsg}
                        onChange={(e) => setEditRequestMsg(e.target.value)}
                        required
                      />
                    </Box>
                  )}
                  {activeStep === 2 && selectedWorkHours && (
                    <Box sx={{ '& .MuiTextField-root': { mb: 2 }, mt: 2 }}>
                      <Typography variant="h6" mb={2}>Review Request</Typography>
                      <CustomTextField
                        label="Date"
                        fullWidth
                        value={new Date(selectedWorkHours.checkin * 1000).toLocaleDateString()}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              <WorkIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <CustomTextField
                        label="Location"
                        fullWidth
                        value={selectedWorkHours.location}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <CustomTextField
                        label="Check-in / Check-out"
                        fullWidth
                        value={`Check-in: ${new Date(selectedWorkHours.checkin * 1000).toLocaleTimeString()} - Check-out: ${new Date(selectedWorkHours.checkout * 1000).toLocaleTimeString()}`}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTimeIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <CustomTextField
                        label="Duration"
                        fullWidth
                        value={`${selectedWorkHours.duration.toFixed(2)} hrs`}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        label="Department"
                        fullWidth
                        value={departmentName}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        label="Client"
                        fullWidth
                        value={clientName}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        label="Request Message"
                        fullWidth
                        multiline
                        rows={4}
                        value={editRequestMsg}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<NavigateBeforeIcon />}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button onClick={handleSubmit} startIcon={<CheckIcon />} disabled={!selectedWorkHoursID || !editRequestMsg}>
              Submit
            </Button>
          ) : (
            <Button onClick={handleNext} endIcon={<NavigateNextIcon />} disabled={(activeStep === 0 && !selectedWorkHoursID) || (activeStep === 1 && !editRequestMsg)}>
              Next
            </Button>
          )}
        </DialogActions>
      </CustomDialog>
      <Snackbar open={snackbarOpen} autoHideDuration={10000} onClose={handleSnackbarClose}>
      <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RequestEditForm;
