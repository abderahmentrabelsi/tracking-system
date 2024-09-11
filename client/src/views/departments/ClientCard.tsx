// src/views/departments/ClientCard.tsx
'use client'

import { Card, CardContent, Typography, Avatar, Grid, IconButton, Tooltip, Box } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useTheme } from '@mui/material/styles'

interface ClientCardProps {
  client: {
    ID: number
    name: string
    departmentCount: number
    employeeCount: number
  }
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onClick, onEdit, onDelete }) => {
  const theme = useTheme()
  const backgroundColor = theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[200]
  const textColor = theme.palette.text.primary
  const avatarBgColor = theme.palette.primary.main
  const iconColor = theme.palette.primary.contrastText

  return (
    <Card
      onClick={onClick}
      className='cursor-pointer'
      sx={{
        backgroundColor,
        padding: 2,
        borderRadius: 2,
        boxShadow: 3,
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          transform: 'scale(1.05)'
        }
      }}
    >
      <CardContent>
        <Grid container alignItems='center' spacing={2}>
          <Grid item>
            <Avatar sx={{ bgcolor: avatarBgColor, color: iconColor }}>{client.name.charAt(0)}</Avatar>
          </Grid>
          <Grid item xs>
            <Box display='flex' flexDirection='column'>
              <Typography variant='h5' color={textColor}>
                {client.name}
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                Departments: {client.departmentCount}
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                Employees: {client.employeeCount}
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Tooltip title='Edit Client'>
              <IconButton
                onClick={e => {
                  e.stopPropagation()
                  onEdit()
                }}
                sx={{ color: iconColor }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Delete Client'>
              <IconButton
                onClick={e => {
                  e.stopPropagation()
                  onDelete()
                }}
                sx={{ color: iconColor }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ClientCard
