'use client'

// React Imports
import { useEffect, useState } from 'react'

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
import Typography from '@mui/material/Typography'
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

// Type Imports
type UsersType = UserResponse

// Column Definitions
const columnHelper = createColumnHelper<UsersType>()

const UserListTable = () => {
  const [data, setData] = useState<UsersType[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<UsersType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const users = await fetchAllUsers()
      setData(users)
    }
    fetchData()
  }, [])

  const columns = [
    columnHelper.accessor('username', {
      header: 'Username',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => info.getValue()
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
      cell: ({ row }) => (
        <IconButton onClick={() => handleRowClick(row.original)}>
          <i className='tabler-eye text-[22px] text-textSecondary' />
        </IconButton>
      )
    }
  ]

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
    data,
    columns,
    state: { globalFilter },
    filterFns: { fuzzy: fuzzyFilter },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <>
      <Card>
        <CardHeader title='User List' />
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
