'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Alert, { AlertColor } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CustomTextField from '@core/components/mui/TextField';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Avatar from '@mui/material/Avatar';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import { useDropzone } from 'react-dropzone';
import { SystemMode } from '@core/types';
import ProgressLinearWithLabel from '@components/ProgressLinearWithLabel';

type FormDataType = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  departmentID: string | number;
  roleName: string | null;
  username: string;
  clientName: string;
  jobTitle: string;
  sourceOfHire: string;
  reportingManager: string;
  gender: string;
  maritalStatus: string;
  address: string;
  educationDetails: EducationDetail[];
  emergencyContacts: EmergencyContact[];
};

type EducationDetail = {
  userId: number;
  instituteName: string;
  diploma: string;
  specialization: string;
};

type EmergencyContact = {
  userId: number;
  name: string;
  number: string;
};

type RoleType = {
  ID: number;
  name: string;
};

type DepartmentType = {
  ID: number;
  name: string;
};

type ClientType = {
  ID: number;
  name: string;
};

type FileProp = {
  name: string;
  type: string;
  size: number;
};

const fetchRoles = async (): Promise<RoleType[]> => {
  const response = await axios.get('http://localhost:8383/roles', { withCredentials: true });
  if (response.status !== 200) throw new Error('Failed to fetch roles');
  return response.data.data;
};

const fetchClients = async (): Promise<ClientType[]> => {
  const response = await axios.get('http://localhost:8383/client/', { withCredentials: true });
  if (response.status !== 200) throw new Error('Failed to fetch clients');
  return response.data.data;
};

const fetchDepartmentsByClient = async (clientName: string): Promise<DepartmentType[]> => {
  const response = await axios.get(`http://localhost:8383/departments/${clientName}`, { withCredentials: true });
  if (response.status !== 200) throw new Error('Failed to fetch departments');
  return response.data.data;
};

