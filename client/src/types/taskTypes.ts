export interface TaskType {
  ID: number;
  title: string;
  description: string;
  status: string;
  requestedStatus: string;
  assigneeId: number;
  managerId: number;
  dueDate: string;
  departmentId: number;
  comments: CommentType[];
}

export interface CommentType {
  ID: number;
  taskId: number;
  userId: number;
  content: string;
  createdAt: string;
}
