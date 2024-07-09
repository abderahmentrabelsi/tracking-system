import React, { useState } from 'react';
import {
  Card, CardContent, Typography, Grid, Avatar, Box, IconButton,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import HistoryIcon from '@mui/icons-material/History';
import TimesheetHistory from './TimesheetHistory';

interface UserCardProps {
  user: any;  // Replace with actual UserType if available
  departmentName: string;
}

const UserCard: React.FC<UserCardProps> = ({ user, departmentName }) => {
  const [showHistory, setShowHistory] = useState(false);

  const handleHistoryClick = () => {
    setShowHistory(!showHistory);
  };

  return (
    <Card
      sx={{
        margin: '10px',
        padding: '20px',
        position: 'relative',
        width: '100%',
        maxWidth: '500px',
        minHeight: '150px',
        transition: 'transform 0.3s, box-shadow 0.3s',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        border: '1px solid black',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
          border: '1px solid #000',
        },
      }}
    >
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar
              alt={user.firstName}
              src={`https://randomuser.me/api/portraits/men/${user.ID}.jpg`}
              sx={{ width: 80, height: 80, border: '2px solid #3f51b5' }}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Grid container spacing={1} justifyContent="center" alignItems="center">
              <Grid item>
                <EmailIcon sx={{ color: '#3f51b5' }} />
              </Grid>
              <Grid item>
                <Typography color="textSecondary" align="center">{user.email}</Typography>
              </Grid>
            </Grid>
            <Grid container spacing={1} justifyContent="center" alignItems="center">
              <Grid item>
                <BusinessIcon sx={{ color: '#3f51b5' }} />
              </Grid>
              <Grid item>
                <Typography color="textSecondary" align="center">Department: {departmentName}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <IconButton onClick={handleHistoryClick} sx={{ color: '#3f51b5' }}>
              <HistoryIcon />
            </IconButton>
          </Grid>
        </Grid>
        {showHistory && (
          <Box mt={2}>
            <TimesheetHistory userId={user.ID} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCard;
