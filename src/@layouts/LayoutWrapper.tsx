'use client'

import { useEffect, useState, type ReactElement } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface JwtPayload {
  exp: number;
  iat: number;
  id?: string;
  designation?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  image?: string;
  role?: string;
  password?: string;
  [key: string]: any;
}

const LayoutWrapper = ({ verticalLayout }: { verticalLayout: ReactElement }) => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const localToken = localStorage.getItem('token');

    if (localToken) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(localToken);

        if (decodedToken.exp * 1000 < Date.now()) {
          // Token expired, remove it and redirect to login
          localStorage.removeItem('token');
          router.push('/login');
        } else {
          // Token is valid and not expired, set it in state and return
          setToken(localToken);
          return;
        }
      } catch (error) {
        console.error('Invalid token:', error.message);
        localStorage.removeItem('token');
        router.push('/login');
      }
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      if (urlToken) {
        const decodedToken = jwtDecode<JwtPayload>(urlToken);
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          router.push('/login');
        } else {
          handleEmployee(decodedToken)
            .then((newToken) => {
              if (newToken) {
                localStorage.setItem('token', newToken);
                setToken(newToken);
                const decodeNewToken = jwtDecode<JwtPayload>(newToken);
                localStorage.setItem('user', JSON.stringify({
                  id: decodeNewToken.id,
                  role: decodeNewToken.role,
                  desg: decodeNewToken.designation,
                }));
              }
            })
            .catch((error) => {
              console.error("Employee creation or login failed:", error);
              router.push('/login');
            });
        }
      } else {
        router.push('/login');
      }
    }
  }, [router]);

  const handleEmployee = async (decodedToken: JwtPayload) => {
    try {
      const checkResponse = await axios.get(`${process.env.NEXT_PUBLIC_APP_URL}/employees/getByEmail/${decodedToken.email}`);
      if (checkResponse.data.success) {
        return await loginEmployee(decodedToken.email!, decodedToken.password!);
      } else {
        await createEmployee(decodedToken);
        return await loginEmployee(decodedToken.email!, decodedToken.password!);
      }
    } catch (error) {
      console.error('Error handling employee:', error);
      return null;
    }
  };

  const createEmployee = async (decodedToken: JwtPayload): Promise<void> => {
    await axios.post(`${process.env.NEXT_PUBLIC_APP_URL}/employees/create`, {
      designation: decodedToken.designation,
      email: decodedToken.email,
      first_name: decodedToken.first_name,
      last_name: decodedToken.last_name,
      image: decodedToken.image,
      role_priority: decodedToken.role,
      password: decodedToken.password,
      code: decodedToken.code,
      joining_date: decodedToken.joining_date,
    });
  };

  const loginEmployee = async (email: string, password: string): Promise<string | null> => {
    try {
      const loginResponse = await axios.post(`${process.env.NEXT_PUBLIC_APP_URL}/auth/login`, { email, password });
      return loginResponse.data.token;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  if (!token) {
    return null;
  }

  return <div className='flex flex-col flex-auto'>{verticalLayout}</div>;
};

export default LayoutWrapper;
