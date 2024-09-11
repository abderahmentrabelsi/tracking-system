'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import TablePagination from '@mui/material/TablePagination'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import { rankItem } from '@tanstack/match-sorter-utils'
import type { FilterFn } from '@tanstack/react-table'

// Third-party Imports
import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel
} from '@tanstack/react-table'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Fetch Function Import
import { fetchAllUsers, UserResponse } from '@/utils/userUtils'

// Component Imports
import TableFilters from './TableFilters'
import { ThemeColor } from '@core/types'

// Type Imports
type UsersType = UserResponse & { role: string; onBoardingStatus: string; DepartmentName: string }

// Column Definitions
const columnHelper = createColumnHelper<UsersType>()

// Define icons for roles
const roleIcons: { [key: string]: string } = {
  Admin: 'tabler-crown',
  Employee: 'tabler-device-desktop',
  Manager: 'tabler-edit'
}

const roleColors: { [key: string]: { icon: string; color: 'error' | 'warning' | 'info' | 'success' | 'primary' } } = {
  Admin: { icon: roleIcons.Admin, color: 'error' },
  Employee: { icon: roleIcons.Employee, color: 'warning' },
  Manager: { icon: roleIcons.Manager, color: 'info' }
}

const onboardingStatusColors: { [key: string]: ThemeColor } = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

// Styled Components
const Icon = styled('i')({})

const UserListTable = () => {
  const [data, setData] = useState<UsersType[]>([])
  const [filteredData, setFilteredData] = useState<UsersType[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<UsersType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const users = await fetchAllUsers()
      const mappedUsers = users.map(user => ({
        ...user,
        role: user.Role.name, // Updated to use role name
        onBoardingStatus: user.onBoardingStatus,
        DepartmentName: user.Department?.name || 'N/A'
      }))
      setData(mappedUsers)
      setFilteredData(mappedUsers)
    }
    fetchData()
  }, [])

  const columns = useMemo(
    () => [
      columnHelper.accessor('username', {
        header: 'Username',
        cell: ({ row }) => (
          <div className='flex items-center'>
            {getAvatar(row.original)}
            <Typography sx={{ ml: 2 }}>{row.getValue()}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('onBoardingStatus', {
        header: 'Onboarding Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              className='capitalize'
              label={row.original.onBoardingStatus}
              color={onboardingStatusColors[row.original.onBoardingStatus] || 'default'}
              size='small'
            />
          </div>
        )
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: ({ row }) => {
          const roleColor = roleColors[row.original.role] || { icon: 'tabler-user', color: 'primary' }
          return (
            <div className='flex items-center gap-2'>
              <Icon className={roleColor.icon} sx={{ color: `var(--mui-palette-${roleColor.color}-main)` }} />
              <Typography className='capitalize' color='text.primary'>
                {row.original.role}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('firstName', {
        header: 'First Name',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('lastName', {
        header: 'Last Name',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('jobTitle', {
        header: 'Job Title',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('DepartmentName', {
        header: 'Department',
        cell: info => info.getValue()
      }),
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <IconButton onClick={() => handleRowClick(row.original)}>
            <i className='tabler-eye text-[22px] text-textSecondary' />
          </IconButton>
        )
      }
    ],
    []
  )

  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)
    addMeta({
      itemRank
    })
    return itemRank.passed
  }

  const handleRowClick = (user: UsersType) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedUser(null)
  }

  const getAvatar = (user: UsersType) => {
    if (user.picture) {
      return <Avatar src={user.picture} alt={`${user.firstName} ${user.lastName}`} sx={{ width: 38, height: 38 }} />
    } else {
      return (
        <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main' }}>
          {getInitials(`${user.firstName} ${user.lastName}`)}
        </Avatar>
      )
    }
  }

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter },
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <>
      <Card>
        <CardHeader title='User List' />
        <TableFilters setData={setFilteredData} tableData={data} />
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} onClick={() => handleRowClick(row.original)}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={table.getPageCount()}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={page => table.setPageIndex(page)}
          onRowsPerPageChange={rowsPerPage => table.setPageSize(Number(rowsPerPage))}
        />
      </Card>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth='md'>
        <DialogTitle>User Details</DialogTitle>
        {selectedUser && (
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                {getAvatar(selectedUser)}
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant='h6'>
                  {selectedUser.firstName} {selectedUser.lastName}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>Username:</strong> {selectedUser.username}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>Email:</strong> {selectedUser.email}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>Role:</strong> {selectedUser.role}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>Job Title:</strong> {selectedUser.jobTitle}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>Department:</strong> {selectedUser.DepartmentName}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>Status:</strong> {selectedUser.onBoardingStatus}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>Phone Number:</strong> {selectedUser.phoneNumber}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>Address:</strong> {selectedUser.address}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>Source of Hire:</strong> {selectedUser.sourceOfHire}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>Contract:</strong> {selectedUser.contract?.contractType || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default UserListTable
