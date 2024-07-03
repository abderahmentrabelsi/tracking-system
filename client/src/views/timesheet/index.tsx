'use client'
import React, { useEffect, useState } from 'react';
import ManagerDashboard from './Manager';
import EmployeeDashboard from './Employee';

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
        <ManagerDashboard />
      ) : (
        <EmployeeDashboard />
      )}
    </div>
  );
};

export default TimesheetDashboard;
