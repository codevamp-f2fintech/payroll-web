//footercontent.tsx
'use client';

import { useState } from "react"; // Added for toggling contact details

import { Container, Box, Typography, Link, Stack, Divider } from "@mui/material";
import PhoneIcon from '@mui/icons-material/Phone'; // Added for displaying phone icon
import EmailIcon from '@mui/icons-material/Email'; // Added for displaying email icon
import LocationOnIcon from '@mui/icons-material/LocationOn'; // Added for location icon

const FooterContent = () => {
  const [showContactDetails, setShowContactDetails] = useState(false);

  const handleContactClick = () => {
    setShowContactDetails(!showContactDetails);
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        background: "linear-gradient(145deg, rgb(46, 125, 50) 60%,rgb(122, 186, 120) 60%)",
        color: 'white',
        padding: '1rem 1rem', // Adjusted padding for reduced bottom space

      }}
    >

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "center", md: "flex-start" },
        }}
      >
        {/* Left column - Company Info */}
        <Box width={{ xs: "100%", md: 300 }} textAlign={{ xs: "center", md: "left" }} mb={{ xs: 3, md: 0 }}>
          {/* <img
            src="/images/logos/fintech.png"
            alt="F2 Fintech Logo"
            style={{ width: '90px', height: '90px', marginRight: '10px' }} // Adjust size and margin
          /> */}
          <Typography
            variant="h5"
            sx={{ fontWeight: "600", color: "white", marginBottom: "1rem" }}
          >
            F2-FINTECH
          </Typography>
          <Box display="flex" alignItems="center" sx={{ color: "white", lineHeight: "1.5rem" }}>
            <LocationOnIcon sx={{ marginRight: "0.5rem" }} />
            <Link
              href="https://www.google.com/maps/place/F2+Fintech"
              target="_blank"
              sx={{ color: "white" }}
              underline="none"
            >
              <Typography variant="body1" sx={{ color: "white" }}>
                A-25, M-1 Arv Park, A-Block, Sector-63, Noida Uttar Pradesh - 201301
              </Typography>
            </Link>
          </Box>
          <Box display="flex" alignItems="center" sx={{ color: "white", lineHeight: "1.5rem", mt: '1rem' }}>
            <LocationOnIcon sx={{ marginRight: "0.5rem" }} />
            <Link
              href="https://www.google.com/maps/place/28%C2%B022'20.4%22N+79%C2%B025'25.9%22E/"
              target="_blank"
              sx={{ color: "white" }}
              underline="none"
            >
              <Typography variant="body1" sx={{ color: "white" }}>
                12, Bajaj Complex, Prem Nagar Thana, Bareilly - 243005
              </Typography>
            </Link>
          </Box>
          <Box display="flex" justifyContent={{ xs: "center", md: "flex-start" }} alignItems="center" sx={{ color: "white", lineHeight: "2rem", mt: '1.5rem' }}>
            <LocationOnIcon sx={{ marginRight: "0.5rem" }} />
            <Link
              href="https://www.google.com/maps/place/28%C2%B038'43.7%22N+77%C2%B010'04.5%22E/@28.6454722,77.1679167,17z/data=!3m1!4b1!4m4!3m3!8m2!3d28.6454722!4d77.1679167?hl=en&entry=ttu"
              target="_blank"
              sx={{ color: "white" }}
              underline="none"
            >
              <Typography variant="h6" sx={{ color: "white" }}>
                Office No 59, South Patel Nagar, New Delhi - 110008
              </Typography>
            </Link>
          </Box>
        </Box>

        {/* Middle columns - Company links */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            textAlign: { xs: "center", md: "left" },
            mb: { xs: 3, md: 0 }
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "600", color: "white", marginBottom: "1rem" }}
          >
            Company
          </Typography>
          {["About us", "Blogs", "Privacy Policy", "Term & Condition"].map((text) => (
            <Link
              key={text}
              href="#"
              underline="none"
              variant="body1"
              sx={{ color: "white", marginBottom: "0.5rem" }}
            >
              {text}
            </Link>
          ))}
        </Box>

        {/* Right column - Let's Talk */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "center", md: "flex-start" },
            textAlign: "left",
          }}
        >
          {/* <Typography
            variant="h6"
            sx={{ fontWeight: "600", color: "white", marginBottom: "0.5rem" }}
          >
            Let's Talk
          </Typography> */}
          <Stack
            direction="column"
            spacing={1} // Spacing between items
            sx={{ textAlign: "center", color: "white" }}
          >
            <Link
              href="#"
              underline="none"
              variant="body1"
              sx={{ color: "white" }}
            >
              Have any doubts?
            </Link>
            <Link
              component="button"
              underline="none"
              variant="body1"
              sx={{ color: "white", cursor: "pointer" }}
              onClick={handleContactClick}
            >
              Contact Us
            </Link>
          </Stack>
          {showContactDetails && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: "8px",
                backgroundColor: "white",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                color: "black",
                maxWidth: "400px",
                textAlign: "center",
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
                <PhoneIcon sx={{ marginRight: "0.5rem", color: "black" }} />
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>+91 8810600135</Typography>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
                <EmailIcon sx={{ marginRight: "0.5rem", color: "black" }} />
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>wecare@f2fintech.com</Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Divider sx={{
        backgroundColor: 'rgba(255,255,255,0.5)', // Subtle color for divider
        height: '2px', // Ensures consistent height
        margin: '1rem 0', // Added spacing above and below the divider
        width: '100%', // Makes the divider span the full width
      }} />

      <Box sx={{
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: '0.5rem', // Reduced padding
      }}>
        <Typography sx={{ color: 'white', fontSize: '13px', textAlign: 'center' }}>
          © 2024 All Rights Reserved by F2 Fintech
        </Typography>
      </Box>

      <Typography sx={{
        color: 'white',
        fontSize: '16px',
        mt: 1,
        textAlign: 'center',
      }}>
        True wealth is not measured by the size of your bank account, but by the freedom to live life on your own terms.
      </Typography>
    </Container>
  );
};

export default FooterContent;
