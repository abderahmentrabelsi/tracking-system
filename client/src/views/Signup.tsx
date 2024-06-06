'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Alert, { AlertColor } from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import CustomTextField from '@core/components/mui/TextField'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import Avatar from '@mui/material/Avatar'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import { useDropzone } from 'react-dropzone'
import { SystemMode } from '@core/types'

type FormDataType = {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  departmentID: string | number
  roleName: string | null
  username: string
}

type RoleType = {
  ID: number
  name: string
}

type DepartmentType = {
  ID: number
  name: string
}

type FileProp = {
  name: string
  type: string
  size: number
}

const fetchRoles = async (): Promise<RoleType[]> => {
  const response = await axios.get('http://localhost:8383/roles', { withCredentials: true })
  if (response.status !== 200) throw new Error('Failed to fetch roles')
  return response.data.data // Adjusting to access the data array in the response
}

const fetchDepartments = async (): Promise<DepartmentType[]> => {
  const response = await axios.get('http://localhost:8383/departments', { withCredentials: true })
  if (response.status !== 200) throw new Error('Failed to fetch departments')
  return response.data.data // Adjusting to access the data array in the response
}

const FormLayoutsSeparator = ({ mode }: { mode: SystemMode }) => {
  const [formData, setFormData] = useState<FormDataType>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    username: '',
    departmentID: '',
    roleName: ''
  })

  const [open, setOpen] = useState(false)
  const [alert, setAlert] = useState<{ severity: AlertColor, message: string }>({ severity: "info", message: "" })

  const [files, setFiles] = useState<File[]>([])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      setFiles(acceptedFiles.map((file: File) => Object.assign(file)))
    }
  })

  const renderFilePreview = (file: FileProp) => {
    if (file.type.startsWith('image')) {
      return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file as any)} />
    } else {
      return <i className='tabler-file-description' />
    }
  }

  const handleRemoveFile = (file: FileProp) => {
    const uploadedFiles = files
    const filtered = uploadedFiles.filter((i: FileProp) => i.name !== file.name)

    setFiles([...filtered])
  }

  const fileList = files.map((file: FileProp) => (
    <ListItem key={file.name}>
      <div className='file-details'>
        <div className='file-preview'>{renderFilePreview(file)}</div>
        <div>
          <Typography className='file-name'>{file.name}</Typography>
          <Typography className='file-size' variant='body2'>
            {Math.round(file.size / 100) / 10 > 1000
              ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
              : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`}
          </Typography>
        </div>
      </div>
      <IconButton onClick={() => handleRemoveFile(file)}>
        <i className='tabler-x text-xl' />
      </IconButton>
    </ListItem>
  ))

  const handleRemoveAllFiles = () => {
    setFiles([])
  }

  const { data: roles, isError: rolesError, isLoading: rolesLoading } = useQuery<RoleType[]>({
    queryKey: ['roles'],
    queryFn: fetchRoles
  })
  const { data: departments, isError: departmentsError, isLoading: departmentsLoading } = useQuery<DepartmentType[]>({
    queryKey: ['departments'],
    queryFn: fetchDepartments
  })

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      departmentID: '',
      roleName: '',
      username: '',
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

  const fetchUploadedFiles = async () => {
    const response = await axios.get('http://localhost:8383/files');
    if (response.status !== 200) throw new Error('Failed to fetch files');
    return response.data;
  }

  useEffect(() => {
    fetchUploadedFiles().then(files => {
      // Handle the files and display them
    }).catch(error => {
      console.error("Error fetching files:", error);
    });
  }, []);


  const handleFileUpload = async () => {
    const uploadPromises = files.map(async (file) => {
      const res = await axios.post('http://localhost:8383/files/', null, {
        headers: {
          'Tus-Resumable': '1.0.0',
          'Upload-Length': file.size.toString(),
          'Upload-Metadata': `filename ${btoa(file.name)},size ${btoa(file.size.toString())}`
        }
      });

      const fileId = res.headers['location'].split('/').pop();
      const fileUploadUrl = `http://localhost:8383/files/${fileId}`;
      const fileReader = new FileReader();

      fileReader.onload = async (event: ProgressEvent<FileReader>) => {
        const target = event.target;
        if (target && target.result) {
          const fileContent = target.result;
          await axios.patch(fileUploadUrl, fileContent, {
            headers: {
              'Content-Type': 'application/offset+octet-stream',
              'Upload-Offset': '0', // You may need to handle the offset if uploading in chunks
              'Tus-Resumable': '1.0.0'
            }
          });

          return {
            fileId,
            fileName: file.name,
            filePath: `/files/${fileId}`,
            size: file.size
          };
        }
      };

      fileReader.readAsArrayBuffer(file);
    });

    try {
      const uploadedFiles = await Promise.all(uploadPromises);
      await axios.post('http://localhost:8383/hooks/upload', uploadedFiles);
      setAlert({
        severity: "success",
        message: "Files uploaded successfully"
      });
    } catch (error) {
      setAlert({
        severity: "error",
        message: "An error occurred while uploading files"
      });
    } finally {
      setOpen(true);
      setTimeout(() => setOpen(false), 90000); // Close the alert after 1 minute and 30 seconds
    }
  }

  if (rolesLoading || departmentsLoading) return <div>Loading...</div>
  if (rolesError || departmentsError) return <div>Error loading data</div>

  return (
    <Card>
      <CardHeader title="Add User" />
      <Divider />
      <form onSubmit={handleSignup}>
        <CardContent>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Typography variant='body2' className='font-medium'>
                1. Personal Details
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                required
                fullWidth
                label='First Name'
                placeholder='Enter your first name'
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                required
                fullWidth
                label='Last Name'
                placeholder='Enter your last name'
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                required
                fullWidth
                label='Username'
                placeholder='Enter your username'
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                required
                fullWidth
                label='Phone Number'
                placeholder='Enter your phone number'
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                required
                fullWidth
                label='Email'
                placeholder='Enter your email'
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body2' className='font-medium'>
                2. Organization Details
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                required
                fullWidth
                select
                label='Department'
                value={formData.departmentID}
                onChange={e => setFormData({ ...formData, departmentID: e.target.value })}
              >
                {departments?.map((department: DepartmentType) => (
                  <MenuItem key={department.ID} value={department.ID}>
                    {department.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                required
                fullWidth
                select
                label='Role'
                value={formData.roleName}
                onChange={e => setFormData({ ...formData, roleName: e.target.value })}
              >
                {roles?.map((role: RoleType) => (
                  <MenuItem key={role.ID} value={role.name}>
                    {role.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body2' className='font-medium'>
                3. Upload Files
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                <div className='flex items-center flex-col'>
                  <Avatar variant='rounded' className='bs-12 is-12 mbe-9'>
                    <i className='tabler-upload' />
                  </Avatar>
                  <Typography variant='h4' className='mbe-2.5'>
                    Drop files here or click to upload.
                  </Typography>
                  <Typography>
                    Drop files here or click{' '}
                    <a href='/' onClick={e => e.preventDefault()} className='text-textPrimary no-underline'>
                      browse
                    </a>{' '}
                    thorough your machine
                  </Typography>
                </div>
              </div>
              {files.length ? (
                <>
                  <List>{fileList}</List>
                  <div className='buttons'>
                    <Button color='error' variant='outlined' onClick={handleRemoveAllFiles}>
                      Remove All
                    </Button>
                    <Button variant='contained' onClick={handleFileUpload}>Upload Files</Button>
                  </div>
                </>
              ) : null}
            </Grid>
          </Grid>
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
            variant='tonal'
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
