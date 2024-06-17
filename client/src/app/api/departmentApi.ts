
import axios from 'axios';
import { DepartmentType, ClientType } from '@/types/departmentTypes';
const apiClient = axios.create({
  baseURL: 'http://localhost:8383',
  withCredentials: true,
});

export const fetchClients = async (): Promise<ClientType[]> => {
  const response = await apiClient.get('/client');
  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error('Failed to fetch clients');
  }
};

export const fetchDepartments = async (clientName: string): Promise<DepartmentType[]> => {
  const response = await apiClient.get(`/departments/${clientName}`);
  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error(`Failed to fetch departments for client ${clientName}`);
  }
};

export const createDepartment = async (department: { name: string; clientName: string; supervisorId: number }): Promise<DepartmentType> => {
  const response = await apiClient.post('/department/create', department);
  if (response.status === 201) {
    return response.data.data;
  } else {
    throw new Error('Failed to create department');
  }
};

export const updateDepartment = async (id: number, department: { name: string; supervisorId: number }): Promise<void> => {
  const response = await apiClient.put(`/department/update/${id}`, department);
  if (response.status !== 200) {
    throw new Error('Failed to update department');
  }
};

export const deleteDepartment = async (id: number): Promise<void> => {
  const response = await apiClient.delete(`/department/delete/${id}`);
  if (response.status !== 200) {
    throw new Error('Failed to delete department');
  }
};

export const createClient = async (client: { name: string }): Promise<ClientType> => {
  const response = await apiClient.post('/client/create', client);
  if (response.status === 201) {
    return response.data.data;
  } else {
    throw new Error('Failed to create client');
  }
};

export const updateClient = async (id: number, client: { name: string }): Promise<void> => {
  const response = await apiClient.put(`/client/update/${id}`, client);
  if (response.status !== 200) {
    throw new Error('Failed to update client');
  }
};

export const deleteClient = async (id: number): Promise<void> => {
  const response = await apiClient.delete(`/client/delete/${id}`);
  if (response.status !== 200) {
    throw new Error('Failed to delete client');
  }
};

