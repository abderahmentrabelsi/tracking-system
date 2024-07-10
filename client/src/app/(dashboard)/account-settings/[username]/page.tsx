import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import AccountSettings from '@views/account-settings';

const AccountSettingsPage = async ({ params }: { params: { username: string } }) => {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;
  let isAuthorized = false;

  if (token) {
    const payload = jwt.decode(token) as jwt.JwtPayload;
    if (payload && payload.Username === params.username) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    redirect('/notauthorized');
  }

  const Account = dynamic(() => import('@views/account-settings/account'));
  const Security = dynamic(() => import('@views/account-settings/security'));
  const Notifications = dynamic(() => import('@views/account-settings/notifications'));
  const RecentDevicesTable = dynamic(() => import('@views/account-settings/devices/RecentDevicesTable'));

  const tabContentList: { [key: string]: React.ReactElement } = {
    account: <Account />,
    security: <Security />,
    notifications: <Notifications />,
    recentDevices: <RecentDevicesTable />
  };

  return <AccountSettings tabContentList={tabContentList} mode="light" />;
};

export default AccountSettingsPage;
