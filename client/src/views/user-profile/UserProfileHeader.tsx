'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Avatar from 'react-avatar'
import Chip from '@mui/material/Chip'
import { useEffect, useState } from 'react'

// Type Imports
import type { ProfileHeaderType } from '@/types/profileTypes'
import { fetchUserDetails, UserDetails } from '@/utils/userUtils'

// Function to generate a color based on department name
const stringToColor = (string: string): string => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

// Function to determine if a color is light or dark
const isColorDark = (color: string): boolean => {
  const r = parseInt(color.substr(1, 2), 16);
  const g = parseInt(color.substr(3, 2), 16);
  const b = parseInt(color.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
};

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

  const departmentColor = userDetails ? stringToColor(userDetails.departmentName) : '#000';
  const textColor = isColorDark(departmentColor) ? '#fff' : '#000';

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
              {userDetails?.jobTitle && (
                <Chip
                  label={userDetails.jobTitle}
                  style={{ backgroundColor: departmentColor, color: textColor }}
                />
              )}
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
