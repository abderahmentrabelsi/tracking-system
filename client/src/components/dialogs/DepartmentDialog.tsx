import React, { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material'

interface DepartmentDialogProps {
  open: boolean
  onClose: () => void
  onSave: (department: { name: string; supervisorId: string }) => void
  editValue: string
}

const DepartmentDialog: React.FC<DepartmentDialogProps> = ({ open, onClose, onSave, editValue }) => {
  const [name, setName] = useState(editValue)
  const [supervisorId, setSupervisorId] = useState('')

  useEffect(() => {
    setName(editValue)
  }, [editValue])

  const handleSave = () => {
    onSave({ name, supervisorId })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{editValue ? 'Edit Department' : 'Add Department'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin='dense'
          label='Department Name'
          type='text'
          fullWidth
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <TextField
          margin='dense'
          label='Supervisor ID'
          type='text'
          fullWidth
          value={supervisorId}
          onChange={e => setSupervisorId(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Cancel
        </Button>
        <Button onClick={handleSave} color='primary'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DepartmentDialog
