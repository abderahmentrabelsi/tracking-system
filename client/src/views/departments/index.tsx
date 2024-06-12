'use client'

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, MenuItem, TablePagination } from '@mui/material';
import { createColumnHelper, useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';

// Define interfaces
interface DepartmentType {
  ID: number;
  name: string;
  supervisorId: number;
  CreatedAt: string;
  clientName: string;
}

interface ClientType {
  ID: number;
  name: string;
}

// Create column helper
const columnHelper = createColumnHelper<DepartmentType>();

const Departments = () => {
  // States
  const [, setClients] = useState<ClientType[]>([]);
  const [departmentsData, setDepartmentsData] = useState<DepartmentType[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [globalFilter, setGlobalFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [editValue, setEditValue] = useState<DepartmentType | null>(null);
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [supervisorId, setSupervisorId] = useState('');

  // Fetch clients and departments data
  useEffect(() => {
    const fetchClientsAndDepartments = async () => {
      try {
        const clientsResponse = await axios.get('http://localhost:8383/client', { withCredentials: true });

        if (clientsResponse.status === 200) {
          const clientData = clientsResponse.data.data as ClientType[];

          setClients(clientData);

          const allDepartmentsData: DepartmentType[] = [];

          for (const client of clientData) {
            const departmentsResponse = await axios.get(`http://localhost:8383/departments/${client.name}`, { withCredentials: true });

            if (departmentsResponse.status === 200) {
              const departmentData = departmentsResponse.data.data as DepartmentType[];
              const departmentsWithClientName = departmentData.map(department => ({ ...department, clientName: client.name }));

              allDepartmentsData.push(...departmentsWithClientName);
            } else {
              throw new Error(`Failed to fetch departments for client ${client.name}`);
            }
          }

          setDepartmentsData(allDepartmentsData);
        } else {
          throw new Error('Failed to fetch clients');
        }
      } catch (error) {
        console.error('Error fetching clients and departments data:', error);
      }
    };

    fetchClientsAndDepartments();
  }, []);

  // Define columns
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Department',
      cell: ({ row }) => <Typography>{row.original.name}</Typography>,
    }),
    columnHelper.accessor('clientName', {
      header: 'Client',
      cell: ({ row }) => <Typography>{row.original.clientName}</Typography>,
    }),
    columnHelper.accessor('supervisorId', {
      header: 'Supervisor',
      cell: ({ row }) => <Typography>{row.original.supervisorId}</Typography>,
    }),
    columnHelper.accessor('CreatedAt', {
      header: 'Created At',
      cell: ({ row }) => <Typography>{row.original.CreatedAt}</Typography>,
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
      ),
    }),
  ], []);

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
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: ({ pageIndex, pageSize }) => {
      setPage(pageIndex);
      setRowsPerPage(pageSize);
    }
  });

  // Add department handler
  const handleAddDepartment = async () => {
    try {
      const response = await axios.post('http://localhost:8383/department/create', {
        name,
        clientName,
        supervisorId: Number(supervisorId)
      }, { withCredentials: true });

      if (response.status === 201) {
        setDepartmentsData(prevData => [...prevData, response.data.data]);
        setOpen(false);
      } else {
        console.error('Failed to create department');
      }
    } catch (error) {
      console.error('Error creating department:', error);
    }
  };

  // Edit department handler
  const handleEditDepartment = (department: DepartmentType) => {
    setEditValue(department);
    setName(department.name);
    setClientName(department.clientName);
    setSupervisorId(String(department.supervisorId));
    setOpen(true);
  };

  // Update department handler
  const handleUpdateDepartment = async () => {
    if (!editValue) return;

    try {
      const response = await axios.put(`http://localhost:8383/department/update/${editValue.ID}`, {
        name,
        supervisorId: Number(supervisorId)
      }, { withCredentials: true });

      if (response.status === 200) {
        setDepartmentsData(prevData => prevData.map(dep => dep.ID === editValue.ID ? { ...dep, name, supervisorId: Number(supervisorId) } : dep));
        setOpen(false);
      } else {
        console.error('Failed to update department');
      }
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };

  // Delete department handler
  const handleDeleteDepartment = async (departmentId: number) => {
    try {
      const response = await axios.delete(`http://localhost:8383/department/delete/${departmentId}`, { withCredentials: true });

      if (response.status === 200) {
        setDepartmentsData(prevData => prevData.filter(dep => dep.ID !== departmentId));
      } else {
        console.error('Failed to delete department');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
    }
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
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value, 10);

                    setRowsPerPage(newSize);
                    setPage(0); // Reset to the first page when changing rows per page
                  }}
                  className="is-[70px]"
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
              </TextField>
            </div>
            <div className='flex flex-wrap gap-4'>
              <TextField
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(String(e.target.value))}
                  placeholder='Search Departments'
                  fullWidth
              />
              <Button variant="contained" onClick={() => setOpen(true)} style={{ backgroundColor: '#FFC107', color: '#fff' }}>Add Department</Button>
            </div>
          </CardContent>
          <Table>
            <TableHead>
              <TableRow>
                {table.getHeaderGroups().map(headerGroup => (
                    headerGroup.headers.map(header => (
                        <TableCell key={header.id}>
                          {header.isPlaceholder ? null : (
                              flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </TableCell>
                    ))
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                    ))}
                  </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
              component="div"
              count={departmentsData.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
          />
        </Card>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>{editValue ? 'Edit Department' : 'Add Department'}</DialogTitle>
          <DialogContent>
            <TextField
                margin="dense"
                label="Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <TextField
                margin="dense"
                label="Client Name"
                fullWidth
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
            />
            <TextField
                margin="dense"
                label="Supervisor ID"
                fullWidth
                value={supervisorId}
                onChange={(e) => setSupervisorId(e.target.value)}
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
  );
};

export default Departments;
