import axios from 'axios';
import type { UserType } from '@/types/departmentTypes';

const apiClient = axios.create({
  baseURL: 'http://localhost:8383',
  withCredentials: true,
});

export const fetchAllUsers = async (): Promise<UserType[]> => {
  const response = await apiClient.get('/users');
  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error('Failed to fetch users');
  }
};

export const fetchUserById = async (userId: number): Promise<UserType> => {
  const response = await apiClient.get(`/user/${userId}`);
  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error('Failed to fetch user');
  }
};
