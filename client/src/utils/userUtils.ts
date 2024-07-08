//client/src/utils/userUtils.ts
export interface UserDetails {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string | null; // Allow null
  phoneNumber: string;
  address: string;
  roleId: number;
  departmentId: number;
  createdAt: string;
  clientName: string;
  departmentName: string;
  departments: Department[];
  jobTitle: string;
  profile: any;
  teams: any;
  projects: any;
  connections: any;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Department {
  ID: number;
  name: string;
  supervisorId?: number;
  users: User[];
}

export const fetchUserDetails = async (): Promise<UserDetails | null> => {
  try {
    const response = await fetch('http://localhost:8383/user/details', {
      method: 'GET',
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Failed to fetch user details');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
};

// Function to fetch users by department
export const fetchUsersByDepartment = async (departmentId: number): Promise<User[]> => {
  try {
    const response = await fetch(`http://localhost:8383/department/${departmentId}/users`, {
      method: 'GET',
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      console.log(`Fetched users for department ${departmentId}:`, data.data);
      return data.data;
    } else {
      console.error(`Failed to fetch users for department ${departmentId}`);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching users for department ${departmentId}:`, error);
    return [];
  }
};

export const fetchUserDetailsByUsername = async (username: string): Promise<UserDetails | null> => {
  try {
    const response = await fetch(`http://localhost:8383/user/profile/${username}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (response.ok) {
      const data = await response.json()
      return data
    } else {
      console.error('Failed to fetch user details')
      return null
    }
  } catch (error) {
    console.error('Error fetching user details:', error)
    return null
  }
}

export const updateUserProfile = async (data: {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | number;
  address: string;
  picture?: string | null; // Allow null for picture
}): Promise<void> => {
  // Remove picture if it's null to avoid sending it in the request
  const { picture, ...restData } = data;
  const requestData = picture === null ? restData : data;

  const response = await fetch(`http://localhost:8383/user/profile/${data.username}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update profile");
  }
};


export const updateUserPassword = async (data: { currentPassword: string, newPassword: string }): Promise<void> => {
  const response = await fetch(`http://localhost:8383/user/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update password');
  }
};
