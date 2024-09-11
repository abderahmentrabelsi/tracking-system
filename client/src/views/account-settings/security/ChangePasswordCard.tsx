'use client'

import { useState } from 'react'
import { updateUserPassword } from '@/utils/userUtils'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import CustomTextField from '@core/components/mui/TextField'

const ChangePasswordCard = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isCurrentPasswordShown, setIsCurrentPasswordShown] = useState(false)
  const [isNewPasswordShown, setIsNewPasswordShown] = useState(false)
  const [isConfirmNewPasswordShown, setIsConfirmNewPasswordShown] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleClickShowCurrentPassword = () => setIsCurrentPasswordShown(!isCurrentPasswordShown)
  const handleClickShowNewPassword = () => setIsNewPasswordShown(!isNewPasswordShown)
  const handleClickShowConfirmNewPassword = () => setIsConfirmNewPasswordShown(!isConfirmNewPasswordShown)

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New password and confirm new password do not match')
      setSuccessMessage('')
      return
    }

    try {
      await updateUserPassword({ currentPassword, newPassword })
      setSuccessMessage('Password updated successfully')
      setErrorMessage('')
    } catch (error) {
      console.error('Error updating password:', error)
      setErrorMessage('Failed to update password: ' + (error as Error).message)
      setSuccessMessage('')
    }
  }

  return (
    <Card>
      <CardHeader title='Change Password' />
      <CardContent>
        {errorMessage && (
          <Alert severity='error'>
            <AlertTitle>Error</AlertTitle>
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert severity='success'>
            <AlertTitle>Success</AlertTitle>
            {successMessage}
          </Alert>
        )}
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              fullWidth
              label='Current Password'
              type={isCurrentPasswordShown ? 'text' : 'password'}
              placeholder='············'
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={handleClickShowCurrentPassword}
                      onMouseDown={e => e.preventDefault()}
                    >
                      <i className={isCurrentPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              fullWidth
              label='New Password'
              type={isNewPasswordShown ? 'text' : 'password'}
              placeholder='············'
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton edge='end' onClick={handleClickShowNewPassword} onMouseDown={e => e.preventDefault()}>
                      <i className={isNewPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              fullWidth
              label='Confirm New Password'
              type={isConfirmNewPasswordShown ? 'text' : 'password'}
              placeholder='············'
              value={confirmNewPassword}
              onChange={e => setConfirmNewPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={handleClickShowConfirmNewPassword}
                      onMouseDown={e => e.preventDefault()}
                    >
                      <i className={isConfirmNewPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant='h6'>Password Requirements:</Typography>
            <ul>
              <li>Minimum 8 characters long - the more, the better</li>
              <li>At least one lowercase & one uppercase character</li>
              <li>At least one number, symbol, or whitespace character</li>
            </ul>
          </Grid>
          <Grid item xs={12} className='flex gap-4'>
            <Button variant='contained' onClick={handlePasswordChange}>
              Save Changes
            </Button>
            <Button
              variant='tonal'
              color='secondary'
              onClick={() => {
                setCurrentPassword('')
                setNewPassword('')
                setConfirmNewPassword('')
                setErrorMessage('')
                setSuccessMessage('')
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ChangePasswordCard
