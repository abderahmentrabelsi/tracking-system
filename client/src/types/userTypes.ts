// Define the static user data with all required properties

import { User } from '@/utils/userUtils'

export interface UsersType {
  CreatedAt: string
  UpdatedAt: string
  role: string
  DeletedAt: string | null
  ID: number
  username: string
  email: string
  roleId: number
  Role: {
    ID: number
    CreatedAt: string
    UpdatedAt: string
    DeletedAt: string | null
    name: string
  }
  firstName: string
  lastName: string
  picture: string
  phoneNumber: string
  address: string
  jobTitle: string
  DepartmentID: number
  Department: {
    CreatedAt: string
    UpdatedAt: string
    DeletedAt: string | null
    ID: number
    name: string
    users: User[] | null
    calendar: string | null
  }
  loginHistory: string | null
  workHours: string | null
  totpSecret: string
  totpEnabled: boolean
  salary: {
    ID: number
    CreatedAt: string
    UpdatedAt: string
    DeletedAt: string | null
    userId: number
    base: number
    subsidy: number
    bonus: number
    commission: number
    other: number
    fund: number
    pension_insurance: number
    unemployment_insurance: number
    medical_insurance: number
    housing_fund: number
    tax: number
    overtime: number
    total: number
    is_pay: number
    salary_date: string
  }
  contract: {
    ID: number
    CreatedAt: string
    UpdatedAt: string
    DeletedAt: string | null
    userId: number
    contractType: string
    startDate: string
    contractStatus: string
  }
  files: string | null
  sourceOfHire: string
  reportingManager: string
  gender: string
  maritalStatus: string
  addedBy: string
  modifiedBy: string
  onBoardingStatus: string
  educationDetails: string | null
  emergencyContacts: string | null
}
