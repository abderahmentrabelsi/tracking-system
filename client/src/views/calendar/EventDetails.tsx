'use client';

import React from 'react';
import { Box, Typography, Chip, Paper, Grid, Avatar, IconButton, Slide, Fade } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotesIcon from '@mui/icons-material/Notes';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import FlagIcon from '@mui/icons-material/Flag';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { styled } from '@mui/system';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '16px',
  backgroundColor: theme.palette.background.default,
  boxShadow: theme.shadows[5],
  margin: theme.spacing(3),
  maxWidth: '900px',
  marginLeft: 'auto',
  marginRight: 'auto',
}));

const DetailBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
}));

const IconAvatar = styled(Avatar)(({ theme }) => ({
  marginRight: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
}));

const EventDetails = ({ event }: any) => {
  if (!event) return null;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <PriorityHighIcon style={{ color: '#f44336' }} />;
      case 'Medium':
        return <FlagIcon style={{ color: '#ff9800' }} />;
      case 'Low':
        return <FlagIcon style={{ color: '#4caf50' }} />;
      default:
        return null;
    }
  };

  const getAttendanceIcon = (attendance: string) => {
    switch (attendance) {
      case 'Obligatory':
        return <EventBusyIcon style={{ color: '#f44336' }} />;
      case 'Preferred':
        return <EventAvailableIcon style={{ color: '#ff9800' }} />;
      case 'Optional':
        return <PeopleIcon style={{ color: '#4caf50' }} />;
      default:
        return null;
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <StyledPaper elevation={3}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Slide direction="down" in={true} timeout={500}>
            <EventIcon color="primary" style={{ fontSize: '3rem', marginBottom: '10px' }} />
          </Slide>
          <Typography variant="h4" align="center" gutterBottom>{event.title}</Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <DetailBox>
              <Slide direction="left" in={true} timeout={500}>
                <AccessTimeIcon color="action" style={{ fontSize: '2rem' }} />
              </Slide>
              <Typography variant="body1" style={{ marginLeft: '10px' }}>
                {new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleString()}
              </Typography>
            </DetailBox>
          </Grid>
          <Grid item xs={12}>
            <DetailBox>
              <Slide direction="right" in={true} timeout={500}>
                <IconAvatar>
                  {getPriorityIcon(event.extendedProps.priority)}
                </IconAvatar>
              </Slide>
              <Typography variant="body1">{event.extendedProps.priority}</Typography>
              <Chip label={event.extendedProps.type} style={{ marginLeft: '20px' }} />
            </DetailBox>
          </Grid>
          <Grid item xs={12}>
            <DetailBox>
              <Slide direction="left" in={true} timeout={500}>
                {getAttendanceIcon(event.extendedProps.attendance)}
              </Slide>
              <Typography variant="body1" style={{ marginLeft: '10px' }}>
                {event.extendedProps.attendance}
              </Typography>
            </DetailBox>
          </Grid>
          <Grid item xs={12}>
            <DetailBox>
              <Slide direction="right" in={true} timeout={500}>
                <PeopleIcon style={{ fontSize: '2rem' }} />
              </Slide>
              <Typography variant="body1" style={{ marginLeft: '10px' }}>{event.extendedProps.who}</Typography>
            </DetailBox>
          </Grid>
          <Grid item xs={12}>
            <DetailBox>
              <Slide direction="left" in={true} timeout={500}>
                <NotesIcon style={{ fontSize: '2rem', color: '#FFC107' }} />
              </Slide>
              <Typography variant="body1" style={{ marginLeft: '10px' }}>{event.extendedProps.notes || 'No notes provided'}</Typography>
            </DetailBox>
          </Grid>
        </Grid>
      </StyledPaper>
    </Fade>
  );
};

export default EventDetails;
