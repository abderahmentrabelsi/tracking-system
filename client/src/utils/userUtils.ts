// src/utils/userUtils.ts

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
}

export const fetchUserDetails = async (): Promise<UserDetails | null> => {
  try {
    const response = await fetch('http://localhost:8383/user/details', {
      method: 'GET',
      credentials: 'include', // Include the cookie in the request
    });
    console.log('Response status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('User details fetched:', data); // Add debug logging
      return {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        picture: data.picture,
        phoneNumber: data.phoneNumber,
        address: data.address,
        roleId: data.roleId,
        departmentId: data.departmentId,
        createdAt: data.createdAt,
      };
    } else {
      console.error('Failed to fetch user details');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
};
