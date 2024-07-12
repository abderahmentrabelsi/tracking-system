import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  calendarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '16px',
  },
  eventCard: {
    marginBottom: '8px',
    borderLeft: '5px solid',
  },
  chipContainer: {
    marginTop: '8px',
  },
});

export default useStyles;
