'use client'

import React, { useEffect, useState, useMemo } from 'react'

import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  MenuItem,
  TablePagination,
  TextFieldProps
} from '@mui/material'
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'

import type { DepartmentType, ClientType } from '@/types/departmentTypes'
import {
  fetchClients,
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '@/app/api/departmentApi'

const columnHelper = createColumnHelper<DepartmentType>()

const Departments = () => {
  const [, setClients] = useState<ClientType[]>([])
  const [departmentsData, setDepartmentsData] = useState<DepartmentType[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [globalFilter, setGlobalFilter] = useState('')
  const [open, setOpen] = useState(false)
  const [editValue, setEditValue] = useState<DepartmentType | null>(null)
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [supervisorId, setSupervisorId] = useState('')

  useEffect(() => {
    const fetchClientsAndDepartments = async () => {
      try {
        const clientsResponse = await fetchClients()
        const allDepartmentsData: React.SetStateAction<DepartmentType[]> = []

        for (const client of clientsResponse) {
          const departmentsResponse = await fetchDepartments(client.name)

          const departmentsWithClientName = departmentsResponse.map(department => ({
            ...department,
            clientName: client.name
          }))

          allDepartmentsData.push(...departmentsWithClientName)
        }

        setClients(clientsResponse)
        setDepartmentsData(allDepartmentsData)

        // After setting departmentsData, initialize the table
        table.setState(state => ({
          ...state,
          data: allDepartmentsData,
          pagination: {
            ...state.pagination,
            pageCount: Math.ceil(allDepartmentsData.length / rowsPerPage) // Calculate pageCount
          }
        }))
      } catch (error) {
        console.error('Error fetching clients and departments data:', error)
      }
    }

    fetchClientsAndDepartments()
  }, [])

  // Define columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Department',
        cell: ({ row }) => <Typography>{row.original.name}</Typography>
      }),
      columnHelper.accessor('clientName', {
        header: 'Client',
        cell: ({ row }) => <Typography>{row.original.clientName}</Typography>
      }),
      columnHelper.accessor('supervisorId', {
        header: 'Supervisor',
        cell: ({ row }) => <Typography>{row.original.supervisorId}</Typography>
      }),
      columnHelper.accessor('CreatedAt', {
        header: 'Created At',
        cell: ({ row }) => <Typography>{row.original.CreatedAt}</Typography>
      }),
      columnHelper.display({
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleEditDepartment(row.original)}>
              <i className='tabler-edit text-[22px] text-textSecondary' />
            </IconButton>
            <IconButton onClick={() => handleDeleteDepartment(row.original.ID)}>
              <i className='tabler-trash text-[22px] text-textSecondary' />
            </IconButton>
          </div>
        )
      })
    ],
    []
  )

  // Setup table
  const table = useReactTable({
    data: departmentsData,
    columns,
    filterFns: { fuzzy: rankItem },
    state: { globalFilter, pagination: { pageIndex: page, pageSize: rowsPerPage } },
    globalFilterFn: rankItem,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter, // Ensure onGlobalFilterChange updates the globalFilter state
    onPaginationChange: ({ pageIndex, pageSize }) => {
      setPage(pageIndex)
      setRowsPerPage(pageSize)
    }
  })

  // Add department handler
  const handleAddDepartment = async () => {
    try {
      const newDepartment = await createDepartment({
        name,
        clientName,
        supervisorId: Number(supervisorId)
      })

      setDepartmentsData(prevData => [...prevData, newDepartment])
      setOpen(false)
    } catch (error) {
      console.error('Error creating department:', error)
    }
  }

  // Edit department handler
  const handleEditDepartment = (department: DepartmentType) => {
    setEditValue(department)
    setName(department.name)
    setClientName(department.clientName)
    setSupervisorId(String(department.supervisorId))
    setOpen(true)
  }

  // Update department handler
  const handleUpdateDepartment = async () => {
    if (!editValue) return

    try {
      await updateDepartment(editValue.ID, {
        name,
        supervisorId: Number(supervisorId)
      })
      setDepartmentsData(prevData =>
        prevData.map(dep => (dep.ID === editValue.ID ? { ...dep, name, supervisorId: Number(supervisorId) } : dep))
      )
      setOpen(false)
    } catch (error) {
      console.error('Error updating department:', error)
    }
  }

  // Delete department handler
  const handleDeleteDepartment = async (departmentId: number) => {
    try {
      await deleteDepartment(departmentId)
      setDepartmentsData(prevData => prevData.filter(dep => dep.ID !== departmentId))
    } catch (error) {
      console.error('Error deleting department:', error)
    }
  }

  const DebouncedInput = ({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
  }: {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
  } & Omit<TextFieldProps, 'onChange'>) => {
    // States
    const [value, setValue] = useState(initialValue);

    // Update internal state when initialValue changes
    React.useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    // Debounce changes to value and call onChange after debounce time
    React.useEffect(() => {
      const timeout = setTimeout(() => {
        onChange(value);
      }, debounce);

      return () => clearTimeout(timeout);
    }, [value, onChange, debounce]);

    return <TextField {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
  };

  return (
    <>
      <Card>
        <CardContent className='flex flex-col gap-4 sm:flex-row items-start sm:items-center justify-between flex-wrap'>
          <div className='flex items-center gap-2'>
            <Typography>Show</Typography>
            <TextField
              select
              value={rowsPerPage}
              onChange={e => {
                const newSize = parseInt(e.target.value, 10)

                setRowsPerPage(newSize)
                setPage(0) // Reset to the first page when changing rows per page
              }}
              className='is-[70px]'
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
            </TextField>
          </div>
          <div className='flex gap-4'>
            <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder='Search Departments'
                className='is-full sm:is-auto'
              fullWidth
            />
            <Button
              variant='contained'
              onClick={() => setOpen(true)}
              className='is-full sm:is-auto'
              startIcon={<i className='tabler' />}
            >
              CREATE Department
            </Button>
          </div>
        </CardContent>
        <Table>
          <TableHead>
            <TableRow>
              {table
                .getHeaderGroups()
                .map(headerGroup =>
                  headerGroup.headers.map(header => (
                    <TableCell key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))
                )}
            </TableRow>
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component='div'
          count={departmentsData.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={event => {
            setRowsPerPage(parseInt(event.target.value, 10))
            setPage(0)
          }}
        />
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editValue ? 'Edit Department' : 'Add Department'}</DialogTitle>
        <DialogContent>
          <TextField margin='dense' label='Name' fullWidth value={name} onChange={e => setName(e.target.value)} />
          <TextField
            margin='dense'
            label='Client Name'
            fullWidth
            value={clientName}
            onChange={e => setClientName(e.target.value)}
          />
          <TextField
            margin='dense'
            label='Supervisor ID'
            fullWidth
            value={supervisorId}
            onChange={e => setSupervisorId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={editValue ? handleUpdateDepartment : handleAddDepartment}>
            {editValue ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Departments
