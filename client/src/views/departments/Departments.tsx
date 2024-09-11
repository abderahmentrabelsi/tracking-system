// src/views/departments/Departments.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Box,
  Snackbar,
  Alert,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Fab,
  MenuItem,
  Select
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import moment from 'moment'
import ClientCard from './ClientCard'
import {
  fetchClients,
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createClient,
  updateClient,
  deleteClient
} from '@/app/api/departmentApi'
import { fetchUserById, fetchAllUsers } from '@/app/api/userApi'
import type { DepartmentType, ClientType } from '@/types/departmentTypes'
import type { UsersType } from '@/types/userTypes'

const Departments = () => {
  const [clients, setClients] = useState<ClientType[]>([])
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null)
  const [departments, setDepartments] = useState<DepartmentType[]>([])
  const [users, setUsers] = useState<UsersType[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [open, setOpen] = useState(false)
  const [editValue, setEditValue] = useState<DepartmentType | null>(null)
  const [clientCreateOpen, setClientCreateOpen] = useState(false)
  const [clientEditValue, setClientEditValue] = useState<ClientType | null>(null)
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [supervisorId, setSupervisorId] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')
  const [clientSearchQuery, setClientSearchQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchClientsData = async () => {
      try {
        const clientsResponse = await fetchClients()
        const usersResponse = await fetchAllUsers()
        const clientsWithCounts = await Promise.all(
          clientsResponse.map(async client => {
            const departmentsResponse = await fetchDepartments(client.name)
            const employeeCount = usersResponse.filter(user =>
              departmentsResponse.some(dept => dept.ID === user.DepartmentID)
            ).length
            return { ...client, departmentCount: departmentsResponse.length, employeeCount }
          })
        )
        setClients(clientsWithCounts)
      } catch (error) {
        console.error('Error fetching clients:', error)
      }
    }

    fetchClientsData()
  }, [])

  useEffect(() => {
    if (selectedClient) {
      const fetchDepartmentsData = async () => {
        setLoadingDepartments(true)
        try {
          const departmentsResponse = await fetchDepartments(selectedClient.name)
          const departmentsWithSupervisorName = await Promise.all(
            departmentsResponse.map(async department => {
              const supervisor = await fetchUserById(department.supervisorId)
              return {
                ...department,
                supervisorName: `${supervisor.firstName} ${supervisor.lastName}`
              }
            })
          )
          setDepartments(departmentsWithSupervisorName)
          setLoadingDepartments(false)
        } catch (error) {
          console.error('Error fetching departments:', error)
          setLoadingDepartments(false)
        }
      }

      fetchDepartmentsData()
    }
  }, [selectedClient])

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const usersResponse = await fetchAllUsers()
        setUsers(usersResponse)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsersData()
  }, [])

  const handleAddDepartment = async () => {
    try {
      const newDepartment = await createDepartment({
        name,
        clientName: selectedClient!.name,
        supervisorId: Number(supervisorId)
      })
      const supervisor = await fetchUserById(newDepartment.supervisorId)
      setDepartments(prevData => [
        ...prevData,
        { ...newDepartment, supervisorName: `${supervisor.firstName} ${supervisor.lastName}` }
      ])
      setClients(prevClients =>
        prevClients.map(client =>
          client.name === selectedClient!.name ? { ...client, departmentCount: client.departmentCount + 1 } : client
        )
      )
      setOpen(false)
      setSnackbarMessage('Department added successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (error) {
      console.error('Error creating department:', error)
      setSnackbarMessage('Failed to add department')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const handleEditDepartment = (department: DepartmentType) => {
    setEditValue(department)
    setName(department.name)
    setSupervisorId(String(department.supervisorId))
    setOpen(true)
  }

  const handleUpdateDepartment = async () => {
    if (!editValue) return

    try {
      await updateDepartment(editValue.ID, { name, supervisorId: Number(supervisorId) })
      const supervisor = await fetchUserById(Number(supervisorId))
      setDepartments(prevData =>
        prevData.map(dep =>
          dep.ID === editValue.ID
            ? {
                ...dep,
                name,
                supervisorId: Number(supervisorId),
                supervisorName: `${supervisor.firstName} ${supervisor.lastName}`
              }
            : dep
        )
      )
      setOpen(false)
      setSnackbarMessage('Department updated successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (error) {
      console.error('Error updating department:', error)
      setSnackbarMessage('Failed to update department')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const handleDeleteDepartment = async (departmentId: number) => {
    try {
      await deleteDepartment(departmentId)
      setDepartments(prevData => prevData.filter(dep => dep.ID !== departmentId))
      setClients(prevClients =>
        prevClients.map(client =>
          client.name === selectedClient!.name ? { ...client, departmentCount: client.departmentCount - 1 } : client
        )
      )
      setSnackbarMessage('Department deleted successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (error) {
      console.error('Error deleting department:', error)
      setSnackbarMessage('Failed to delete department')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const handleEditClient = (client: ClientType) => {
    setClientEditValue(client)
    setClientName(client.name)
  }

  const handleUpdateClient = async () => {
    if (!clientEditValue) return

    try {
      await updateClient(clientEditValue.ID, { name: clientName })
      setClients(prevData =>
        prevData.map(client => (client.ID === clientEditValue.ID ? { ...client, name: clientName } : client))
      )
      setClientEditValue(null)
      setSnackbarMessage('Client updated successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (error) {
      console.error('Error updating client:', error)
      setSnackbarMessage('Failed to update client')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const handleDeleteClient = async (clientId: number) => {
    try {
      await deleteClient(clientId)
      setClients(prevData => prevData.filter(client => client.ID !== clientId))
      if (selectedClient && selectedClient.ID === clientId) {
        setSelectedClient(null)
      }
      setSnackbarMessage('Client deleted successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (error) {
      console.error('Error deleting client:', error)
      setSnackbarMessage('Failed to delete client')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const handleCreateClient = () => {
    setClientCreateOpen(true)
    setClientName('')
  }

  const handleAddClient = async () => {
    try {
      const newClient = await createClient({ name: clientName })
      setClients(prevData => [...prevData, { ...newClient, departmentCount: 0, employeeCount: 0 }])
      setClientCreateOpen(false)
      setSnackbarMessage('Client added successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (error) {
      console.error('Error creating client:', error)
      setSnackbarMessage('Failed to create client')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const filteredClients = clients.filter(client => client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()))

  const filteredDepartments = departments.filter(
    department =>
      department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      department.supervisorName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Department', flex: 1 },
    { field: 'supervisorName', headerName: 'Supervisor', flex: 1 },
    {
      field: 'CreatedAt',
      headerName: 'Created At',
      flex: 1,
      valueFormatter: params => moment(params.value).format('YYYY-MM-DD')
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: params => (
        <>
          <Tooltip title='Edit Department'>
            <IconButton onClick={() => handleEditDepartment(params.row)}>
              <i className='tabler-edit text-[22px] text-textSecondary' />
            </IconButton>
          </Tooltip>
          <Tooltip title='Delete Department'>
            <IconButton onClick={() => handleDeleteDepartment(params.row.ID)}>
              <i className='tabler-trash text-[22px] text-textSecondary' />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ]

  return (
    <>
      <Box mb={4}>
        <Typography variant='h4' gutterBottom>
          Organizations & Departments Management
        </Typography>
        <Typography variant='body1' color='textSecondary'>
          Manage clients and their departments. You can add, edit, or delete clients and departments.
        </Typography>
      </Box>
      <Box mb={4}>
        <Box mb={4} display='flex' alignItems='center'>
          <TextField
            label='Search Clients'
            variant='outlined'
            fullWidth
            value={clientSearchQuery}
            onChange={e => setClientSearchQuery(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ marginRight: 2 }}
          />
          <Tooltip title='Add Client'>
            <Fab color='primary' onClick={handleCreateClient}>
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
        <Grid container spacing={4}>
          {filteredClients.map(client => (
            <Grid item xs={12} sm={6} md={4} key={client.ID}>
              <ClientCard
                client={client}
                onClick={() => setSelectedClient(client)}
                onEdit={() => handleEditClient(client)}
                onDelete={() => handleDeleteClient(client.ID)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={!!selectedClient} onClose={() => setSelectedClient(null)} maxWidth='lg' fullWidth>
        <DialogTitle>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='h6'>{selectedClient?.name} Departments</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box mb={2} display='flex' alignItems='center'>
            <TextField
              label='Search Departments'
              variant='outlined'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ marginRight: 2 }}
            />
            <Tooltip title='Add Department'>
              <Fab
                color='primary'
                onClick={() => {
                  setEditValue(null)
                  setName('')
                  setSupervisorId('')
                  setOpen(true)
                }}
              >
                <AddIcon />
              </Fab>
            </Tooltip>
          </Box>
          {loadingDepartments ? (
            <Box display='flex' justifyContent='center' alignItems='center' minHeight={200}>
              <CircularProgress />
              <Typography variant='h6' color='textSecondary' ml={2}>
                Loading departments...
              </Typography>
            </Box>
          ) : (
            <Box height={400}>
              {departments.length === 0 ? (
                <Box display='flex' justifyContent='center' alignItems='center' minHeight={200}>
                  <Typography variant='h6' color='textSecondary'>
                    No departments found for this client. Add new departments using the "+" button above.
                  </Typography>
                </Box>
              ) : (
                <DataGrid rows={filteredDepartments} columns={columns} getRowId={row => row.ID} />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedClient(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editValue ? 'Edit Department' : 'Add Department'}</DialogTitle>
        <DialogContent>
          <TextField margin='dense' label='Name' fullWidth value={name} onChange={e => setName(e.target.value)} />
          <TextField
            margin='dense'
            label='Supervisor'
            fullWidth
            select
            value={supervisorId}
            onChange={e => setSupervisorId(e.target.value)}
          >
            {users.map(user => (
              <MenuItem key={user.ID} value={user.ID}>
                {`${user.firstName} ${user.lastName}`}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={editValue ? handleUpdateDepartment : handleAddDepartment}>
            {editValue ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={clientCreateOpen} onClose={() => setClientCreateOpen(false)}>
        <DialogTitle>Add Client</DialogTitle>
        <DialogContent>
          <TextField
            margin='dense'
            label='Client Name'
            fullWidth
            value={clientName}
            onChange={e => setClientName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClientCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleAddClient}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!clientEditValue} onClose={() => setClientEditValue(null)}>
        <DialogTitle>Edit Client</DialogTitle>
        <DialogContent>
          <TextField
            margin='dense'
            label='Client Name'
            fullWidth
            value={clientName}
            onChange={e => setClientName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClientEditValue(null)}>Cancel</Button>
          <Button onClick={handleUpdateClient}>Update</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default Departments
