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
import { styled } from '@mui/material/styles'
import { rankItem } from '@tanstack/match-sorter-utils'
import type { FilterFn } from '@tanstack/react-table'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from '@tanstack/react-table'

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
type UsersType = UserResponse & { role: string, onBoardingStatus: string }

// Column Definitions
const columnHelper = createColumnHelper<UsersType>()

const roleMapping: { [key: number]: string } = {
  1: 'Admin',
  2: 'Employee',
  3: 'Manager'
}

const roleColors: { [key: string]: { icon: string; color: 'error' | 'warning' | 'info' | 'success' | 'primary' } } = {
  Admin: { icon: 'tabler-crown', color: 'error' },
  Employee: { icon: 'tabler-device-desktop', color: 'warning' },
  Manager: { icon: 'tabler-edit', color: 'info' }
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
        role: roleMapping[user.roleId],
        onBoardingStatus: user.onBoardingStatus // Assuming the status is part of user response
      }))
      setData(mappedUsers)
      setFilteredData(mappedUsers)
    }
    fetchData()
  }, [])

  const columns = useMemo(() => [
    columnHelper.accessor('username', {
      header: 'Username',
      cell: info => info.getValue()
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
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Icon
            className={roleColors[row.original.role].icon}
            sx={{ color: `var(--mui-palette-${roleColors[row.original.role].color}-main)` }}
          />
          <Typography className='capitalize' color='text.primary'>
            {row.original.role}
          </Typography>
        </div>
      )
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
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => (
        <IconButton onClick={() => handleRowClick(row.original)}>
          <i className='tabler-eye text-[22px] text-textSecondary' />
        </IconButton>
      )
    }
  ], [])

  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)
    addMeta({
      itemRank,
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
              <tr key={row.id} onClick={() => handleRowClick(row.original)} className='cursor-pointer'>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {cell.column.id === 'username' ? (
                      <div className='flex items-center'>
                        {getAvatar(row.original)}
                        <Typography sx={{ ml: 2 }}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Typography>
                      </div>
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </td>
                ))}
              </tr>
            ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          component='div'
          count={data.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
          onRowsPerPageChange={event => table.setPageSize(Number(event.target.value))}
        />
      </Card>
      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>User Details</DialogTitle>
        {selectedUser && (
          <DialogContent>
            <p>ID: {selectedUser.ID}</p>
            <p>Username: {selectedUser.username}</p>
            <p>Email: {selectedUser.email}</p>
            <p>First Name: {selectedUser.firstName}</p>
            <p>Last Name: {selectedUser.lastName}</p>
            <p>Job Title: {selectedUser.jobTitle}</p>
            <p>Phone Number: {selectedUser.phoneNumber}</p>
            <p>Address: {selectedUser.address}</p>
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
