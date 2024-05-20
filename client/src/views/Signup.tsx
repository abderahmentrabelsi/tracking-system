'use client'
// React Imports
import { useState, useEffect } from 'react'
import axios from 'axios' // Import axios to make HTTP requests

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
import { string } from 'prop-types'

type FormDataType = {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  departmentID: string | number // Allow departmentID to be number
  roleName: string | null
}

type RoleType = {
  ID: number
  name: string
}

const FormLayoutsSeparator = () => {
  // States
  const [formData, setFormData] = useState<FormDataType>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    departmentID: '',
    roleName: null // Initialize roleName with null
  })

  const [roles, setRoles] = useState<RoleType[]>([]) // State to store the roles

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:8383/roles', { withCredentials: true })
        setRoles(response.data)
      } catch (error) {
        console.error('Failed to fetch roles', error)
      }
    }

    fetchRoles()
  }, [])

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      departmentID: '',
      roleName: ''
    })
  }
  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:8383/signup', formData, { withCredentials: true })
      if (response.status === 200) {
        console.log('User created successfully')
        // Handle successful signup
      } else {
        console.log('Error creating user')
        // Handle error
      }
    } catch (error) {
      console.error('Failed to signup', error)
      // Handle error
    }
  }

  return (
    <Card>
      <CardHeader title="Add user" />
      <Divider />
      <form onSubmit={handleSignup}>
        <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Typography variant="body2" className="font-medium">
              1. Personal Info
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              fullWidth
              label="First Name"
              placeholder="John"
              value={formData.firstName}
              onChange={e => setFormData({ ...formData, firstName: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              fullWidth
              label="Last Name"
              placeholder="Doe"
              value={formData.lastName}
              onChange={e => setFormData({ ...formData, lastName: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              fullWidth
              label="Phone Number"
              type="text"
              placeholder="1234567890"
              value={formData.phoneNumber}
              onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              fullWidth
              type="email"
              label="Email"
              value={formData.email}
              placeholder="john.doe@example.com"
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              fullWidth
              label="Department"
              value={formData.departmentID}
              onChange={e => setFormData({ ...formData, departmentID: Number(e.target.value) })}
            />
          </Grid> <Grid item xs={12} sm={6}>
          <CustomTextField
            select
            fullWidth
            label="Role"
            value={formData.roleName}
            onChange={e => setFormData({ ...formData, roleName: e.target.value })}
          >
            <MenuItem value="">Select Role</MenuItem>
            {roles.map(role => (
              <MenuItem key={role.ID} value={role.name}>{role.name}</MenuItem>
            ))}
          </CustomTextField>
        </Grid>
        </Grid>
      </CardContent>
        <Divider />
        <CardActions>
          <Button type="submit" variant="contained" className="mie-2">
            Submit
          </Button>
          <Button
            type="reset"
            variant="tonal"
            color="secondary"
            onClick={handleReset}
          >
            Reset
          </Button>
        </CardActions>
      </form>
    </Card>
  )
}

export default FormLayoutsSeparator
