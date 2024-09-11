export interface WorkHours {
  ID: number
  userID: number
  taskID?: number | null
  checkin: number
  checkout?: number | null
  duration: number
  workType: string
  location: string
  comments: string
  approved: boolean
  requestedEdit: boolean
  editRequestMsg: string
  requestCheckin?: number
  requestCheckout?: number
  RequestDuration?: number
  managerComment: string
}

export interface TaskType {
  ID: number
  title: string
  description: string
  // Add other fields as necessary
}

export interface CheckInData {
  userID: number
  taskID?: number | null
  workType: string
  location: string
  comments: string
}

export interface CheckOutData {
  workHoursID: number
}

export interface RequestEditData {
  workHoursID: number
  editRequestMsg: string
  requestCheckin?: number
  requestCheckout?: number
  RequestDuration?: number
}

export interface RequestApproveData {
  workHoursID: number
  approved: boolean
  managerComment: string
  requestCheckin?: number
  requestCheckout?: number
  requestDuration?: number
}
