'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

// Components Imports
import CustomTextField from '@core/components/mui/TextField'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { SystemMode } from '@core/types'

type FormDataType = {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  departmentID: number | ''
  role: string
  date: Date | null
  isPasswordShown: boolean
  confirmPassword: string
  isConfirmPasswordShown: boolean
  username: string
  password: string
}

const FormLayoutsSeparator = ({ mode }: { mode: SystemMode }) => {
  // States
  const [formData, setFormData] = useState<FormDataType>({
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '1234567890',
    email: 'john.doe@example.com',
    departmentID: '',
    role: 'Employee',
    date: null,
    isPasswordShown: false,
    confirmPassword: '',
    isConfirmPasswordShown: false,
    username: '',
    password: ''
  })

  const handleClickShowPassword = () => setFormData(show => ({ ...show, isPasswordShown: !show.isPasswordShown }))

  const handleClickShowConfirmPassword = () =>
    setFormData(show => ({ ...show, isConfirmPasswordShown: !show.isConfirmPasswordShown }))

  const handleReset = () => {
    setFormData({
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      email: 'john.doe@example.com',
      departmentID: '',
      role: 'Employee',
      date: null,
      isPasswordShown: false,
      confirmPassword: '',
      isConfirmPasswordShown: false,
      username: '',
      password: ''
    })
  }

  return (
    <Card>
      <CardHeader title='Add user' />
      <Divider />
      <form onSubmit={e => e.preventDefault()}>
        <CardContent>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Typography variant='body2' className='font-medium'>
                1. Account Details
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='UserName'
                placeholder='johnDoe '
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                type='email'
                label='Email'
                value={formData.email}
                placeholder='john.doe@example.com'
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Password'
                placeholder='············'
                id='form-layout-separator-password'
                type={formData.isPasswordShown ? 'text' : 'password'}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                        aria-label='toggle password visibility'
                      >
                        <i className={formData.isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Confirm Password'
                placeholder='············'
                id='form-layout-separator-confirm-password'
                type={formData.isConfirmPasswordShown ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={e => e.preventDefault()}
                        aria-label='toggle confirm password visibility'
                      >
                        <i className={formData.isConfirmPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body2' className='font-medium'>
                2. Personal Info
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='First Name'
                placeholder='John'
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Last Name'
                placeholder='Doe'
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Phone Number'
                type='text'
                placeholder='1234567890'
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                select
                fullWidth
                label='Department'
                value={formData.departmentID}
                onChange={e => setFormData({ ...formData, departmentID: Number(e.target.value) })}              >
                <MenuItem value=''>Select Department</MenuItem>
                <MenuItem value={1}>Department 1</MenuItem>
                <MenuItem value={2}>Department 2</MenuItem>
                <MenuItem value={3}>Department 3</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                select
                fullWidth
                label='Role'
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value='Employee'>Employee</MenuItem>
                <MenuItem value='Manager'>Manager</MenuItem>
                <MenuItem value='Admin'>Admin</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <AppReactDatepicker
                selected={formData.date}
                showYearDropdown
                showMonthDropdown
                onChange={(date: Date) => setFormData({ ...formData, date })}
                placeholderText='MM/DD/YYYY'
                customInput={<CustomTextField fullWidth label='Birth Date' placeholder='MM-DD-YYYY' />}
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions>
          <Button type='submit' variant='contained' className='mie-2'>
            Submit
          </Button>
          <Button
            type='reset'
            variant='tonal'
            color='secondary'
            onClick={() => {
              handleReset()
            }}
          >
            Reset
          </Button>
        </CardActions>
      </form>
    </Card>
  )
}

export default FormLayoutsSeparator
