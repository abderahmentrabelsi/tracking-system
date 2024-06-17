import axios from 'axios';
import type { UsersType } from '@/types/userTypes';

const apiClient = axios.create({
  baseURL: 'http://localhost:8383',
  withCredentials: true,
});

export const fetchAllUsers = async (): Promise<UsersType[]> => {
  const response = await apiClient.get('/users');
  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error('Failed to fetch users');
  }
};

export const fetchUserById = async (userId: number): Promise<UsersType> => {
  const response = await apiClient.get(`/user/${userId}`);
  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error('Failed to fetch user');
  }
};
