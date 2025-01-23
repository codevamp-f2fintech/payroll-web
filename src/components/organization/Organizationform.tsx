"use client"
import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem,
  Box,
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';

const OrganizationForm = ({ initialData, debouncedFetch }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    Industry: '',
    establishedYear: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    description: '',
    logo: null,
    logoPreview: '',

  });

  useEffect(() => {
    if (initialData) {
      // Handle the case where address might be a string (parsed JSON)
      let parsedAddress = initialData.address;
      if (typeof initialData.address === 'string') {
        try {
          parsedAddress = JSON.parse(initialData.address);
        } catch (e) {
          console.error('Error parsing address:', e);
          parsedAddress = {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
          };
        }
      }

      setFormData(prev => ({
        ...prev,
        ...initialData,
        address: {
          ...prev.address,
          ...parsedAddress,
        },
        // Preserve logo and logoPreview as they're handled separately
        logo: prev.logo,
        logoPreview: initialData.logo || prev.logoPreview,
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prevState) => ({
        ...prevState,
        address: {
          ...prevState.address,
          [addressField]: value,
        },
      }));
    } else if (name === 'logo') {
      const file = e.target.files[0];
      if (file) {
        setFormData((prevState) => ({
          ...prevState,
          logo: file,
          logoPreview: URL.createObjectURL(file),
        }));
      }
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    const method = initialData ? 'PUT' : 'POST';
    const url = initialData
      ? `${process.env.NEXT_PUBLIC_APP_URL}/organization-profile/update/${initialData._id}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/organization-profile/create`;

    const formDataToSend = new FormData();

    formDataToSend.append('companyName', formData.companyName);
    formDataToSend.append('Industry', formData.Industry);
    formDataToSend.append('establishedYear', formData.establishedYear);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('description', formData.description);

    formDataToSend.append('address', JSON.stringify(formData.address));

    // Append logo file if it exists
    if (formData.logo) {
      formDataToSend.append('file', formData.logo);
    }
    fetch(url, {
      method,
      body: formDataToSend,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {

          toast.success(initialData ? "Orginazation profile Successfully Updated" : "Orginazation profile Successfully Created");
          debouncedFetch();

        } else {
          toast.error('Unexpected error occurred');
        }
      })
      .catch((error) => {
        toast.error('Error: ' + error.message);
      })



  };

  return (
    <>

      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2, boxShadow: 3, borderRadius: 2 }}>
        <ToastContainer position='top-center' />

        <Typography variant="h4" gutterBottom>
          Organization Profile
        </Typography>

        <Grid container spacing={3}>

          {/* Logo Upload */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Upload Logo
            </Typography>
            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              Upload logo
              <input
                type="file"
                name="logo"
                accept="image/*"
                hidden
                onChange={handleChange}
              />
            </Button>
            {formData.logoPreview && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={formData.logoPreview}
                  alt="Logo Preview"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
              </Box>
            )}
          </Grid>


          {/* Company Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Company Details
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Industry"
              name="Industry"
              value={formData.Industry}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Established Year"
              name="establishedYear"
              type="number"
              value={formData.establishedYear}
              onChange={handleChange}
              required

            />
          </Grid>

          {/* Address Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Address
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Postal Code"
              name="address.postalCode"
              value={formData.address.postalCode}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Country"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
            />
          </Grid>

          {/* Contact Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              fullWidth>
              Submit
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>

  );
};

export default OrganizationForm;