const FormLayoutsSeparator = ({ mode }: { mode: SystemMode }) => {
  const [formData, setFormData] = useState<FormDataType>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    username: '',
    departmentID: '',
    roleName: '',
    clientName: '',
    jobTitle: '',
    sourceOfHire: '',
    reportingManager: '',
    gender: '',
    maritalStatus: '',
    address: '',
    educationDetails: [{ userId: 1, instituteName: '', diploma: '', specialization: '' }],
    emergencyContacts: [{ userId: 1, name: '', number: '' }]
  });

  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({
    email: false,
    username: false,
    phoneNumber: false
  });

  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState<{ severity: AlertColor, message: string }>({ severity: "info", message: "" });
  const [files, setFiles] = useState<File[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      setFiles(acceptedFiles.map((file: File) => Object.assign(file)));
    }
  });

  const renderFilePreview = (file: FileProp) => {
    if (file.type.startsWith('image')) {
      return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file as any)} />;
    } else {
      return <i className='tabler-file-description' />;
    }
  };

  const handleRemoveFile = (file: FileProp) => {
    const uploadedFiles = files;
    const filtered = uploadedFiles.filter((i: FileProp) => i.name !== file.name);
    setFiles([...filtered]);
  };

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
  ));

  const handleRemoveAllFiles = () => {
    setFiles([]);
  };

  const { data: roles, isError: rolesError, isLoading: rolesLoading } = useQuery<RoleType[]>({
    queryKey: ['roles'],
    queryFn: fetchRoles
  });
  const { data: clients, isError: clientsError, isLoading: clientsLoading } = useQuery<ClientType[]>({
    queryKey: ['clients'],
    queryFn: fetchClients
  });

  const handleClientChange = async (clientName: string) => {
    setFormData({ ...formData, departmentID: '', clientName });
    const departments = await fetchDepartmentsByClient(clientName);
    setDepartments(departments);
  };

  const [departments, setDepartments] = useState<DepartmentType[]>([]);

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      departmentID: '',
      roleName: '',
      username: '',
      clientName: '',
      jobTitle: '',
      sourceOfHire: '',
      reportingManager: '',
      gender: '',
      maritalStatus: '',
      address: '',
      educationDetails: [{ userId: 1, instituteName: '', diploma: '', specialization: '' }],
      emergencyContacts: [{ userId: 1, name: '', number: '' }]
    });
    setTouchedFields({ email: false, username: false, phoneNumber: false });
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();

    const departmentID = parseInt(formData.departmentID as string);
    const filesToUpload = files.map(file => ({
      fileName: file.name,
      filePath: "",
      size: file.size,
    }));

    try {
      const response = await axios.post('http://localhost:8383/signup', { ...formData, departmentID, files: filesToUpload }, { withCredentials: true });
      if (response.status === 200) {
        const userID = response.data.data.user_id;
        setAlert({
          severity: "success",
          message: `User created successfully.<br/>Email: ${response.data.data.email}<br/>Username: ${response.data.data.username}<br/>Password: defaultPassword`,
        });
        setOpen(true);
        setTimeout(() => setOpen(false), 9000);
        await handleFileUpload(userID);  // Add this line to handle file upload
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message?.error === "Username already exists") {
          setAlert({
            severity: "error",
            message: "Username already exists",
          });
        } else if (error.response?.data?.message?.error === "Email already exists") {
          setAlert({
            severity: "error",
            message: "Email already exists",
          });
        } else {
          setAlert({
            severity: "error",
            message: "An error occurred while creating the user",
          });
        }
      }
      setOpen(true);
      setTimeout(() => setOpen(false), 9000);
    }
  };

  const handleFileUpload = async (userID: number) => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const encodedFilename = btoa(file.name);
      const encodedSize = btoa(file.size.toString());

      const uploadMetadata = `filename ${encodedFilename},size ${encodedSize},userId ${userID}`;

      const res = await axios.post('http://localhost:8383/files/', null, {
        headers: {
          'Tus-Resumable': '1.0.0',
          'Upload-Length': file.size.toString(),
          'Upload-Metadata': uploadMetadata
        }
      });

      const fileId = res.headers['location'].split('/').pop();
      const fileUploadUrl = `http://localhost:8383/files/${fileId}`;
      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        const target = event.target as FileReader;
        if (target && target.result) {
          const fileContent = target.result;
          await axios.patch(fileUploadUrl, fileContent, {
            headers: {
              'Content-Type': 'application/offset+octet-stream',
              'Upload-Offset': '0',
              'Tus-Resumable': '1.0.0'
            }
          });

          const fileUploadData = {
            userId: userID,
            fileId,
            fileName: file.name,
            filePath: fileUploadUrl,  // Use the full URL here
            size: file.size,
          };

          await axios.post('http://localhost:8383/hooks/upload', fileUploadData, { withCredentials: true });
        }
      };

      fileReader.readAsArrayBuffer(file);
    });

    try {
      await Promise.all(uploadPromises);
      setAlert({
        severity: "success",
        message: `User created successfully.<br/>Email: ${formData.email}<br/>Username: ${formData.username}<br/>Password: defaultPassword`
      });
    } catch (error) {
      setAlert({
        severity: "error",
        message: "An error occurred while uploading files"
      });
    } finally {
      setOpen(true);
      setTimeout(() => setOpen(false), 9000);
    }
  };

  const fetchUploadedFiles = async () => {
    const response = await axios.get('http://localhost:8383/files', { withCredentials: true });
    if (response.status !== 200) throw new Error('Failed to fetch files');
    return response.data;
  };

  useEffect(() => {
    fetchUploadedFiles().then(files => {}).catch(error => {
      console.error("Error fetching files:", error);
    });
  }, []);


  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    return /^[0-9]+$/.test(phoneNumber);
  };

  const isValidForm = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.username.trim() !== '' &&
      formData.email.trim() !== '' &&
      validateEmail(formData.email) &&
      formData.phoneNumber.trim() !== '' &&
      validatePhoneNumber(formData.phoneNumber) &&
      formData.departmentID !== '' &&
      formData.roleName !== '' &&
      formData.clientName !== '' &&
      formData.jobTitle.trim() !== ''
    );
  };

  if (rolesLoading || clientsLoading) return <ProgressLinearWithLabel />;
  if (rolesError || clientsError) return <div>Error loading data</div>;

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
                onChange={e => {
                  setFormData({ ...formData, username: e.target.value });
                  setTouchedFields({ ...touchedFields, username: true });
                }}
                error={touchedFields.username && formData.username.trim() === ''}
                helperText={touchedFields.username && formData.username.trim() === '' && 'Username is required'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                required
                fullWidth
                label='Phone Number'
                placeholder='Enter your phone number'
                value={formData.phoneNumber}
                onChange={e => {
                  setFormData({ ...formData, phoneNumber: e.target.value });
                  setTouchedFields({ ...touchedFields, phoneNumber: true });
                }}
                error={touchedFields.phoneNumber && !validatePhoneNumber(formData.phoneNumber)}
                helperText={touchedFields.phoneNumber && !validatePhoneNumber(formData.phoneNumber) && 'Phone number must be only numbers'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                required
                fullWidth
                label='Email'
                placeholder='Enter your email'
                value={formData.email}
                onChange={e => {
                  setFormData({ ...formData, email: e.target.value });
                  setTouchedFields({ ...touchedFields, email: true });
                }}
                error={touchedFields.email && !validateEmail(formData.email)}
                helperText={touchedFields.email && !validateEmail(formData.email) && 'Email must be a valid email'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                required
                fullWidth
                label='Job Title'
                placeholder='Enter your job title'
                value={formData.jobTitle}
                onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                required
                fullWidth
                label='Source of Hire'
                placeholder='Enter the source of hire'
                value={formData.sourceOfHire}
                onChange={e => setFormData({ ...formData, sourceOfHire: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                required
                fullWidth
                label='Reporting Manager'
                placeholder='Enter the reporting manager'
                value={formData.reportingManager}
                onChange={e => setFormData({ ...formData, reportingManager: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                required
                fullWidth
                label='Gender'
                placeholder='Enter the gender'
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                required
                fullWidth
                label='Marital Status'
                placeholder='Enter the marital status'
                value={formData.maritalStatus}
                onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                required
                fullWidth
                label='Address'
                placeholder='Enter the address'
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
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
                label='Client'
                value={formData.clientName}
                onChange={e => handleClientChange(e.target.value)}
              >
                {clients?.map((client: ClientType) => (
                  <MenuItem key={client.ID} value={client.name}>
                    {client.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                required
                fullWidth
                select
                label='Department'
                value={formData.departmentID}
                onChange={e => setFormData({ ...formData, departmentID: e.target.value })}
                disabled={!formData.clientName}
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
                3. Education Details
              </Typography>
            </Grid>
            {formData.educationDetails.map((education, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    required
                    fullWidth
                    label='Institute Name'
                    placeholder='Enter the institute name'
                    value={education.instituteName}
                    onChange={e => {
                      const updatedEducationDetails = [...formData.educationDetails];
                      updatedEducationDetails[index].instituteName = e.target.value;
                      setFormData({ ...formData, educationDetails: updatedEducationDetails });
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    required
                    fullWidth
                    label='Diploma'
                    placeholder='Enter the diploma'
                    value={education.diploma}
                    onChange={e => {
                      const updatedEducationDetails = [...formData.educationDetails];
                      updatedEducationDetails[index].diploma = e.target.value;
                      setFormData({ ...formData, educationDetails: updatedEducationDetails });
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    required
                    fullWidth
                    label='Specialization'
                    placeholder='Enter the specialization'
                    value={education.specialization}
                    onChange={e => {
                      const updatedEducationDetails = [...formData.educationDetails];
                      updatedEducationDetails[index].specialization = e.target.value;
                      setFormData({ ...formData, educationDetails: updatedEducationDetails });
                    }}
                  />
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body2' className='font-medium'>
                4. Emergency Contacts
              </Typography>
            </Grid>
            {formData.emergencyContacts.map((contact, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    required
                    fullWidth
                    label='Name'
                    placeholder='Enter the name'
                    value={contact.name}
                    onChange={e => {
                      const updatedEmergencyContacts = [...formData.emergencyContacts];
                      updatedEmergencyContacts[index].name = e.target.value;
                      setFormData({ ...formData, emergencyContacts: updatedEmergencyContacts });
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    required
                    fullWidth
                    label='Number'
                    placeholder='Enter the number'
                    value={contact.number}
                    onChange={e => {
                      const updatedEmergencyContacts = [...formData.emergencyContacts];
                      updatedEmergencyContacts[index].number = e.target.value;
                      setFormData({ ...formData, emergencyContacts: updatedEmergencyContacts });
                    }}
                  />
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body2' className='font-medium'>
                5. Upload Files
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
                    <a href='/client/public' onClick={e => e.preventDefault()} className='text-textPrimary no-underline'>
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
            disabled={!isValidForm()}
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
  );
};

export default FormLayoutsSeparator;
