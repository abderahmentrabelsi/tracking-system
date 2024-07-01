'use client'

import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import AvatarGroup from '@mui/material/AvatarGroup'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Modal from '@mui/material/Modal'
import Box from '@mui/material/Box'
import CloseIcon from '@mui/icons-material/Close'
import Avatar from '@mui/material/Avatar'
import { useParams } from 'next/navigation'

import type { Department, User, UserDetails } from '@/utils/userUtils'
import { fetchUserDetailsByUsername } from '@/utils/userUtils'

const getInitials = (name: string) => {
  const nameParts = name.split(' ')
  if (nameParts.length === 1) return nameParts[0].charAt(0)
  return nameParts[0].charAt(0) + nameParts[1].charAt(0)
}

const getRandomColor = () => {
  const colors: Array<'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'> = ['default', 'primary', 'secondary', 'success', 'error', 'warning', 'info']
  return colors[Math.floor(Math.random() * colors.length)]
}

const renderDepartmentCards = (departments: Department[], handleOpenModal: (users: User[]) => void) => {
  return departments.map((department) => (
    <Grid item key={department.ID} xs={12} md={6} lg={4}>
      <Card>
        <CardContent className='flex flex-col gap-4'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <Avatar>{getInitials(department.name)}</Avatar>
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
              max={4}
              sx={{ '& .MuiAvatar-root': { width: '2rem', height: '2rem', fontSize: '1rem' } }}
              className='items-center pull-up'
            >
              {department.users && department.users.slice(0, 3).map((user, index) => (
                <Tooltip key={`${department.ID}-${user.id}-${index}`} title={`${user.firstName} ${user.lastName}`}>
                  <Avatar>{getInitials(`${user.firstName} ${user.lastName}`)}</Avatar>
                </Tooltip>
              ))}
              {department.users && department.users.length > 3 && (
                <Tooltip title='Show more'>
                  <Avatar onClick={() => handleOpenModal(department.users.slice(3))}>
                    +{department.users.length - 3}
                  </Avatar>
                </Tooltip>
              )}
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
  const { username } = useParams<{ username: string }>() // Ensure username is treated as string
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalUsers, setModalUsers] = useState<User[]>([])

  useEffect(() => {
    const getUserDetails = async () => {
      if (username) {
        const details = await fetchUserDetailsByUsername(username)
        if (details) {
          setUserDetails(details)
        }
      }
    }

    getUserDetails()
  }, [username])

  const handleOpenModal = (users: User[]) => {
    setModalUsers(users)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  return (
    <Grid container spacing={6}>
      {userDetails && (
        <Grid item xs={12}>
          <Typography variant='h4'>{userDetails.clientName}</Typography>
        </Grid>
      )}
      {userDetails?.departments && renderDepartmentCards(userDetails.departments, handleOpenModal)}

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby='user-list-modal'
        aria-describedby='user-list-modal-description'
      >
        <Box sx={{ maxWidth: 400, bgcolor: 'background.paper', p: 4, mx: 'auto', my: '10%', borderRadius: 1, position: 'relative' }}>
          <IconButton
            aria-label='close'
            onClick={handleCloseModal}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant='h6' id='user-list-modal' sx={{ mb: 2 }}>
            Additional Users
          </Typography>
          <div>
            {modalUsers.map(user => (
              <Box key={user.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2 }}>{getInitials(`${user.firstName} ${user.lastName}`)}</Avatar>
                <Typography>{`${user.firstName} ${user.lastName}`}</Typography>
              </Box>
            ))}
          </div>
        </Box>
      </Modal>
    </Grid>
  )
}

export default Teams
