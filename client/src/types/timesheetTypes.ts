// timesheetTypes.ts
export interface WorkHours {
  ID: number;
  UserID: number;
  TaskID?: number | null;
  Checkin: number; // timestamp
  Checkout?: number | null; // timestamp
  Duration: number;
  WorkType: string;
  Location: string;
  Comments: string;
  Approved: boolean;
  RequestedEdit: boolean;
  EditRequestMsg: string;
  ManagerComment: string;
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
