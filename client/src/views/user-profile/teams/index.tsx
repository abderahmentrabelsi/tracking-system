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
import type { Department, User } from '@/utils/userUtils'
import { fetchUserDetails, fetchUsersByDepartment, UserDetails } from '@/utils/userUtils'

// Function to render initials
const getInitials = (name: string) => {
  const nameParts = name.split(' ');
  if (nameParts.length === 1) return nameParts[0].charAt(0);
  return nameParts[0].charAt(0) + nameParts[1].charAt(0);
}

// Function to get a random color for the chip
const getRandomColor = () => {
  const colors: Array<'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'> = ['default', 'primary', 'secondary', 'success', 'error', 'warning', 'info'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Function to render department cards
const renderDepartmentCards = (departments: Department[]) => {
  return departments.map((department) => (
    <Grid item key={department.ID} xs={12} md={6} lg={4}>
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
              total={department.users.length}
              sx={{ '& .MuiAvatar-root': { width: '2rem', height: '2rem', fontSize: '1rem' } }}
              className='items-center pull-up'
            >
              {department.users.map((user, index) => (
                <Tooltip key={`${department.ID}-${user.id}-${index}`} title={`${user.firstName} ${user.lastName}`}>
                  <Avatar>{getInitials(`${user.firstName} ${user.lastName}`)}</Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
            <div className='flex items-center gap-2'>
              <Chip variant='tonal' size='small' label={department.name} color={getRandomColor()} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Grid>
  ))
}

const Teams = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])

  useEffect(() => {
    const loadUserDetails = async () => {
      const details = await fetchUserDetails()
      if (details) {
        setUserDetails(details)

        // Log department details
        console.log('Departments:', details.departments);

        // Fetch users for each department
        const updatedDepartments = await Promise.all(details.departments.map(async (department) => {
          if (department.ID) {  // Use correct property name for ID
            const users = await fetchUsersByDepartment(department.ID)
            return { ...department, users }
          } else {
            return { ...department, users: [] }
          }
        }))

        setDepartments(updatedDepartments)
      } else {
        console.error("Failed to fetch user details");
      }
    }

    loadUserDetails()
  }, [])

  return (
    <Grid container spacing={6}>
      {userDetails && (
        <Grid item xs={12}>
          <Typography variant='h4'>{userDetails.clientName}</Typography>
        </Grid>
      )}
      {departments && renderDepartmentCards(departments)}
    </Grid>
  )
}

export default Teams
