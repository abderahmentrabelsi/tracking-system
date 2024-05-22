import Permissions from '@views/permissions';
import type { PermissionRowType } from '@/types/permissionTypes';

const getData = async () => {
  const res = await fetch('https://api.example.com/apps/permissions'); // replace with your static URL

  if (!res.ok) {
    throw new Error('Failed to fetch permissions data');
  }

  return res.json();
};

const PermissionsApp = async () => {
  // Static permissions data for testing purposes
  const staticPermissionsData: PermissionRowType[] = [
    {
      id: 1,
      name: 'Manage Users',
      assignedTo: 'admin',
      createdDate: '2023-01-01',
    },
    {
      id: 2,
      name: 'Edit Content',
      assignedTo: ['editor', 'admin'],
      createdDate: '2023-02-01',
    },
    // Add more permissions as needed
  ];

  // Use static data instead of fetching from the API
  const data: PermissionRowType[] = staticPermissionsData;

  return <Permissions permissionsData={data} />;
};

export default PermissionsApp;
