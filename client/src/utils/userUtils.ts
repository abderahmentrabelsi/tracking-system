import axios from 'axios'

export interface UserDetails {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string | null;
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

export interface LoginHistory {
  loginIp: string;
  loginDevice: string;
  loginTime: string;
  location: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_GO_APP_SERVER_URL;

export const fetchLoginHistory = async (userId: number): Promise<LoginHistory[]> => {
  try {
    const response = await fetch(`${BASE_URL}/user/${userId}/login-history`, {
      method: 'GET',
      credentials: 'include'
    })
    if (response.ok) {
      const data = await response.json()
      return data.data
    } else {
      console.error('Failed to fetch login history')
      return []
    }
  } catch (error: any) {
    console.error('Error fetching login history:', error)
    return []
  }
}

export const fetchUserDetails = async (): Promise<UserDetails | null> => {
  try {
    const res = await axios.get(`${BASE_URL}/user/details`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return res.data;
  } catch (error: any) {
    console.error('Error fetching user details:', error);
    return null;
  }
};


export const fetchUsersByDepartment = async (departmentId: number): Promise<User[]> => {
  try {
    const response = await fetch(`${BASE_URL}/department/${departmentId}/users`, {
      method: 'GET',
      credentials: 'include'
    })
    if (response.ok) {
      const data = await response.json()
      console.log(`Fetched users for department ${departmentId}:`, data.data)
      return data.data
    } else {
      console.error(`Failed to fetch users for department ${departmentId}`)
      return []
    }
  } catch (error: any) {
    console.error(`Error fetching users for department ${departmentId}:`, error)
    return []
  }
}

export const fetchUserDetailsByUsername = async (username: string): Promise<UserDetails | null> => {
  try {
    const response = await fetch(`${BASE_URL}/user/profile/${username}`, {
      method: 'GET',
      credentials: 'include'
    })
    if (response.ok) {
      const data = await response.json()
      return data
    } else {
      console.error('Failed to fetch user details')
      return null
    }
  } catch (error: any) {
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
  picture?: string | null;
}): Promise<void> => {
  const { picture, ...restData } = data
  const requestData = picture === null ? restData : data

  const response = await fetch(`${BASE_URL}/user/profile/${data.username}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(requestData)
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to update profile')
  }
}

export const updateUserPassword = async (data: { currentPassword: string, newPassword: string }): Promise<void> => {
  const response = await fetch(`${BASE_URL}/user/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to update password')
  }
}

interface LoginResponse {
  access_token: string;
  redirect_uri: string;
  userRole: string;
  requires_totp: boolean;
  user_id: number;
  departmentId: number;
  UserID: number;
}

export const login = async (identifier: string, password: string, redirectUri: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      Identifier: identifier,
      Password: password,
      RedirectURI: redirectUri
    });
    if (response.status === 200) {
      return response.data.data;
    } else {
      throw new Error('Login failed');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to login');
  }
};
export const generateTOTP = async (): Promise<{ secret: string; qr_code: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/totp/generate`, {
      method: 'POST',
      credentials: 'include'
    })
    if (response.ok) {
      const data = await response.json()
      return data
    } else {
      console.error('Failed to generate TOTP secret')
      throw new Error('Failed to generate TOTP secret')
    }
  } catch (error: any) {
    console.error('Error generating TOTP secret:', error)
    throw error
  }
}

export const enableTOTP = async (): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/totp/enable`, {
      method: 'POST',
      credentials: 'include'
    })
    if (!response.ok) {
      console.error('Failed to enable TOTP')
      throw new Error('Failed to enable TOTP')
    }
  } catch (error: any) {
    console.error('Error enabling TOTP:', error)
    throw error
  }
}

export const verifyTOTP = async (code: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/totp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ code })
    })
    if (response.ok) {
      return true // Verification successful
    } else {
      console.error('Failed to verify TOTP code')
      return false // Verification failed
    }
  } catch (error: any) {
    console.error('Error verifying TOTP code:', error)
    return false // Verification failed
  }
}

export const checkTOTPStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/totp/status`, {
      method: 'GET',
      credentials: 'include'
    })
    if (response.ok) {
      const data = await response.json()
      return data.enabled
    } else {
      console.error('Failed to check TOTP status')
      throw new Error('Failed to check TOTP status')
    }
  } catch (error: any) {
    console.error('Error checking TOTP status:', error)
    throw error
  }
}

export const disableTOTP = async (): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/totp/disable`, {
      method: 'POST',
      credentials: 'include'
    })
    if (!response.ok) {
      console.error('Failed to disable TOTP')
      throw new Error('Failed to disable TOTP')
    }
  } catch (error: any) {
    console.error('Error disabling TOTP:', error)
    throw error
  }
}

export const fetchSupervisorDetailsByDepartmentID = async (departmentID: number): Promise<UserDetails | null> => {
  try {
    const response = await fetch(`${BASE_URL}/department/${departmentID}/supervisor`, {
      method: 'GET',
      credentials: 'include'
    })
    if (response.ok) {
      const data = await response.json()
      return data.data
    } else {
      console.error('Failed to fetch supervisor details')
      return null
    }
  } catch (error: any) {
    console.error('Error fetching supervisor details:', error)
    return null
  }
}
