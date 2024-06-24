'use client'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { Icon } from '@iconify/react'

// Type Imports
import type { ProfileTeamsType, ProfileCommonType } from '@/types/profileTypes'
import { fetchUserDetails, UserDetails } from '@/utils/userUtils'
import React, { useEffect, useState } from 'react'

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
  )
}

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
  )
}

const AboutOverview = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)

  useEffect(() => {
    fetchUserDetails()
      .then(data => {
        if (data) {
          setUserDetails(data)
        }
      })
      .catch(error => console.error(error))
  }, [])

  const about = [
    { property: 'fullName', value: `${userDetails?.firstName || ''} ${userDetails?.lastName || ''}`, icon: 'mdi:account' },
    { property: 'status', value: 'Active', icon: 'mdi:check-circle' },  // Static data example
    { property: 'role', value: 'Developer', icon: 'mdi:crown' },  // Static data example
    { property: 'country', value: userDetails?.address || 'USA', icon: 'mdi:flag' },
    { property: 'language', value: 'English', icon: 'mdi:translate' },  // Static data example
  ]

  const contacts = [
    { property: 'contact', value: userDetails?.phoneNumber || '(123) 456-7890', icon: 'mdi:phone' },
    { property: 'skype', value: 'John.doe', icon: 'mdi:chat' },  // Static data example
    { property: 'email', value: userDetails?.email || 'John.doe@example.com', icon: 'mdi:email' }
  ]

  const teams = [
    { property: 'clientName', value: userDetails?.clientName || 'Unknown', icon: 'mdi:briefcase' },
    { property: 'departmentName', value: userDetails?.departmentName || 'Unknown', icon: 'mdi:office-building' }
  ]

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
  )
}

export default AboutOverview
