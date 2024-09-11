export interface DepartmentType {
  ID: number
  CreatedAt: string
  name: string
  supervisorId: number
  clientName: string
  parentDepartmentId: number
  users: {
    ID: number
    firstName: string
    lastName: string
  }[]
}

export interface ClientType {
  ID: number
  name: string
}

export interface UserType {
  ID: number
  username: string
  password: string
  email: string
  roleId: number
  firstName: string
  lastName: string
  jobTitle: string
  picture: string
  phoneNumber: string
  address: string
  DepartmentID: number
  Department: DepartmentType | null
  loginHistory: any | null
  workHours: any | null
  tokenDetails: any | null
  salary: any | null
  contract: any | null
  files: any | null
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string | null
}
