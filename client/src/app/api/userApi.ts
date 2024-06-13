import axios, { AxiosError } from 'axios';

export const fetchUserById = async (userId: number) => {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error, 'Error fetching user by ID');
    throw error;
  }
};

const handleAxiosError = (error: AxiosError, message: string) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    console.error(message, error.response.status, error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error(message, 'Request made but no response received', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error(message, 'Error setting up request', error.message);
  }
};
