// src/utils/checkAuth.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

export const checkAuth = () => {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    return true;
  } catch (error) {
    redirect('/login');
  }
};
