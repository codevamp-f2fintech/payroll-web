import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const SubmitPage = ({ handleClose }) => {
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/my-declaration/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Forms submitted successfully!", data);

      // Optionally handle success, e.g., show a success message or navigate
    } catch (error) {
      console.error("Error submitting forms:", error);
      // Optionally handle the error, e.g., show an error message
    }
  };

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography style={{ fontSize: "2em" }} variant="h5" gutterBottom>
          Review and Submit
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </Box>
  );
};

export default SubmitPage;
