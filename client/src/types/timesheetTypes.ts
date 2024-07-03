export interface WorkHours {
  ID: number;
  UserID: number;
  TaskID?: number | null;
  Checkin: string;
  Checkout?: string | null;
  Duration: number;
  WorkType: string;
  Location: string;
  Comments: string;
  Approved: boolean;
  RequestedEdit: boolean;
  EditRequestMsg: string;
  ManagerComment: string;
}

export interface Timesheet {
  data: WorkHours[];
  message: {
    msg: string;
  };
  status: string;
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

export interface EditRequestData {
  workHoursID: number;
  editRequestMsg: string;
}

export interface ApproveEditData {
  workHoursID: number;
  approved: boolean;
  managerComment: string;
}

export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}
