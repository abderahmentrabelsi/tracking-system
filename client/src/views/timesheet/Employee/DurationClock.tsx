import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { differenceInSeconds } from 'date-fns';

const primaryColor = '#110a0a'; // Use the primary color as defined in your theme

const ClockContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
  backgroundColor: 'primary',
  borderRadius: '20px',
  boxShadow: '0 0 20px rgba(0, 0, 0, 0.9)',
  marginLeft: '50px' // Adjust the value as needed
});

const Clock = styled(Box)({
  width: '48px',
  height: '48px',
  border: `4px solid ${primaryColor}`,
  borderRadius: '90%',
  position: 'relative',
  marginRight: '16px',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transformOrigin: 'bottom center',
    borderRadius: '2px',
  },
  '&::before': {
    width: '2px',
    height: '20px',
    backgroundColor: primaryColor,
    transform: 'translate(-50%, -100%) rotate(0deg)',
    animation: 'spin 60s linear infinite',
  },
  '&::after': {
    width: '2px',
    height: '15px',
    backgroundColor: primaryColor,
    transform: 'translate(-50%, -100%) rotate(0deg)',
    animation: 'spin 3600s linear infinite',
  },
  '@keyframes spin': {
    from: {
      transform: 'translate(-50%, -100%) rotate(0deg)',
    },
    to: {
      transform: 'translate(-50%, -100%) rotate(360deg)',
    },
  },
});

const DurationClock = ({ startTime }) => {
  const [secondsElapsed, setSecondsElapsed] = useState(differenceInSeconds(new Date(), new Date(startTime * 1000)));

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours}:` : ''}${minutes < 10 && hours > 0 ? `0${minutes}` : minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  return (
    <ClockContainer>
      <Clock />
      <Typography variant="h4" color="primary">
        {formatDuration(secondsElapsed)}
      </Typography>
    </ClockContainer>
  );
};

export default DurationClock;
