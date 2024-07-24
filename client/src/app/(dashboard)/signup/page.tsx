// Next Imports
import type { Metadata } from 'next';

// Component Imports
import Register from '@views/signup/Signup';

// Server Action Imports
import { checkAuth } from '../../../utils/checkAuth';
import { getServerMode } from '@core/utils/serverHelpers';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Register to your account',
};

const RegisterPage = async () => {
  checkAuth();

  // Vars
  const mode = getServerMode();

  return <Register mode={mode} />;
};

export default RegisterPage;
