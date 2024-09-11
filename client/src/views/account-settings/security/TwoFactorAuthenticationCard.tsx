'use client'
// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import type { ButtonProps } from '@mui/material/Button'

// Type Imports
import Link from '@components/Link'

// Component Imports
import TwoFactorAuth from './two-factor-auth'
import { checkTOTPStatus, disableTOTP, enableTOTP, generateTOTP } from '../../../utils/userUtils'
import { useState, useEffect } from 'react'

const TwoFactorAuthenticationCard = () => {
  const [isTOTPEnabled, setIsTOTPEnabled] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [totpData, setTotpData] = useState<{ secret: string; qr_code: string } | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkTOTPStatus()
        setIsTOTPEnabled(status)
      } catch (error) {
        console.error('Error checking TOTP status:', error)
      }
    }

    checkStatus()
  }, [])

  const handleDisableTOTP = async () => {
    try {
      await disableTOTP()
      setIsTOTPEnabled(false)
    } catch (error) {
      console.error('Error disabling TOTP:', error)
    }
  }

  const handleEnableTOTP = async () => {
    try {
      const data = await generateTOTP() // Trigger TOTP generation
      setTotpData(data) // Store the TOTP data for use in the dialog
      await enableTOTP()
      setIsTOTPEnabled(true)
      setIsDialogOpen(true)
    } catch (error) {
      console.error('Error generating TOTP:', error)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  const handleStatusChange = () => {
    setIsTOTPEnabled(true)
    handleDialogClose()
  }

  const buttonProps: ButtonProps = {
    variant: 'contained',
    children: isTOTPEnabled ? 'Disable two-factor authentication' : 'Enable two-factor authentication',
    onClick: isTOTPEnabled ? handleDisableTOTP : handleEnableTOTP
  }

  return (
    <>
      <Card>
        <CardHeader title='Two-steps verification' />
        <CardContent className='flex flex-col items-start gap-6'>
          <div className='flex flex-col gap-4'>
            <Typography variant='h5' color='text.secondary'>
              {isTOTPEnabled
                ? 'Two-factor authentication is enabled.'
                : 'Two-factor authentication is not enabled yet.'}
            </Typography>
            <Typography>
              Two-factor authentication adds an additional layer of security to your account by requiring more than just
              a password to log in.
              <Link className='text-primary'>Learn more.</Link>
            </Typography>
          </div>
          <Button {...buttonProps} />
        </CardContent>
      </Card>
      <TwoFactorAuth open={isDialogOpen} setOpen={setIsDialogOpen} onStatusChange={handleStatusChange} />
    </>
  )
}

export default TwoFactorAuthenticationCard
