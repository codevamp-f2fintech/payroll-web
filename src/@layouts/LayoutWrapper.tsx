'use client'

// React Imports
import { useEffect, useState, type ReactElement } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'

interface JwtPayload {
  exp: number;
  iat: number;
  userId?: string;
  [key: string]: any;  // Adjust this based on your token structure
}

const LayoutWrapper = ({ verticalLayout }: { verticalLayout: ReactElement }) => {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    let currentToken = urlToken || localStorage.getItem('token');

    if (currentToken) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(currentToken);

        // Check if token is expired
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          router.push('/login');
        } else {
          // Save or update the token in local storage
          localStorage.setItem('token', currentToken);
          setToken(currentToken);

          // Optional: Save decoded user data in local storage
          if (decodedToken) {
            localStorage.setItem('userId', decodedToken.id);
            localStorage.setItem('user', JSON.stringify(decodedToken));
          }

          console.log('Token saved successfully:', decodedToken);
        }
      } catch (error) {
        console.error('Invalid token:', error.message);
        localStorage.removeItem('token');
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  if (!token) {
    return null;
  }

  return <div className='flex flex-col flex-auto'>{verticalLayout}</div>;
}

export default LayoutWrapper;
