'use client'

// React Imports
import { useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

interface AccountSettingsProps {
  tabContentList: { [key: string]: ReactElement };
  mode: string;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ tabContentList, mode }) => {
  // States
  const [activeTab, setActiveTab] = useState('account')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='tabler-users text-lg' />
                  Account
                </div>
              }
              value='account'
            />
            <Tab
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='tabler-lock text-lg' />
                  Security
                </div>
              }
              value='security'
            />
            <Tab
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='tabler-bell text-lg' />
                  Notifications
                </div>
              }
              value='notifications'
            />
            <Tab
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='tabler-device-desktop text-lg' />
                  Recent Devices
                </div>
              }
              value='recentDevices'
            />
          </CustomTabList>
        </Grid>
        <Grid item xs={12}>
          <TabPanel value={activeTab} className='p-0'>
            {tabContentList[activeTab]}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default AccountSettings
