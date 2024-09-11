'use client'

import React, { useState } from 'react'
import { Card, CardContent, Typography, Box, Avatar, Divider, useTheme } from '@mui/material'
import { Pagination } from '@mui/lab'
import { Event, Work, MeetingRoom } from '@mui/icons-material'

const EventList = ({ events, handleEventDetailClick, getEventColor }: any) => {
  const [page, setPage] = useState(1)
  const eventsPerPage = 8 // Number of events per page
  const totalPages = Math.ceil(events.length / eventsPerPage)
  const theme = useTheme()

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  const paginatedEvents = events.slice((page - 1) * eventsPerPage, page * eventsPerPage)

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'Project':
        return <Work fontSize='small' />
      case 'Meeting':
        return <MeetingRoom fontSize='small' />
      default:
        return <Event fontSize='small' />
    }
  }

  return (
    <Box>
      <Typography variant='h6' mb={2}>
        Upcoming Events
      </Typography>
      <Box
        sx={{
          maxHeight: '400px',
          overflowY: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': {
            width: '0.4em'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.main,
            borderRadius: '2px'
          }
        }}
      >
        {paginatedEvents.map((event: any) => (
          <Card
            key={event.id}
            variant='outlined'
            sx={{
              mb: 1,
              cursor: 'pointer',
              borderLeft: `5px solid ${getEventColor(event.extendedProps.priority)}`,
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
            onClick={() => handleEventDetailClick(event)}
          >
            <CardContent sx={{ p: 1 }}>
              <Box display='flex' alignItems='center'>
                <Avatar sx={{ bgcolor: getEventColor(event.extendedProps.priority), width: 24, height: 24 }}>
                  {getEventTypeIcon(event.extendedProps.type)}
                </Avatar>
                <Box ml={2} flex='1'>
                  <Typography variant='subtitle2' noWrap>
                    {event.title}
                  </Typography>
                  <Typography variant='body2' color='textSecondary' noWrap>
                    {new Date(event.start).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
      {totalPages > 1 && (
        <Box mt={2} display='flex' justifyContent='center'>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} />
        </Box>
      )}
    </Box>
  )
}

export default EventList
