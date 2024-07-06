import axios from 'axios';
import { TaskType, CommentType } from '@/types/taskTypes';
import { DepartmentType } from '@/types/departmentTypes';

const apiClient = axios.create({
  baseURL: 'http://localhost:8383',
  withCredentials: true,
});

export const createTask = async (task: TaskType): Promise<TaskType> => {
  const response = await apiClient.post('/task/create', task);
  if (response.status === 201) {
    return response.data.data;
  } else {
    throw new Error('Failed to create task');
  }
};

export const updateTask = async (id: number, task: Partial<TaskType>): Promise<TaskType> => {
  const response = await apiClient.put(`/task/${id}`, task);
  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error('Failed to update task');
  }
};

export const deleteTask = async (id: number): Promise<void> => {
  const response = await apiClient.delete(`/task/${id}`);
  if (response.status !== 200) {
    throw new Error('Failed to delete task');
  }
};

export const approveStatusChange = async (id: number): Promise<TaskType> => {
  const response = await apiClient.put(`/task/${id}/approve-status-change`);
  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error('Failed to approve task status change');
  }
};

export const requestStatusChange = async (id: number, requestedStatus: string): Promise<TaskType> => {
  const response = await apiClient.put(`/task/${id}/request-status-change`, { requestedStatus });
  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error('Failed to request task status change');
  }
};

export const getTasksByUserId = async (userId: number): Promise<TaskType[]> => {
  const response = await apiClient.get(`/tasks/user/${userId}`);
  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error('Failed to fetch tasks');
  }
};

export const getTaskById = async (id: number): Promise<TaskType[]> => {
  const response = await apiClient.get(`/task/${id}`);
  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error('Failed to fetch tasks');
  }
};



export const createComment = async (comment: CommentType): Promise<CommentType> => {
  const response = await apiClient.post('/comments', comment);
  if (response.status === 201) {
    return response.data.data;
  } else {
    throw new Error('Failed to create comment');
  }
};

export const getCommentsByTaskId = async (taskId: number): Promise<CommentType[]> => {
  const response = await apiClient.get(`/comments/task/${taskId}`);
  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error('Failed to fetch comments');
  }
};

export const updateComment = async (id: number, comment: Partial<CommentType>): Promise<CommentType> => {
  const response = await apiClient.put(`/comments/${id}`, comment);
  if (response.status === 200) {
    return response.data.data;
  } else {
    throw new Error('Failed to update comment');
  }
};

export const deleteComment = async (id: number): Promise<void> => {
  const response = await apiClient.delete(`/comments/${id}`);
  if (response.status !== 200) {
    throw new Error('Failed to delete comment');
  }
};

export const getDepartmentById = async (id: number): Promise<DepartmentType> => {
  const response = await apiClient.get(`/department/${id}`);
  if (response.status === 200) {
    return {
      ...response.data.data,
      CreatedAt: new Date(response.data.data.CreatedAt).toISOString(),
    };
  } else {
    throw new Error(`Failed to fetch department with id ${id}`);
  }
};
