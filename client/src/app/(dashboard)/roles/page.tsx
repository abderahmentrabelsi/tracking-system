import Roles from '@views/roles';
import type { UsersType } from '@/types/userTypes';

const getData = async () => {
  const res = await fetch('https://api.example.com/apps/user-list'); // replace with your static URL

  if (!res.ok) {
    throw new Error('Failed to fetch userData');
  }

  return res.json();
};

const RolesApp = async () => {
  // Static user data for testing
  const staticUserData: UsersType[] = [
    {
      id: 1,
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      company: 'Example Inc.',
      country: 'USA',
      contact: '1234567890',
      role: 'admin',
      currentPlan: 'Pro',
      billing: 'Monthly',
      status: 'active',
      avatar: null,
    },
    {
      id: 2,
      fullName: 'Jane Smith',
      username: 'janesmith',
      email: 'jane.smith@example.com',
      company: 'Example LLC',
      country: 'Canada',
      contact: '0987654321',
      role: 'editor',
      currentPlan: 'Free',
      billing: 'Yearly',
      status: 'pending',
      avatar: null,
    },
    // Add more users as needed
  ];

  const data: UsersType[] = staticUserData;

  return <Roles userData={data} />;
};

export default RolesApp;
