import axios from 'axios';
import { WorkHours, CheckInData, CheckOutData } from '@/types/timesheetTypes';


const apiClient = axios.create({
  baseURL: 'http://localhost:8383',
  withCredentials: true,
});

export const checkIn = async (data: CheckInData): Promise<WorkHours> => {
  const response = await apiClient.post(`/checkin`, data);
  return response.data.data;
};

export const checkOut = async (data: CheckOutData): Promise<WorkHours> => {
  const response = await apiClient.put(`/checkout/${data.workHoursID}`);
  return response.data.data;
};

export const getTimesheet = async (userID: number): Promise<WorkHours[]> => {
  const response = await apiClient.get(`/timesheet/${userID}`);
  return response.data.data;
};
