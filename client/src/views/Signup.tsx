'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Card from '@mui/material/Card'
//import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
//import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Alert, { AlertColor } from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import CustomTextField from '@core/components/mui/TextField'
import type { SystemMode } from '@core/types'

type FormDataType = {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  departmentID: string | number
  roleName: string | null
  username : string
}

type RoleType = {
  ID: number
  name: string
}

type DepartmentType = {
  ID: number
  name: string
}

const FormLayoutsSeparator =({ mode }: { mode: SystemMode }) => {
  const [formData, setFormData] = useState<FormDataType>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    username: '', // Add this line
    departmentID: '',
    roleName: ''
  })

  const [open, setOpen] = useState(false)
  const [alert, setAlert] = useState<{ severity: AlertColor, message: string }>({ severity: "info", message: "" })
  const [roles, setRoles] = useState<RoleType[]>([])
  const [departments, setDepartments] = useState<DepartmentType[]>([])


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

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://localhost:8383/departments', { withCredentials: true })
        setDepartments(response.data.data)
      } catch (error) {
        console.error('Failed to fetch departments', error)
      }
    }

    fetchDepartments()
  }, [])


  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      departmentID: '',
      roleName: '',
      username: '', // Add this line
    })
  }

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault()
    const departmentID = parseInt(formData.departmentID as string)

    try {
      const response = await axios.post('http://localhost:8383/signup', { ...formData, departmentID }, { withCredentials: true })
      if (response.status === 200) {
        setAlert({
          severity: "success",
          message: `User created successfully.<br/>Email: ${response.data.data.email}<br/>Username: ${response.data.data.username}<br/>Default Password: ${response.data.data.default_password}`
        })
        setOpen(true)
        setTimeout(() => setOpen(false), 90000) // Close the alert after 1 minute and 30 seconds
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message?.error === "Username already exists") {
          setAlert({
            severity: "error",
            message: "Username already exists"
          })
        } else if (error.response?.data?.message?.error === "User already exists") {
          setAlert({
            severity: "error",
            message: "User already exists"
          })
        } else {
          setAlert({
            severity: "error",
            message: "An error occurred while creating the user"
          })
        }
      }
      setOpen(true)
      setTimeout(() => setOpen(false), 90000) // Close the alert after 1 minute and 30 seconds
    }
  }
  return (
    <Card style={{ width: "50%" }}>
      <CardHeader title="Add user" />
      <Divider />
      <form onSubmit={handleSignup}>
        <CardContent>
          <CustomTextField
            required
            fullWidth
            label='First Name'
            placeholder='Enter your first name'
            value={formData.firstName}
            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
          />
          <CustomTextField
            required
            fullWidth
            label='Last Name'
            placeholder='Enter your last name'
            value={formData.lastName}
            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
          />
          <CustomTextField
            fullWidth
            label="Username"
            placeholder="Enter your username"
            variant="outlined"
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <CustomTextField
            required
            fullWidth
            label='Phone Number'
            placeholder='Enter your phone number'
            value={formData.phoneNumber}
            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
          />
          <CustomTextField
            required
            fullWidth
            label='Email'
            placeholder='Enter your email'
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
          <CustomTextField
            required
            fullWidth
            select
            label='Department'
            placeholder='Select your department'
            value={formData.departmentID}
            onChange={e => setFormData({ ...formData, departmentID: e.target.value })}
          >
            {departments.map((department) => (
              <MenuItem key={department.ID} value={department.ID}>
                {department.name} {/* Change this line */}
              </MenuItem>
            ))}
          </CustomTextField>
          <CustomTextField
            required
            fullWidth
            select
            label='Role'
            placeholder='Select your role'
            value={formData.roleName}
            onChange={e => setFormData({ ...formData, roleName: e.target.value })}
          >
            {roles.map((role) => (
              <MenuItem key={role.ID} value={role.name}>
                {role.name}
              </MenuItem>
            ))}
          </CustomTextField>
        </CardContent>
        <Divider />
        <CardActions>
          <Button
            color='primary'
            variant='contained'
            type='submit'
          >
            Submit
          </Button>
          <Button
            color='secondary'
            variant='outlined'
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
