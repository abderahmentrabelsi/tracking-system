'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Container,
  Tabs,
  Tab,
  Typography,
  Box,
  Badge
} from '@mui/material'
import Cookies from 'js-cookie'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

interface FileData {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string | null
  userId: number
  fileName: string
  uploadId: string
  filePath: string
  size: number
  uploadedAt: string
}

const FilesList: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState<number>(0)

  const getUserIdFromToken = () => {
    const token = Cookies.get('access_token')
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]))
      return decodedToken.UserID
    }
    return null
  }

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const userId = getUserIdFromToken()
        if (!userId) {
          throw new Error('User ID not found in token')
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_GO_APP_SERVER_URL}/user/user/${userId}/files`, {
          withCredentials: true
        })

        setFiles(response.data.data)
      } catch (error) {
        console.error('Error fetching files:', error)
        if (axios.isAxiosError(error)) {
          setError(error.response?.data || error.message)
        } else {
          setError('An unexpected error occurred')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [])

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue)
  }

  const filteredFiles = files.filter(file => file.filePath && file.fileName.toLowerCase().endsWith('.pdf'))

  if (loading) {
    return <CircularProgress />
  }

  if (error) {
    return <div>Error loading files: {error}</div>
  }

  return (
    <Container>
      <Typography variant='h6' gutterBottom>
        My PDF Files
        <Badge badgeContent={filteredFiles.length} color='primary' style={{ marginLeft: 10 }} />
      </Typography>
      <Tabs value={tabValue} onChange={handleChange} aria-label='file tabs'>
        <Tab label='Organization Files' />
        <Tab label='Employee Files' />
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        <List>
          {filteredFiles.map(file => (
            <ListItem button component='a' href={file.filePath || '#'} key={file.ID}>
              <InsertDriveFileIcon color='error' style={{ marginRight: 10 }} />
              <ListItemText primary={file.fileName} />
            </ListItem>
          ))}
        </List>
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <List>
          {/* Example of empty employee files list */}
          <ListItem>
            <ListItemText primary='No employee files available.' />
          </ListItem>
        </List>
      </TabPanel>
    </Container>
  )
}

const TabPanel = (props: { children?: React.ReactNode; index: any; value: any }) => {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

export default FilesList
