import axios from 'axios';
import { LeaveRequestPayload, LeaveRequestType } from '@/types/leaveTypes';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_GO_APP_SERVER_URL,
  withCredentials: true,
});

export const createLeaveRequest = async (leaveRequest: LeaveRequestPayload): Promise<LeaveRequestType> => {
  try {
    const response = await apiClient.post('/leave-request', leaveRequest);
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      console.error('Failed to create leave request:', error.response.data);
    }
    throw new Error('Failed to create leave request');
  }
};

export const approveLeaveRequest = async (id: number, approve: boolean, managerComment: string): Promise<LeaveRequestType> => {
  try {
    const response = await apiClient.put(`/leave-request/${id}/approve`, { approve, managerComment });
    return response.data.data;
  } catch (error) {
    throw new Error('Failed to approve leave request');
  }
};

export const getLeaveRequestsByUserId = async (userId: number): Promise<LeaveRequestType[]> => {
  try {
    const response = await apiClient.get(`/leave-requests/${userId}`);
    return response.data.data;
  } catch (error) {
    throw new Error('Failed to fetch leave requests');
  }
};

export const deleteLeaveRequest = async (id: number): Promise<void> => {
  try {
    const response = await apiClient.delete(`/leave-request/${id}`);
    if (response.status !== 200) {
      throw new Error('Failed to delete leave request');
    }
  } catch (error) {
    throw new Error('Failed to delete leave request');
  }
};
