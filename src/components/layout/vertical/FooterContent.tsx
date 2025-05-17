'use client'
import { useEffect, useState } from "react";

import { Container, Box, Typography, Link, Stack, Divider, IconButton } from "@mui/material";
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const FooterContent = () => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);
  const socialIcons = [
    { icon: <FacebookIcon />, name: "Facebook", url: "https://facebook.com/" },
    { icon: <InstagramIcon />, name: "Instagram", url: "https://instagram.com/" },
    { icon: <TwitterIcon />, name: "Twitter", url: "https://twitter.com/" },
    { icon: <LinkedInIcon />, name: "LinkedIn", url: "https://linkedin.com/" },
  ];
  return (
    <Container
      maxWidth={false}
      sx={{
        background: "#2e7d32",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, // Stack vertically on small screens
          justifyContent: "space-between",
          alignItems: { xs: "center", md: "flex-start" }, // Center items on small screens
          padding: '2rem 1rem'
        }}
      >
        <Box width={{ xs: "100%", md: 350 }} textAlign={{ xs: "center", md: "left" }} mb={{ xs: 4, md: 0 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: "600", color: "white", marginBottom: "1rem" }}
          >
            {userData?.name}
          </Typography>
          {userData?.address && userData.address.length > 0 && (
            <Box>
              {userData.address.map((location, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    alignItems: 'center',
                    color: 'white',
                    marginBottom: 2,
                    gap: 1.5,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(10px)'
                    }
                  }}
                >
                  <LocationOnIcon sx={{ color: '#FFD700' }} />
                  <Link
                    href={`https://www.google.com/maps?q=${location}`}
                    target='_blank'
                    sx={{
                      color: 'white',
                      textDecoration: 'none',
                      '&:hover': {
                        color: '#FFD700'
                      }
                    }}
                  >
                    {location}
                  </Link>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        <Box
          sx={{ display: "flex", flexDirection: "column", textAlign: { xs: "center", md: "left" }, mb: { xs: 4, md: 0 } }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "600", color: "white", marginBottom: "1rem" }}
          >
            Company
          </Typography>
          {["About us", "Blogs", "Privacy Policy", "Terms & Conditions"].map((item, index) => (
            <Box key={index} sx={{ mb: 1.5 }}>
              <Link
                underline="none"
                component="a"
                href="#"
                sx={{
                  color: "#ffffff",
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: "#FFD700",
                    transform: 'translateX(5px)'
                  }
                }}
              >
                {item}
              </Link>
            </Box>
          ))}        </Box>
        <Box
          sx={{ display: "flex", flexDirection: "column", textAlign: { xs: "center", md: "left" } }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "600", color: "white", marginBottom: "1rem" }}
          >
            Contact Us
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PhoneIcon sx={{ mr: 1, color: '#FFD700' }} />
            <Typography variant="h6" sx={{ color: '#d1d5db' }}>
              {userData?.contactNo}
            </Typography>
          </Box>

          {/* Email */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <EmailIcon sx={{ mr: 1, color: '#FFD700' }} />
            <Typography variant="h6" sx={{ color: '#d1d5db' }}>
              {userData?.email}
            </Typography>
          </Box>

          {/* Social Media Icons */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            {socialIcons.map((social, index) => (
              <IconButton
                key={index}
                component="a"
                href={social.url}
                target="_blank"
                aria-label={social.name}
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  '&:hover': {
                    backgroundColor: "#4f46e5",
                    transform: 'translateY(-3px)',
                    transition: 'all 0.3s ease'
                  },
                  width: '40px',
                  height: '40px'
                }}
              >
                {social.icon}
              </IconButton>
            ))}
          </Box>

          <Stack direction="row" spacing={3}>
          </Stack>
        </Box>
      </Box>
      <Typography sx={{ color: 'white', fontSize: '15px', mt: 4, textAlign: 'center' }}>
        © 2024 All Rights Reserved by F2 Fintech
      </Typography>
      <Divider color="white" sx={{ height: "1px", mt: 4 }} />
      <Typography sx={{ color: 'white', fontSize: '15px', mt: 2, textAlign: 'center' }}>
        True wealth is not measured by the size of your bank account, but by the freedom to live life on your own terms.
      </Typography>
    </Container>
  )
}

export default FooterContent;
