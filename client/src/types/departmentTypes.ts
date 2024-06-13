// departmentTypes.ts

export interface DepartmentType {
  ID: number;
  name: string;
  supervisorId: number;
  CreatedAt: string;
  clientName: string;
}

export interface ClientType {
  ID: number;
  name: string;
}
