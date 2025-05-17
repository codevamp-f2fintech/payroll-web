'use client'
import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, Chip, Tabs, Tab, TextField, Divider, DialogContent, Dialog, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import { Autocomplete } from '@mui/material';
import { Close } from '@mui/icons-material';
import imageCompression from 'browser-image-compression';
import { toast, ToastContainer } from 'react-toastify';

import Loader from '../loader/loader';

import 'react-toastify/dist/ReactToastify.css';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  minWidth: 0,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}));

const ProfileForm = ({ profileId, logedUser, setCalculateFilledTabsCount, setCheckVerify }) => {
  const [tabValue, setTabValue] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [verifyTrigger, setVerifyTrigger] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ src: null, alt: null });
  const [loading, setLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    bankDetails: { bankName: '', accountNumber: '', ifscCode: '', panCardNumber: '', panCardImage: null },
    verify: false
  });

  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState(null);

  const isFormDisabled = userRole !== '1' && logedUser.id !== profileId;


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (section, index, field, value) => {
    if (section === 'academics') {
      setFormData(prevData => ({
        ...prevData,
        academics: prevData.academics.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      }));
    } else {
      // For other sections
      setFormData(prevData => ({
        ...prevData,
        [section]: {
          ...prevData[section],
          [field]: value,
        },
      }));
    }
  };


  // const addAcademic = () => {
  //   setFormData(prevData => ({
  //     ...prevData,
  //     academics: [...prevData.academics, { level: '', institution: '', fromYear: '', toYear: '', details: '' }],
  //   }));
  // };

  // const removeAcademic = (index) => {
  //   setFormData(prevData => ({
  //     ...prevData,
  //     academics: prevData.academics.filter((_, i) => i !== index),
  //   }));
  // };

  const handleFileChange = async (section, field, file) => {
    if (file) {
      const fileSizeInKB = file.size / 1024; // Convert file size from bytes to KB

      // Only compress if file size is greater than 500KB
      if (fileSizeInKB > 500) {
        setIsCompressing(true);
        try {
          const options = {
            maxSizeMB: 0.5, // Target size is 500KB
            maxWidthOrHeight: 1920, // Optional, set max width/height if needed
            useWebWorker: true, // Enable web workers for faster compression
          };

          // Compress the file (returns a Blob)
          const compressedBlob = await imageCompression(file, options);

          // Convert compressed Blob back to a File
          const compressedFile = new File([compressedBlob], file.name, {
            type: file.type,
            lastModified: Date.now(), // You can adjust this to the original lastModified if needed
          });

          // Update formData with the compressed file
          setFormData((prevFormData) => ({
            ...prevFormData,
            [section]: {
              ...prevFormData[section],
              [field]: compressedFile, // Use the File object, not Blob
            },
          }));
        } catch (error) {
          console.error('Error compressing the image:', error);
        } finally {
          setIsCompressing(false);
        }

      } else {
        // If the file is already less than or equal to 500KB, use it directly
        setFormData((prevFormData) => ({
          ...prevFormData,
          [section]: {
            ...prevFormData[section],
            [field]: file,
          },
        }));
        setIsCompressing(false);
      }
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || '{}');
    setUserRole(user.role);
    setUserId(user.id);
  }, []);

  useEffect(() => {
    const checkIfExist = async () => {
      try {
        const checkResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/profile/${profileId}`, {
          method: 'GET',
        });

        if (checkResponse.ok) {
          const data = await checkResponse.json();
          setUpdating(true); // Profile exists
          populateFormData(data);
          setCheckVerify(data.verify)
        } else if (checkResponse.status === 404) {
          setUpdating(false); // Profile does not exist
        }
      } catch (error) {
        console.error('Error checking profile existence:', error);
        setUpdating(false);
      }
    };

    if (profileId) {
      checkIfExist();
    }
  }, [profileId, verifyTrigger]);

  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      employeeId: profileId,
    }));
  }, [profileId]);

  const populateFormData = (data) => {


    setFormData({
      employeeId: data.employeeId || '',
      bankDetails: {
        bankName: data.bankDetails?.bankName || '',
        accountNumber: data.bankDetails?.accountNumber || '',
        ifscCode: data.bankDetails?.ifscCode || '',
        panCardNumber: data.bankDetails?.panCardNumber || '',
        panCardImage: data.bankDetails?.panCardImageUrl, // URL from AWS
      },
      verify: data.verify
    })
  };

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();

    const formDataToSend = new FormData();

    // Append simple data (strings, numbers)
    const appendData = (key, value) => {
      if (value !== null && value !== undefined && value !== '') {
        formDataToSend.append(key, value);
      }
    };

    appendData('employeeId', formData.employeeId);

    Object.entries(formData.bankDetails).forEach(([key, value]) => {
      appendData(`bankDetails_${key}`, value);
    });



    // Only append files if they are selected
    if (formData.panCardImage) {
      appendData('panCardImage', formData.panCardImage);
    }

    appendData('verify', formData.verify);

    try {

      const url = updating
        ? `${process.env.NEXT_PUBLIC_APP_URL}/profile/updateByProfileId/${profileId}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/profile/create`;

      const response = await fetch(url, {
        method: updating ? 'PUT' : 'POST',
        body: formDataToSend,
      });

      if (response.ok) {

        toast.success(updating ? "Profile Updated Successfully!" : "Profile Created Successfully")
        setVerifyTrigger(prev => prev + 1);
        setLoading(false);
      } else {
        console.error('Failed to submit/update profile');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error submitting/updating profile:', error);
      setLoading(false);
    }
  };

  const handleVerifyProfile = async (val) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/profile/updateByVerifyStatus/${profileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verify: val,
        }),
      });

      if (response.ok) {

        setVerifyTrigger(prev => prev + 1);
      } else {
        console.error('Failed to verify profile');
      }
    } catch (error) {
      console.error('Error verifying profile:', error);
    }
  };

  const SectionTitle = ({ iconClass, title }) => (
    <div className="flex items-center space-x-2 mb-2">
      <i className={`${iconClass} text-xl text-blue-500`}></i>
      <h6 className="text-lg font-semibold text-blue-700">{title}</h6>
    </div>
  );

  const handleClickOpen = (imageSrc, imageAlt) => {
    setOpen(true);
    setSelectedImage({ src: imageSrc, alt: imageAlt });
  }
  const handleClose = () => {
    setOpen(false);
  };
  const RenderImage = ({ imageSrc, imageAlt }) => (
    <img
      src={imageSrc instanceof File ? URL.createObjectURL(imageSrc) : imageSrc}
      alt={imageAlt}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        marginTop: '8px',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer'
      }}
    />
  );


  const tabContent = [
    // {
    //   label: 'Skills',
    //   content: (
    //     <Autocomplete
    //       multiple
    //       freeSolo
    //       options={[]}
    //       value={formData.skills}
    //       onChange={(event, newValue) => setFormData(prev => ({ ...prev, skills: newValue }))}
    //       renderTags={(value, getTagProps) =>
    //         value.map((option, index) => (
    //           <Chip variant="outlined" label={option} {...getTagProps({ index })} />
    //         ))
    //       }
    //       renderInput={(params) => (
    //         <TextField
    //           {...params}
    //           variant="outlined"
    //           label="Skills"
    //           placeholder="Press Enter to Add more skills"
    //           fullWidth
    //           disabled={isFormDisabled}
    //         />
    //       )}
    //       disabled={isFormDisabled}
    //     />
    //   ),
    // },
    {
      label: 'Bank Details',
      content: (
        <>
          <TextField
            label="Bank Name"
            fullWidth
            margin="normal"
            value={formData.bankDetails.bankName}
            onChange={(e) => handleInputChange('bankDetails', '', 'bankName', e.target.value)}
            disabled={isFormDisabled}
          />
          <TextField
            label="Account Number"
            fullWidth
            margin="normal"
            value={formData.bankDetails.accountNumber}
            onChange={(e) => handleInputChange('bankDetails', '', 'accountNumber', e.target.value)}
            disabled={isFormDisabled}
          />
          <TextField
            label="IFSC Code"
            fullWidth
            margin="normal"
            value={formData.bankDetails.ifscCode}
            onChange={(e) => handleInputChange('bankDetails', '', 'ifscCode', e.target.value)}
            disabled={isFormDisabled}
          />
          <TextField
            label="PAN Card Number"
            fullWidth
            margin="normal"
            value={formData.bankDetails.panCardNumber}
            onChange={(e) => handleInputChange('bankDetails', '', 'panCardNumber', e.target.value)}
            disabled={isFormDisabled}
          />
          <input
            type="file"
            onChange={(e) => handleFileChange('bankDetails', 'panCardImage', e.target.files[0])}
            disabled={isFormDisabled}
          />

        </>

      ),
    },


    {
      label: logedUser.id === profileId ? 'Preview & Submit' : 'Preview',
      content: (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
          <h4 className="text-center mb-6 text-2xl font-bold text-gray-800">Preview</h4>

          <div className="space-y-6">

            <hr className="border-t border-gray-200" />

            <section>
              <SectionTitle iconClass="ri-bank-card-line" title="Bank Details" />
              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <p>Bank Name: {formData.bankDetails.bankName || 'N/A'}</p>
                <p>Account Number: {formData.bankDetails.accountNumber || 'N/A'}</p>
                <p>IFSC Code: {formData.bankDetails.ifscCode || 'N/A'}</p>
                <p>PAN Card Number: {formData.bankDetails.panCardNumber || 'N/A'}</p>
              </div>
              {formData.bankDetails.panCardImage && (
                <Box sx={{ mt: 2, pl: 2 }}>
                  <Typography variant="subtitle2">PAN Card Image:</Typography>
                  <img
                    src={formData.bankDetails.panCardImage instanceof File
                      ? URL.createObjectURL(formData.bankDetails.panCardImage)
                      : formData.bankDetails.panCardImage}
                    alt="PAN Card"
                    style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '8px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}
                    onClick={() => handleClickOpen(formData.bankDetails.panCardImage, "PAN Card")}
                  />
                </Box>
              )}
            </section>

            <hr className="border-t border-gray-200" />

            {/* <section>
              <SectionTitle iconClass="ri-map-pin-2-line" title="Address Details" />
              <p className="text-gray-700">Permanent Address: {formData.addressDetails.permanentAddress || 'N/A'}</p>
              <p className="text-gray-700">Current Address: {formData.addressDetails.currentAddress || 'N/A'}</p>
              <p className="text-gray-700">Aadhaar Card Number: {formData.addressDetails.aadhaarCardNumber || 'N/A'}</p>
              <div className="flex space-x-4 mt-2">
                {formData.addressDetails.aadhaarFrontImage && (
                  <Box sx={{ mt: 2, pl: 2 }}>
                    <Typography variant="subtitle2">Aadhaar Front Image:</Typography>
                    <img
                      src={formData.addressDetails.aadhaarFrontImage instanceof File
                        ? URL.createObjectURL(formData.addressDetails.aadhaarFrontImage)
                        : formData.addressDetails.aadhaarFrontImage}
                      alt="Aadhaar Front"
                      style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '8px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}
                      onClick={() => handleClickOpen(formData.addressDetails.aadhaarFrontImage, "Aadhaar Front")}
                    />
                  </Box>
                )}
                {formData.addressDetails.aadhaarBackImage && (
                  <Box sx={{ mt: 2, pl: 2 }}>
                    <Typography variant="subtitle2">Aadhaar Back Image:</Typography>
                    <img
                      src={formData.addressDetails.aadhaarBackImage instanceof File
                        ? URL.createObjectURL(formData.addressDetails.aadhaarBackImage)
                        : formData.addressDetails.aadhaarBackImage}
                      alt="Aadhaar Back"
                      style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '8px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}
                      onClick={() => handleClickOpen(formData.addressDetails.aadhaarBackImage, "Aadhaar Back")}
                    />
                  </Box>
                )}
              </div>
            </section>

            <hr className="border-t border-gray-200" />

            <section>
              <SectionTitle iconClass="ri-book-open-line" title="Academics" />
              <div className="grid grid-cols-2 gap-2 text-gray-700">

                {formData.academics.map(aca => {
                  return (
                    <>
                      <p><b>{aca.level} Details: </b></p>
                      <p>{aca.institution}</p>
                      <p>{aca.details}</p>
                      <p>{aca.toYear}-{aca.fromYear}</p>
                    </>
                  )
                })}

              </div>
            </section>

            <hr className="border-t border-gray-200" />

            <section>
              <SectionTitle iconClass="ri-briefcase-4-line" title="Past Experience" />
              {formData.pastExperience.length > 0 ? (
                <div className="space-y-4">
                  {formData.pastExperience.map((exp, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <p ><b>Company Name: </b>{exp.companyName || 'N/A'}</p>
                      <p className="text-sm text-gray-600">
                        {exp.fromYear || 'N/A'} - {exp.toYear || 'N/A'}
                      </p>
                      <p ><b>Last CTC: </b>{exp.lastCtc || 'N/A'}</p>
                      <p ><b>Designation: </b>{exp.designation || 'N/A'}</p>
                      <p ><b>Exp. Reference Name: </b>{exp.referenceName || 'N/A'}</p>
                      <p ><b>Exp. Reference Contact: </b>{exp.referenceContact || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-700">No past experience added</p>
              )}
            </section> */}
          </div>

          {(logedUser.id === profileId || userRole === '1') && (
            <Button
              onClick={handleSubmit}
              disabled={isCompressing || loading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              {isCompressing ? 'Wait Compressing Images...' : updating ? 'Update' : 'Submit'}
            </Button>
          )}

        </div>
      ),
    }
  ];

  const calculateFilledTabs = () => {
    let filledCount = 0;


    // Bank Details tab (up to 1 point)
    if (formData.bankDetails.bankName) filledCount += 1 / 5;
    if (formData.bankDetails.accountNumber) filledCount += 1 / 5;
    if (formData.bankDetails.ifscCode) filledCount += 1 / 5;
    if (formData.bankDetails.panCardNumber) filledCount += 1 / 5;
    if (formData.bankDetails.panCardImage) filledCount += 1 / 5;

    // Address Details tab (up to 1 point)
    // if (formData.addressDetails.permanentAddress) filledCount += 1 / 5;
    // if (formData.addressDetails.currentAddress) filledCount += 1 / 5;
    // if (formData.addressDetails.aadhaarCardNumber) filledCount += 1 / 5;
    // if (formData.addressDetails.aadhaarFrontImage) filledCount += 1 / 5
    // if (formData.addressDetails.aadhaarBackImage) filledCount += 1 / 5

    // // Academics tab (up to 1 point)
    // if (formData.academics.some(aca => aca.level)) filledCount += 1 / 5;
    // if (formData.academics.some(aca => aca.institution)) filledCount += 1 / 5;
    // if (formData.academics.some(aca => aca.fromYear)) filledCount += 1 / 5;
    // if (formData.academics.some(aca => aca.toYear)) filledCount += 1 / 5;
    // if (formData.academics.some(aca => aca.details)) filledCount += 1 / 5;

    // Past Experience tab (up to 1 point)
    // if (formData.pastExperience.some(exp => exp.companyName)) filledCount += 1 / 7;
    // if (formData.pastExperience.some(exp => exp.fromYear)) filledCount += 1 / 7;
    // if (formData.pastExperience.some(exp => exp.toYear)) filledCount += 1 / 7;
    // if (formData.pastExperience.some(exp => exp.lastCtc)) filledCount += 1 / 7;
    // if (formData.pastExperience.some(exp => exp.designation)) filledCount += 1 / 7;
    // if (formData.pastExperience.some(exp => exp.referenceContact)) filledCount += 1 / 7;
    // if (formData.pastExperience.some(exp => exp.referenceName)) filledCount += 1 / 7;


    return (filledCount / (tabContent.length - 1)) * 100;
  };

  useEffect(() => {
    if (calculateFilledTabs()) {
      setCalculateFilledTabsCount(calculateFilledTabs());
    }
  }, [calculateFilledTabs()]);

  if (logedUser.id === profileId || Number(logedUser.role) === 1) {
    return (
      <>
        <form onSubmit={handleSubmit}>
          {loading && (

            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)', // Optional background to dim the screen
                zIndex: 9999, // To make sure it's on top of other components
              }}
            >
              <Loader />
            </Box>
          )}
          <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={false}
          >
            <DialogContent sx={{ position: 'relative' }}>
              <IconButton
                onClick={handleClose}
                sx={{ position: 'absolute', top: '10px', right: '10px', color: '#fff' }}
              >
                <Close color='primary' />
              </IconButton>
              {selectedImage.src && (
                <RenderImage imageSrc={selectedImage.src} imageAlt={selectedImage.alt} />
              )}
            </DialogContent>
          </Dialog>

          <StyledTabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            {tabContent.map((tab, index) => (
              <StyledTab key={index} label={tab.label} />
            ))}
          </StyledTabs>

          <Box sx={{ p: 3 }}>
            {tabContent[tabValue].content}
          </Box>

        </form >

        <Divider />
        {Number(logedUser.role) < 3 &&
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              onClick={() => handleVerifyProfile(true)}
              disabled={!updating || formData.verify}
              variant='contained'
              sx={{ margin: "10px" }}
            >
              {formData.verify ? 'Profile Verified' : 'Verify Profile'}
            </Button>
            {formData.verify &&
              <Button
                onClick={() => handleVerifyProfile(false)}
                disabled={!formData.verify}
                variant='contained'
                color='error'
                sx={{ margin: "10px" }}
              >
                marked as unverified
              </Button>
            }
          </Box>
        }
        <ToastContainer />
      </>
    );
  } else {
    return null;
  }


}

export default ProfileForm
