'use client'
import React, { useState, useEffect } from 'react'

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
import Alert, { AlertColor } from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

// Components Imports
import CustomTextField from '@core/components/mui/TextField'
import type { SystemMode } from '@core/types'

type FormDataType = {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  departmentID: string | number
  roleName: string | null
}

type RoleType = {
  ID: number
  name: string
}

const FormLayoutsSeparator =({ mode }: { mode: SystemMode }) => {
  const [formData, setFormData] = useState<FormDataType>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    departmentID: '',
    roleName: null
  })

  const [open, setOpen] = useState(false)
  const [alert, setAlert] = useState<{ severity: AlertColor, message: string }>({ severity: "info", message: "" })
  const [roles, setRoles] = useState<RoleType[]>([])

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:8383/roles', { withCredentials: true })
        setRoles(response.data.data)
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

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      const response = await axios.post('http://localhost:8383/signup', formData, { withCredentials: true })
      if (response.status === 200) {
        setAlert({ severity: "success", message: `User created successfully. <br />Email: ${response.data.email}<br />Password: ${response.data.default_password}` })
      } else {
        setAlert({ severity: "error", message: response.data.error })
      }
      setOpen(true)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setAlert({ severity: "error", message: error.response.data.error })
        } else if (error.request) {
          setAlert({ severity: "error", message: "No response from server" })
        } else {
          setAlert({ severity: "error", message: "Failed to send request" })
        }
      } else {
        setAlert({ severity: "error", message: "An unknown error occurred" })
      }
      setOpen(true)
    }
  }

  return (
    <Card style={{ width: "50%" }}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
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
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpen(false)} severity={alert.severity} sx={{ width: '100%' }}>
          <span dangerouslySetInnerHTML={{ __html: alert.message }} />
        </Alert>
      </Snackbar>
    </Card>
  )
}

export default FormLayoutsSeparator
