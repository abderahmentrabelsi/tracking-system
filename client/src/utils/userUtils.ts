//client/src/utils/userUtils.ts
export interface UserDetails {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  phoneNumber: string;
  address: string;
  roleId: number;
  departmentId: number;
  createdAt: string;
  clientName: string;
  departmentName: string;
  departments: Department[];
  jobTitle: string;
  profile: any; // Add these if needed
  teams: any;   // Add these if needed
  projects: any; // Add these if needed
  connections: any; // Add these if needed
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
}): Promise<void> => {
  const response = await fetch(`http://localhost:8383/user/profile/${data.username}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update profile");
  }
};

