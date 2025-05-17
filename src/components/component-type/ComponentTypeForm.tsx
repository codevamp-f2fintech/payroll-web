import {
  Button,
  Typography,
  Box,
  Grid,
  IconButton,
  TextField,
  Dialog,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
} from '@mui/material';
import { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';

const ComponentsForm = ({ id, handleClose, componentTypes, debouncedFetch }) => {
  const { company_id } = typeof window !== "undefined" ? JSON.parse(localStorage.getItem('user')) : {};

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    company_id: company_id
  });

  const [errors, setErrors] = useState({
    name: '',
    type: '',
  });

  useEffect(() => {
    if (id) {
      const selected = componentTypes.find(des => des._id === id);

      if (selected) {
        setFormData({
          name: selected.name,
          type: selected.type,
          company_id: selected.company_id
        });
      }
    }
  }, [id, componentTypes])

  const validateForm = () => {
    let isValid = true;

    const newErrors = {
      name: '',
      type: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'name is required';
      isValid = false;
    }

    setErrors(newErrors);

    return isValid

  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${process.env.NEXT_PUBLIC_APP_URL}/component-type/update/${id}` : `${process.env.NEXT_PUBLIC_APP_URL}/component-type/create`;

      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            if (data.message.includes('success')) {
              toast.success(data.message, {
                position: 'top-center',
              });
              handleClose();
              debouncedFetch();
            } else {
              // This is where the error handling needs to be fixed
              toast.error(data.message, {
                position: 'top-center',
              });
            }
          } else {
            toast.error('Unexpected error occurred', {
              position: 'top-center',
            });
          }
        })
        .catch(error => {
          toast.error('Error: ' + error.message, {
            position: 'top-center',
          });
        });
    }
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography style={{ fontSize: '2em' }} variant='h5' gutterBottom>
          {id ? 'Edit Component Type' : 'Add Component Type'}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Component Name'
            name='name'
            value={formData.name}
            onChange={handleChange}
            required
            error={!!errors.name}
            helperText={errors.name}
            FormHelperTextProps={{
              style: { color: 'red' }
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.type}>
            <InputLabel id="type-select-label">Select type</InputLabel>
            <Select
              label="Select type"
              labelId="type-select-label"
              id="type-select"
              name="type"
              value={formData.type}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="Earning">Earning</MenuItem>
              <MenuItem value="Benefit">Benefit</MenuItem>
              <MenuItem value="Reimbursement">Reimbursement</MenuItem>
              <MenuItem value="Deduction">Deduction</MenuItem>
            </Select>
            {errors.type && (
              <Typography color="error">{errors.type}</Typography>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'white',
              padding: 15,
              backgroundColor: '#2e7d32',
              width: 200,
            }}
            variant='contained'
            fullWidth
            onClick={handleSubmit}
          >
            {id ? 'Edit' : 'Add'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ComponentsForm;
