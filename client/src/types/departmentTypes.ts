



export interface ClientType {
  ID: number;
  name: string;
}


export interface DepartmentType {
  ID: number;
  CreatedAt: string;
  name: string;
  supervisorId: number;
  clientName: string;
  parentDepartmentId: number;
  users: {
    ID: number;
    firstName: string;
    lastName: string;
  }[];
}
