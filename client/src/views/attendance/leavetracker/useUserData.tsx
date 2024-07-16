import React, { useState, useEffect } from 'react';
import { fetchUserById } from '@/app/api/userApi';
import {getDepartmentById} from '@/app/api/taskApi'

const useUserData = (userId: number) => {
  const [user, setUser] = useState<{ firstName: string; lastName: string; JobName: string } | null>(null);
  const [departmentName, setDepartmentName] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUserById(userId);
        setUser({
          firstName: userData.firstName,
          lastName: userData.lastName,
          JobName: userData.jobTitle,
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    const fetchDepartmentDetails = async (id: number) => {
      try {
        const response = await getDepartmentById(id);
        const department = response;
        setDepartmentName(department.name);
        const parentDepartment = await getDepartmentById(department.parentDepartmentId);
        setClientName(parentDepartment.name);
      } catch (error) {
        console.error('Failed to fetch department details:', error);
      }
    };

    fetchUserData();

    const storedDepartmentId = typeof window !== 'undefined' ? parseInt(localStorage.getItem('departmentId') || '0', 10) : 0;
    if (storedDepartmentId) {
      fetchDepartmentDetails(storedDepartmentId);
    }
  }, [userId]);

  return { user, departmentName, clientName };
};

export default useUserData;
