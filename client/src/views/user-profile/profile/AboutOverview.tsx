'use client'
import Grid from '@mui/material/Grid';
import { useParams } from 'next/navigation';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { Icon } from '@iconify/react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ProfileTeamsType, ProfileCommonType } from '@/types/profileTypes';
import { fetchUserDetailsByUsername, UserDetails } from '@/utils/userUtils';

const renderList = (list: ProfileCommonType[]) => {
  return (
    list.length > 0 &&
    list.map((item, index) => (
      <div key={index} className='flex items-center gap-2'>
        <Icon icon={item.icon} />
        <div className='flex items-center flex-wrap gap-2'>
          <Typography className='font-medium'>
            {`${item.property.charAt(0).toUpperCase() + item.property.slice(1)}:`}
          </Typography>
          <Typography>{item.value.charAt(0).toUpperCase() + item.value.slice(1)}</Typography>
        </div>
      </div>
    ))
  );
};

const renderTeams = (teams: ProfileTeamsType[]) => {
  return (
    teams.length > 0 &&
    teams.map((item, index) => (
      <div key={index} className='flex items-center flex-wrap gap-2'>
        <Icon icon={item.icon} />
        <Typography className='font-medium'>
          {item.property.charAt(0).toUpperCase() + item.property.slice(1)}
        </Typography>
        <Typography>{item.value.charAt(0).toUpperCase() + item.value.slice(1)}</Typography>
      </div>
    ))
  );
};

const AboutOverview = () => {
  const { username } = useParams<{ username: string }>();

  const { data: userDetails, isError, isLoading } = useQuery<UserDetails>({
    queryKey: ['userDetails', username],
    queryFn: async () => {
      const details = await fetchUserDetailsByUsername(username);
      if (!details) {
        throw new Error('User not found');
      }
      return details;
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !userDetails) return <div>Error loading user details</div>;

  const about = [
    { property: 'full name', value: `${userDetails.firstName} ${userDetails.lastName}`, icon: 'mdi:account' },
    { property: 'status', value: 'Active', icon: 'mdi:check-circle' },  // Static data example
    { property: 'role', value: 'Developer', icon: 'mdi:crown' },  // Static data example
    { property: 'country', value: userDetails.address || 'USA', icon: 'mdi:flag' },
  ];

  const contacts = [
    { property: 'contact', value: userDetails.phoneNumber || '(123) 456-7890', icon: 'mdi:phone' },
    { property: 'email', value: userDetails.email || 'John.doe@example.com', icon: 'mdi:email' }
  ];

  const teams = [
    { property: 'client name', value: userDetails.clientName || 'Unknown', icon: 'mdi:briefcase' },
    { property: 'department name', value: userDetails.departmentName || 'Unknown', icon: 'mdi:office-building' }
  ];

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent className='flex flex-col gap-6'>
            <div className='flex flex-col gap-4'>
              <Typography className='uppercase' variant='body2' color='text.disabled'>
                About
              </Typography>
              {renderList(about)}
            </div>
            <div className='flex flex-col gap-4'>
              <Typography className='uppercase' variant='body2' color='text.disabled'>
                Contacts
              </Typography>
              {renderList(contacts)}
            </div>
            <div className='flex flex-col gap-4'>
              <Typography className='uppercase' variant='body2' color='text.disabled'>
                Teams
              </Typography>
              {renderTeams(teams)}
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AboutOverview;
