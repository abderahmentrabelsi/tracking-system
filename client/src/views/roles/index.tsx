import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import RoleCards from './RoleCards';
import RolesTable from './RolesTable';
import type { UsersType } from '@/types/userTypes';

const Roles = ({ userData }: { userData?: UsersType[] }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' className='mbe-1'>
          Roles List
        </Typography>
        <Typography>
          A role provides access to predefined menus and features so that, depending on the assigned role, an administrator
          can have access to what they need.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <RoleCards />
      </Grid>
      <Grid item xs={12} className='!pbs-12'>
        <Typography variant='h4' className='mbe-1'>
          Total users with their roles
        </Typography>
        <Typography>Find all of your company's administrator accounts and their associated roles.</Typography>
      </Grid>
      <Grid item xs={12}>
        <RolesTable tableData={userData} />
      </Grid>
    </Grid>
  );
};

export default Roles;
