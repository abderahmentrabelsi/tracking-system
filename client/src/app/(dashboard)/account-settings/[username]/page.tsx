// Next Imports
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

// Component Imports
const AccountSettings = dynamic(() => import('@views/account-settings'), { ssr: false });

// Metadata
export const metadata: Metadata = {
  title: 'Account Settings',
  description: 'Manage your account settings'
};

const getPayloadFromToken = (token: string) => {
  try {
    return jwt.decode(token) as jwt.JwtPayload;
  } catch (error) {
    return null;
  }
};

const AccountSettingsPage = async ({ params }: { params: { username: string } }) => {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;
  let isAuthorized = false;

  if (token) {
    const payload = getPayloadFromToken(token);
    if (payload && payload.Username === params.username) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    // Redirect to notauthorized page if not authorized
    redirect('/notauthorized');
  }

  // Import the content for each tab dynamically
  const Account = dynamic(() => import('@views/account-settings/account'));
  const Security = dynamic(() => import('@views/account-settings/security'));
  const Notifications = dynamic(() => import('@views/account-settings/notifications'));
  const RecentDevicesTable = dynamic(() => import('@views/account-settings/devices/RecentDevicesTable'));

  // Mock tab content list, replace with actual content components if necessary
  const tabContentList = {
    account: <Account />,
    security: <Security />,
    notifications: <Notifications />,
    recentDevices: <RecentDevicesTable />
  };

  return <AccountSettings tabContentList={tabContentList} mode="light" />;
};

export default AccountSettingsPage;
