import React, { useState } from 'react';
import {
  Card, CardContent, Typography, Grid, Avatar, Box, IconButton, Divider,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import HistoryIcon from '@mui/icons-material/History';
import TimesheetHistory from './TimesheetHistory';  // Ensure the import path is correct

interface UserCardProps {
  user: any;  // Replace with actual UserType if available
  departmentName: string;
}

const UserCard: React.FC<UserCardProps> = ({ user, departmentName }) => {
  const [showHistory, setShowHistory] = useState(false);

  const handleHistoryClick = () => {
    setShowHistory(true);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  return (
    <>
      <Card
        sx={{
          margin: '10px',
          padding: '20px',
          width: '100%',
          maxWidth: '500px',
          transition: 'transform 0.3s, box-shadow 0.3s',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
          },
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Avatar
                alt={user.firstName}
                src={`https://randomuser.me/api/portraits/men/${user.ID}.jpg`}
                sx={{ width: 80, height: 80, border: '2px solid #3f51b5' }}
              />
            </Grid>
            <Grid item xs={12} sm={7}>
              <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <EmailIcon sx={{ color: '#3f51b5', mr: 1 }} />
                <Typography color="textSecondary">{user.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <BusinessIcon sx={{ color: '#3f51b5', mr: 1 }} />
                <Typography color="textSecondary">Department: {departmentName}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <IconButton onClick={handleHistoryClick} sx={{ color: '#3f51b5' }}>
                  <HistoryIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <TimesheetHistory userFullName={`${user.firstName} ${user.lastName}`} userId={user.ID} open={showHistory} onClose={handleCloseHistory} />
    </>
  );
};

export default UserCard;
