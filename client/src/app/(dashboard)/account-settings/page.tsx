// Next Imports
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

// Component Imports
const AccountSettings = dynamic(() => import('@views/account-settings'), { ssr: false })

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Metadata
export const metadata: Metadata = {
  title: 'Account Settings',
  description: 'Manage your account settings'
}

const AccountSettingsPage = async () => {
  const mode = getServerMode()

  // Import the content for each tab dynamically
  const Account = dynamic(() => import('@views/account-settings/account'))
  const Security = dynamic(() => import('@views/account-settings/security'))
  const Notifications = dynamic(() => import('@views/account-settings/notifications'))
  const Connections = dynamic(() => import('@views/account-settings/connections'))

  // Mock tab content list, replace with actual content components if necessary
  const tabContentList = {
    account: <Account />,
    security: <Security />,
    notifications: <Notifications />,
    connections: <Connections />,
  }

  return <AccountSettings tabContentList={tabContentList} mode={mode} />
}

export default AccountSettingsPage
