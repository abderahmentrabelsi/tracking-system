'use client'
import React, { useEffect, useState } from 'react';
// import ManagerDashboard from './Manager';
import EmployeeDashboard from './Employee';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

const TimesheetDashboard: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  if (!role) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {role === 'Manager' ? (
        <EmployeeDashboard />
      ) : (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <EmployeeDashboard />
        </ThemeProvider>
      )}
    </div>
  );
};

export default TimesheetDashboard;
