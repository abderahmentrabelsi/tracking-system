'use client'

import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import AvatarGroup from '@mui/material/AvatarGroup'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'

// Type Imports
import type { Department } from '@/utils/userUtils'
import { fetchUserDetails, UserDetails } from '@/utils/userUtils'

// Function to render initials
const getInitials = (name: string) => {
  const nameParts = name.split(' ');
  if (nameParts.length === 1) return nameParts[0].charAt(0);
  return nameParts[0].charAt(0) + nameParts[1].charAt(0);
}

// Function to get a random color for the chip
const getRandomColor = () => {
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Function to determine if a color is light or dark
const isColorDark = (color: string): boolean => {
  const r = parseInt(color.substr(1, 2), 16);
  const g = parseInt(color.substr(3, 2), 16);
  const b = parseInt(color.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

// Function to render department cards
const renderDepartmentCards = (departments: Department[]) => {
  return departments.map((department, index) => {
    const chipColor = getRandomColor();
    const textColor = isColorDark(chipColor) ? '#fff' : '#000';

    return (
      <Grid item key={index} xs={12} md={6} lg={4}>
        <Card>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <Avatar className='bs-[38px] is-[38px]'>{getInitials(department.name)}</Avatar>
                <Typography variant='h5'>{department.name}</Typography>
              </div>
              <div className='flex items-center'>
                <IconButton size='small'>
                  <i className='tabler-star text-textDisabled' />
                </IconButton>
              </div>
            </div>
            <Typography>Department {department.name}</Typography>
            <div className='flex items-center justify-between flex-wrap gap-4'>
              <AvatarGroup
                total={3}
                sx={{ '& .MuiAvatar-root': { width: '2rem', height: '2rem', fontSize: '1rem' } }}
                className='items-center pull-up'
              >
                <Tooltip title="Member 1">
                  <Avatar>{getInitials("Member 1")}</Avatar>
                </Tooltip>
                <Tooltip title="Member 2">
                  <Avatar>{getInitials("Member 2")}</Avatar>
                </Tooltip>
                <Tooltip title="Member 3">
                  <Avatar>{getInitials("Member 3")}</Avatar>
                </Tooltip>
              </AvatarGroup>
              <div className='flex items-center gap-2'>
                <Chip
                  variant='tonal'
                  size='small'
                  label={department.name}
                  style={{ backgroundColor: chipColor, color: textColor }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
    );
  })
}

const Teams = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)

  useEffect(() => {
    fetchUserDetails().then(data => {
      if (data) {
        setUserDetails(data)
      }
    }).catch(error => console.error(error))
  }, [])

  return (
    <Grid container spacing={6}>
      {userDetails && (
        <Grid item xs={12}>
          <Typography variant='h4'>{userDetails.clientName}</Typography>
        </Grid>
      )}
      {userDetails && userDetails.departments && (
        renderDepartmentCards(userDetails.departments)
      )}
    </Grid>
  )
}

export default Teams
