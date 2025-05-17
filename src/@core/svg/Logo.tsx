import { useEffect, useState } from "react";

const Logo = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.company_id) {
          setError('not found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/organization-profile/company/${user.company_id}`);
        const result = await response.json();

        if (result.data) {
          setUserData(result.data);
        } else {
          setError(result.message || 'Failed to fetch loan details');
        }
      } catch (error) {
        setError('Error fetching the details');
        console.error('Error fetching user data:', error);
      }
    };

    fetchCompanyData();
  }, []);
  return (
    <img
      src={userData?.image || "/images/logos/fintech.png"}
      alt="New Logo"
      width="120"
      style={{ backgroundColor: 'transparent' }}
      height="120"
    />
  );
};

export default Logo;
