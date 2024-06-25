'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Avatar from 'react-avatar'

// Type Imports
import type { ProfileHeaderType } from '@/types/profileTypes'

// Utility Imports
import { useEffect, useState } from 'react'
import { fetchUserDetails, UserDetails } from '@/utils/userUtils'

const UserProfileHeader = ({ data }: { data?: ProfileHeaderType }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)

  useEffect(() => {
    const getUserDetails = async () => {
      const details = await fetchUserDetails()
      if (details) {
        setUserDetails(details)
      }
    }

    getUserDetails()
  }, [])

  return (
    <Card>
      <CardMedia image={data?.coverImg} className='bs-[250px]' />
      <CardContent className='flex gap-5 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
        <div className='flex rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-be-0 border-backgroundPaper bg-backgroundPaper'>
          {userDetails ? (
            <Avatar
              name={`${userDetails.firstName} ${userDetails.lastName}`}
              round
              size="120"
              color=''  // Enables random background color
            />
          ) : (
            <Avatar
              name="Unknown User"
              round
              size="120"
              color=''  // Enables random background color
            />
          )}
        </div>
        <div className='flex is-full justify-start self-end flex-col items-center gap-6 sm-gap-0 sm:flex-row sm:justify-between sm:items-end '>
          <div className='flex flex-col items-center sm:items-start gap-2'>
            <Typography variant='h4'>{userDetails ? userDetails.firstName : ''}</Typography>
            <div className='flex flex-wrap gap-6 justify-center sm:justify-normal'>
              <div className='flex items-center gap-2'>
                {data?.designationIcon && <i className={data?.designationIcon} />}
                <Typography className='font-medium'>{data?.designation}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-map-pin' />
                <Typography className='font-medium'>{userDetails ? userDetails.address : ''}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-calendar' />
                <Typography className='font-medium'>{userDetails ? new Date(userDetails.createdAt).toLocaleDateString() : ''}</Typography>
              </div>
            </div>
          </div>
          <Button variant='contained' className='flex gap-2'>
            <i className='tabler-user-check !text-base'></i>
            <span>Connected</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfileHeader
