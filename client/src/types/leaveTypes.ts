// src/types/leaveTypes.ts
export interface LeaveRequestType {
  id: number;
  userId: number;
  startDate: number;  // Unix timestamp (int64)
  endDate: number;    // Unix timestamp (int64)
  duration: number;
  leaveType: string;
  paid: boolean;
  comments: string;
  leaveStatus: string;
  managerComment?: string;
  approved: boolean;
}


export interface LeaveRequestPayload {
  userId: number;
  startDate: number;
  endDate: number;
  duration: number;
  leaveType: string;
  paid: boolean;
  comments: string;
}
