import axios from 'axios';
import {
  CheckInData,
  CheckOutData,
  EditRequestData,
  ApproveEditData,
  DateRangeFilter,
  Timesheet
} from '@/types/timesheetTypes';

const API_BASE_URL = 'http://localhost:8383';

export const checkIn = async (data: CheckInData): Promise<Timesheet> => {
  const response = await axios.post(`${API_BASE_URL}/checkin`, data);
  return response.data.data;
};

export const checkOut = async (data: CheckOutData): Promise<Timesheet> => {
  const response = await axios.put(`${API_BASE_URL}/checkout/${data.workHoursID}`);
  return response.data.data;
};

export const getTimesheet = async (userID: number): Promise<Timesheet> => {
  const response = await axios.get(`${API_BASE_URL}/timesheet/${userID}`);
  return response.data.data;
};

export const requestEdit = async (data: EditRequestData): Promise<Timesheet> => {
  const response = await axios.post(`${API_BASE_URL}/timesheet/edit-request`, data);
  return response.data.data;
};

export const approveEdit = async (data: ApproveEditData): Promise<Timesheet> => {
  const response = await axios.post(`${API_BASE_URL}/timesheet/approve-edit`, data);
  return response.data.data;
};

export const getTimesheetByDateRange = async (data: DateRangeFilter): Promise<Timesheet> => {
  const response = await axios.post(`${API_BASE_URL}/timesheet/date-range`, data);
  return response.data.data;
};
