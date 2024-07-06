export interface WorkHours {
  ID: number;
  userID: number;
  taskID?: number | null;
  checkin: number;
  checkout?: number | null;
  duration: number;
  workType: string;
  location: string;
  comments: string;
  approved: boolean;
  requestedEdit: boolean;
  editRequestMsg: string;
  managerComment: string;
}

export interface TaskType {
  ID: number;
  title: string;
  description: string;
  // Add other fields as necessary
}

export interface CheckInData {
  userID: number;
  taskID?: number | null;
  workType: string;
  location: string;
  comments: string;
}

export interface CheckOutData {
  workHoursID: number;
}
