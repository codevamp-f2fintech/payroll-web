'use client';
import React, { useEffect, useState } from 'react';

import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    Typography,
    Box,
    styled,
    Icon,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

// Define the interface for salary details
interface SalaryDetail {
    _id: string;
    salarytype: string;
    type: string;
    otherType: string;
    amount: number;
    description: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
    maxWidth: 1200,
    margin: '2rem auto',
    background: '#ffffff',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    borderRadius: 16,
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
    background: '#2e7d32',
    color: 'white',
    padding: '1.5rem',
    '& .MuiCardHeader-title': {
        color: 'white',
        fontSize: '1.8rem',
        fontWeight: 600,
    },
    '& .MuiCardHeader-subheader': {
        color: 'rgba(255, 255, 255, 0.8)',
    },
}));

// New styled component for inner cards with fixed text color
const StyledInnerCard = styled(Card)({
    background: '#ffffff !important',
    '& .MuiCardContent-root': {
        background: '#ffffff !important',
    },
    '& .MuiTypography-root': {
        color: '#000000 !important', // Force black text color
    },
});

// Styled Typography for consistent text color
const StyledTypography = styled(Typography)({
    color: '#000000 !important', // Force black text color
});

const SalaryPackage = () => {
    const [salaryDetails, setSalaryDetails] = useState<SalaryDetail[]>([]);
    const [deductionDetails, setDeductionDetails] = useState<SalaryDetail[]>([]);
    const [totalSalary, setTotalSalary] = useState(0);
    const [baseSalary, setBaseSalary] = useState(0);

    useEffect(() => {
        const fetchSalaryDetails = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const employeeId = user?.id;

                if (!employeeId) {
                    console.error('Employee ID not found in local storage');

                    return;
                }

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_APP_URL}/payroll/${employeeId}/earnings`
                );

                const result = await response.json();

                if (result.success) {
                    const earnings = result.data.earnings;
                    const deductions = result.data.deductions;
                    const base = result.data.baseSalary;
                    const total = earnings.reduce((sum, earning) => sum + earning.amount, 0) + base - deductions.reduce((sum, deduction) => sum + deduction.amount, 0);

                    setSalaryDetails(earnings);
                    setDeductionDetails(deductions);
                    setBaseSalary(base);
                    setTotalSalary(total);
                }
            } catch (error) {
                console.error('Error fetching salary details:', error);
            }
        };

        fetchSalaryDetails();
    }, []);

    const categories = [
        {
            label: 'Base Salary',
            amount: baseSalary,
            icon: CurrencyRupeeIcon,
            bgcolor: 'rgba(25, 118, 210, 0.1)',
            iconColor: 'primary',
        },
        ...salaryDetails.map((item) => ({
            label: item.type === 'Others' ? item.otherType : item.type,
            amount: item.amount,
            icon:
                item.type === 'baseSalary'
                    ? AttachMoneyIcon
                    : item.type === 'HRA'
                        ? HomeIcon
                        : item.type === 'Allowances'
                            ? WorkIcon
                            : item.type === 'Medical allowance'
                                ? CardGiftcardIcon
                                : item.type === 'Bonus'
                                    ? CardGiftcardIcon
                                    : NorthEastIcon,
            bgcolor:
                item.type === 'baseSalary'
                    ? 'rgba(25, 118, 210, 0.1)'
                    : item.type === 'HRA'
                        ? 'rgba(46, 125, 50, 0.1)'
                        : item.type === 'Allowances'
                            ? 'rgba(245, 124, 0, 0.1)'
                            : item.type === 'Medical allowance'
                                ? 'rgba(0, 188, 212, 0.1)'
                                : item.type === 'Bonus'
                                    ? 'rgba(255, 193, 7, 0.1)'
                                    : 'rgba(156, 39, 176, 0.1)',
            iconColor:
                item.type === 'baseSalary'
                    ? 'primary'
                    : item.type === 'HRA'
                        ? 'success'
                        : item.type === 'Allowances'
                            ? 'warning'
                            : item.type === 'Medical allowance'
                                ? 'info'
                                : item.type === 'Bonus'
                                    ? 'warning'
                                    : 'secondary',
        })),
        ...deductionDetails.map((item) => ({
            label: item.type === 'Others' ? item.otherType : item.type,
            amount: -item.amount,
            icon:
                item.type === 'Tax'
                    ? NorthEastIcon
                    : item.type === 'Loan'
                        ? AttachMoneyIcon
                        : item.type === 'Other deductions'
                            ? WorkIcon
                            : NorthEastIcon,
            bgcolor:
                item.type === 'Tax'
                    ? 'rgba(255, 87, 34, 0.1)'
                    : item.type === 'Loan'
                        ? 'rgba(255, 193, 7, 0.1)'
                        : 'rgba(156, 39, 176, 0.1)',
            iconColor:
                item.type === 'Tax'
                    ? 'error'
                    : item.type === 'Loan'
                        ? 'warning'
                        : 'secondary',
        })),
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <StyledCard>
            <StyledCardHeader
                title={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography color="white" variant="h4">
                            Compensation Details
                        </Typography>
                        <Box textAlign="right">
                            <Typography color="white" variant="h4" sx={{ fontWeight: 'bold' }}>
                                {formatCurrency(totalSalary)}
                            </Typography>
                        </Box>
                    </Box>
                }
            />
            <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {categories.map((category, index) => {
                        const IconComponent = category.icon;


                        return (
                            <Grid item xs={12} md={6} key={index}>
                                <StyledInnerCard>
                                    <CardContent>
                                        <Box bgcolor={category.bgcolor} p={1} borderRadius={2}>
                                            <IconComponent color={category.iconColor} />
                                        </Box>
                                        <StyledTypography>{category.label}</StyledTypography>
                                        <StyledTypography>{formatCurrency(category.amount)}</StyledTypography>
                                    </CardContent>
                                </StyledInnerCard>
                            </Grid>
                        );
                    })}
                </Grid>
            </CardContent>
        </StyledCard>
    );
};

export default SalaryPackage;
