import { styled } from '@mui/material/styles'

const AppFullCalendar = styled('div')(({ theme }) => ({
  '& .fc': {
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper
  },
  '& .fc-toolbar': {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2)
  },
  '& .fc-button': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark
    }
  },
  '& .fc-event': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1)
  }
}))

export default AppFullCalendar
