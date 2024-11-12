import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    TextField,
    FormControl,
    Select,
    InputLabel,
    MenuItem,
    Button,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface AddSalaryComponentFormProps {
    id: string | null;
    handleClose: () => void;
    debouncedFetch: () => void;
}

const AddSalaryComponentForm: React.FC<AddSalaryComponentFormProps> = ({ id, handleClose, debouncedFetch }) => {
    const { salaryComponents } = useSelector((state: RootState) => state.salaryComponents);

    const [formData, setFormData] = useState({
        name: '',
        type: '',
        amount: 0,
        description: '',
    });

    const [errors, setErrors] = useState({
        name: '',
        type: '',
        amount: '',
    });

    const salaryComponentTypes = [
        'Basic salary',
        'Gratuity',
        'ESIC',
        'Bonus',
        'Net salary or take home salary',
        'CTC',
        'Incentives',
        'Overtime',
        'Allowances',
        'Medical allowance',
        'House rent allowance',
        'DA',
        'Net salary',
        'Deductions',
        'Income tax',
        'Perquisites',
        'Conveyance allowance',
        'Professional tax',
        'Leave travel allowance',
        'Employee Provident Fund',
        'Child Education Allowance',
        'EPF',
        'Labour Welfare Fund',
        'Reimbursements',
    ];

    useEffect(() => {
        if (id) {
            const selected = salaryComponents.find((temp) => temp._id === id);
            if (selected) {
                setFormData({
                    name: selected.name,
                    type: selected.type,
                    amount: selected.amount,
                    description: selected.description,
                });
            }
        }
    }, [id, salaryComponents]);

    const validateForm = () => {
        let isValid = true;
        const newErrors = { name: '', type: '', amount: '' };

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        }
        if (!formData.type) {
            newErrors.type = 'Type is required';
            isValid = false;
        }
        if (!formData.amount) {
            newErrors.amount = 'Amount is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target as HTMLInputElement;
        setFormData((prevState) => ({ ...prevState, [name!]: value }));
    };

    const handleSubmit = () => {
        if (validateForm()) {
            const method = id ? 'PUT' : 'POST';
            const url = id
                ? `${process.env.NEXT_PUBLIC_APP_URL}/salary-component/update/${id}`
                : `${process.env.NEXT_PUBLIC_APP_URL}/salary-component/create`;

            fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data) {
                        handleClose();
                        debouncedFetch();
                        toast.success(id ? "Salary Component Successfully Updated" : "Salary Component Successfully Updated")
                    } else {
                        toast.error('Unexpected error occurred');
                    }
                })
                .catch((error) => {
                    toast.error('Error: ' + error.message);
                });
        }
    };

    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography style={{ fontSize: '2em' }} variant="h5" gutterBottom>
                    {id ? 'Edit Salary Component' : 'Add Salary Component'}
                </Typography>
                <IconButton onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Component Name"
                        name="name"
                        placeholder="e.g., Health Insurance"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        error={!!errors.name}
                        helperText={errors.name}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={!!errors.type}>
                        <InputLabel>Type</InputLabel>
                        <Select name="type" value={formData.type} onChange={handleChange} label="Type">
                            {salaryComponentTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.type && <Typography color="error">{errors.type}</Typography>}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Amount (In Rupees)"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        error={!!errors.amount}
                        helperText={errors.amount}
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
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        fullWidth
                        style={{ backgroundColor: '#ff902f' }}
                        onClick={handleSubmit}
                    >
                        {id ? 'Edit Component' : 'Add Component'}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AddSalaryComponentForm;
