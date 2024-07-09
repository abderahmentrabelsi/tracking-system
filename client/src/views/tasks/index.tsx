'use client'
import React, { useEffect, useState } from 'react';
import EmployeeDashboard from './Employee';

const TaskDashboard: React.FC = () => {
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
      <EmployeeDashboard />
    </div>
  );
};

export default TaskDashboard;
