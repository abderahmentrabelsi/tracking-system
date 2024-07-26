'use client'

import * as React from 'react';
import { useParams } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchUserDetailsByUsername, fetchSupervisorDetailsByDepartmentID, UserDetails } from '@/utils/userUtils';
import ProgressLinearWithLabel from '@/components/ProgressLinearWithLabel';

const ActionAreaCard = () => {
  const { username } = useParams<{ username: string }>();

  const { data: userDetails, isError: isUserError, isLoading: isUserLoading } = useQuery<UserDetails>({
    queryKey: ['userDetails', username],
    queryFn: async () => {
      if (!username) {
        throw new Error('Invalid username');
      }
      const details = await fetchUserDetailsByUsername(username);
      if (!details) {
        throw new Error('User not found');
      }
      return details;
    }
  });

  const departmentID = userDetails?.departmentId;

  const { data: supervisorDetails, isError: isSupervisorError, isLoading: isSupervisorLoading } = useQuery<UserDetails>({
    queryKey: ['supervisorDetails', departmentID],
    queryFn: async () => {
      if (!departmentID) {
        throw new Error('Invalid department ID');
      }
      const details = await fetchSupervisorDetailsByDepartmentID(departmentID);
      if (!details) {
        throw new Error('Supervisor not found');
      }
      return details;
    },
    enabled: !!departmentID // This query will only run if departmentID is truthy
  });

  if (isUserLoading || isSupervisorLoading) return <ProgressLinearWithLabel />;
  if (isUserError || !userDetails || isSupervisorError || !supervisorDetails) return <div>Error loading details</div>;

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image={supervisorDetails.picture || "/static/images/default-avatar.png"}
          alt="Supervisor Picture"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {`${supervisorDetails.firstName} ${supervisorDetails.lastName}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {supervisorDetails.email}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default ActionAreaCard;
