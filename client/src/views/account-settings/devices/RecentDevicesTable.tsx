'use client'
import React, { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Pagination from '@mui/material/Pagination'
import tableStyles from '@core/styles/table.module.css'
import { fetchLoginHistory, LoginHistory } from '../../../utils/userUtils'
import jwt from 'jsonwebtoken'

const getUserIdFromToken = (token: string): number | null => {
  try {
    const decoded = jwt.decode(token) as { UserID: string }
    return decoded ? parseInt(decoded.UserID, 10) : null
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

const extractBrowserAndOS = (userAgent: string): { browser: string; os: string } => {
  let browser = 'Unknown Browser'
  let os = 'Unknown OS'

  if (userAgent.includes('Chrome')) {
    browser = 'Chrome'
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari'
  }

  if (userAgent.includes('Windows NT')) {
    os = 'Windows'
  } else if (userAgent.includes('Mac OS X')) {
    os = 'MacOS'
  } else if (userAgent.includes('Linux')) {
    os = 'Linux'
  }

  return { browser, os }
}

const getIcon = (browser: string, os: string) => {
  const iconMapping: { [key: string]: JSX.Element } = {
    Chrome: <i className='tabler-brand-chrome text-[22px] text-info' />,
    Firefox: <i className='tabler-brand-firefox text-[22px] text-warning' />,
    Safari: <i className='tabler-brand-apple text-[22px] text-secondary' />,
    Windows: <i className='tabler-brand-windows text-[22px] text-info' />,
    MacOS: <i className='tabler-brand-apple text-[22px] text-secondary' />,
    Linux: <i className='tabler-brand-linux text-[22px] text-danger' />
  }

  return (
    <div className='flex items-center gap-2.5'>
      {iconMapping[browser] || iconMapping[os] || <i className='tabler-device-mobile text-[22px] text-error' />}
      <Typography className='font-medium' color='text.primary'>
        {browser} on {os}
      </Typography>
    </div>
  )
}

const ITEMS_PER_PAGE = 5

const RecentDevicesTable: React.FC = () => {
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchHistory = async () => {
      console.error('Fetching login history')
      debugger
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1]
      if (token) {
        const userId = getUserIdFromToken(token)
        if (userId) {
          const data = await fetchLoginHistory(userId)
          setLoginHistory(data)
        }
      }
      setLoading(false)
    }

    fetchHistory()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  const paginatedData = loginHistory.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <Card>
      <CardHeader title='Recent Devices' />
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Browser</th>
              <th>Device</th>
              <th>Location</th>
              <th>Recent Activities</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((history, index) => {
              const { browser, os } = extractBrowserAndOS(history.loginDevice)
              return (
                <tr key={index}>
                  <td>{getIcon(browser, os)}</td>
                  <td>
                    <Typography>{os}</Typography>
                  </td>
                  <td>
                    <Typography>{history.location}</Typography> {/* Update this line */}
                  </td>
                  <td>
                    <Typography>{new Date(history.loginTime).toLocaleString()}</Typography>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className='flex justify-center mt-4'>
          <Pagination
            count={Math.ceil(loginHistory.length / ITEMS_PER_PAGE)}
            page={page}
            onChange={handlePageChange}
            color='primary'
            variant='tonal'
          />
        </div>
      </div>
    </Card>
  )
}

export default RecentDevicesTable
