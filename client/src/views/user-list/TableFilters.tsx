// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'

// Type Imports
import type { UsersType } from '@/types/userTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const TableFilters = ({ setData, tableData }: { setData: any; tableData?: UsersType[] }) => {
  // States
  const [role, setRole] = useState<UsersType['role']>('')
  const [onBoardingStatus, setOnBoardingStatus] = useState<UsersType['onBoardingStatus']>('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const filteredData = tableData?.filter(user => {
      if (role && user.role !== role) return false
      if (onBoardingStatus && user.onBoardingStatus !== onBoardingStatus) return false
      if (searchTerm && !(`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || user.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()))) return false

      return true
    })

    setData(filteredData)
  }, [role, onBoardingStatus, searchTerm, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={4}>
          <CustomTextField
            select
            fullWidth
            id='select-role'
            value={role}
            onChange={e => setRole(e.target.value)}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>Select Role</MenuItem>
            <MenuItem value='Admin'>Admin</MenuItem>
            <MenuItem value='Employee'>Employee</MenuItem>
            <MenuItem value='Manager'>Manager</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <CustomTextField
            select
            fullWidth
            id='select-onboarding-status'
            value={onBoardingStatus}
            onChange={e => setOnBoardingStatus(e.target.value)}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>Select Onboarding Status</MenuItem>
            <MenuItem value='pending'>Pending</MenuItem>
            <MenuItem value='active'>Active</MenuItem>
            <MenuItem value='inactive'>Inactive</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <CustomTextField
            fullWidth
            id='search'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder='Search by name or job title'
          />
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
