import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import RoleCards from './RoleCards'
import type { UsersType } from '@/types/userTypes'

const Roles = ({ userData }: { userData?: UsersType[] }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' className='mbe-1'>
          Roles List
        </Typography>
        <Typography>
          A role provides access to predefined menus and features so that, depending on the assigned role, an
          administrator can have access to what they need.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <RoleCards />
      </Grid>
    </Grid>
  )
}

export default Roles
