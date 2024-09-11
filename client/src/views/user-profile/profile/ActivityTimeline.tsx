'use client'

import * as React from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { fetchUserDetailsByUsername, fetchSupervisorDetailsByDepartmentID, UserDetails } from '@/utils/userUtils'
import ProgressLinearWithLabel from '@/components/ProgressLinearWithLabel'

const ActionAreaCard = () => {
  const { username } = useParams<{ username: string }>()

  const {
    data: userDetails,
    isError: isUserError,
    isLoading: isUserLoading
  } = useQuery<UserDetails>({
    queryKey: ['userDetails', username],
    queryFn: async () => {
      const details = await fetchUserDetailsByUsername(username)
      if (!details) {
        throw new Error('User not found')
      }
      return details
    }
  })

  const departmentID = userDetails?.departmentId

  const {
    data: supervisorDetails,
    isError: isSupervisorError,
    isLoading: isSupervisorLoading
  } = useQuery<UserDetails>({
    queryKey: ['supervisorDetails', departmentID],
    queryFn: async () => {
      if (!departmentID) {
        throw new Error('Department ID not found')
      }
      const details = await fetchSupervisorDetailsByDepartmentID(departmentID)
      if (!details) {
        throw new Error('Supervisor not found')
      }
      return details
    },
    enabled: !!departmentID
  })

  if (isUserLoading || isSupervisorLoading) return <ProgressLinearWithLabel />
  if (isUserError || isSupervisorError || !supervisorDetails) return <div>Error loading supervisor details</div>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: '100%' }}>
          <CardActionArea sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 2 }}>
            <CardMedia
              component='img'
              sx={{ width: 240, height: 240, borderRadius: '50%' }}
              image={supervisorDetails.picture || '/static/images/default-avatar.png'}
              alt='Supervisor Picture'
            />
            <CardContent>
              <Typography variant='h6' component='div'>
                Supervisor Name:
              </Typography>
              <Typography gutterBottom variant='h5' component='div'>
                {`${supervisorDetails.firstName} ${supervisorDetails.lastName}`}
              </Typography>
              <Typography variant='h6' component='div'>
                Email:
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {supervisorDetails.email}
              </Typography>
              <Typography variant='h6' component='div'>
                Phone Number:
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {supervisorDetails.phoneNumber}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ActionAreaCard
