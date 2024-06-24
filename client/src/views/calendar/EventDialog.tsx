'use client';

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControlLabel, Switch,
  Select, MenuItem, InputLabel, FormControl, Box, IconButton, Slide, Snackbar, Fade
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import MuiAlert from '@mui/material/Alert';
import WarningIcon from '@mui/icons-material/Warning';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const EventDialog = ({ open, onClose, onSave, onDelete, eventData, setEventData, selectedEvent }: any) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setEventData({ ...eventData, [field]: event.target.value });
  };

  const handleCheckboxChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setEventData({ ...eventData, [field]: event.target.checked });
  };

  const handleSelectChange = (field: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
    setEventData({ ...eventData, [field]: event.target.value as string });
  };

  const handleSave = () => {
    onSave();
    setSnackbarMessage('Event saved successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDelete = () => {
    onDelete();
    setSnackbarMessage('Event deleted successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setDeleteConfirmOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return '#f44336'; // red
      case 'Medium':
        return '#ff9800'; // orange
      case 'Low':
        return '#4caf50'; // green
      default:
        return '#2196f3'; // blue
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <EventIcon />
            {selectedEvent ? 'Edit Event' : 'Create Event'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Fade in={open}>
            <Box component="form" noValidate autoComplete="off">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Event Title"
                    value={eventData.title}
                    onChange={handleChange('title')}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    style={{ marginTop: 16 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="datetime-local"
                    value={eventData.start_dt}
                    onChange={handleChange('start_dt')}
                    InputLabelProps={{ shrink: true }}
                    disabled={eventData.all_day}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="datetime-local"
                    value={eventData.end_dt}
                    onChange={handleChange('end_dt')}
                    InputLabelProps={{ shrink: true }}
                    disabled={eventData.all_day}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={<Switch checked={eventData.all_day} onChange={handleCheckboxChange('all_day')} />}
                    label="All Day"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={<Switch checked={eventData.is_remote} onChange={handleCheckboxChange('is_remote')} />}
                    label="Remote Event"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Who"
                    value={eventData.who}
                    onChange={handleChange('who')}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={eventData.location}
                    onChange={handleChange('location')}
                    disabled={eventData.is_remote}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Event Type</InputLabel>
                    <Select
                      value={eventData.type}
                      onChange={handleSelectChange('type')}
                      label="Event Type"
                    >
                      <MenuItem value="General">General</MenuItem>
                      <MenuItem value="Project">Project</MenuItem>
                      <MenuItem value="Meeting">Meeting</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={eventData.priority}
                      onChange={handleSelectChange('priority')}
                      label="Priority"
                      style={{ color: getPriorityColor(eventData.priority) }}
                    >
                      <MenuItem value="Low" style={{ color: '#4caf50' }}>Low</MenuItem>
                      <MenuItem value="Medium" style={{ color: '#ff9800' }}>Medium</MenuItem>
                      <MenuItem value="High" style={{ color: '#f44336' }}>High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Attendance</InputLabel>
                    <Select
                      value={eventData.attendance}
                      onChange={handleSelectChange('attendance')}
                      label="Attendance"
                      startAdornment={
                        eventData.attendance === 'Obligatory' ? (
                          <EventBusyIcon />
                        ) : eventData.attendance === 'Preferred' ? (
                          <EventAvailableIcon />
                        ) : (
                          <EventNoteIcon />
                        )
                      }
                    >
                      <MenuItem value="Obligatory">Obligatory</MenuItem>
                      <MenuItem value="Optional">Optional</MenuItem>
                      <MenuItem value="Preferred">Preferred</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    value={eventData.notes}
                    onChange={handleChange('notes')}
                    multiline
                    rows={4}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          </Fade>
        </DialogContent>
        <DialogActions>
          <Grid container justifyContent="space-between">
            {selectedEvent && (
              <Button
                onClick={handleDeleteConfirm}
                color="secondary"
                startIcon={<DeleteIcon />}
                variant="contained"
              >
                Delete
              </Button>
            )}
            <Box>
              <Button
                onClick={onClose}
                color="primary"
                startIcon={<CancelIcon />}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                color="primary"
                startIcon={<SaveIcon />}
                variant="contained"
                style={{ marginLeft: '8px' }}
              >
                Save
              </Button>
            </Box>
          </Grid>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <WarningIcon color="error" />
            Confirm Delete
          </Box>
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete this event? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EventDialog;
