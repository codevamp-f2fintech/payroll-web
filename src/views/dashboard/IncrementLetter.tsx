'use client';

import React, { useEffect, useState } from 'react';

import { styled } from '@mui/material/styles';
import {
    Card,
    CardContent,
    Box,
    Typography,
    Grid,
    Chip,
    Paper,
} from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

// Define TypeScript type for payment history data
type Payment = {
    payrollId: string;
    salaryTemplateName: string;
    createdAt: string;
    processedBy: string;
    totalSalary: number;
    baseSalary: number;
    status: string;
};

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
    maxWidth: 1000,
    margin: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    borderRadius: '16px',
    background: '#ffffff !important', // Force white background
}));

const HeaderSection = styled(Box)(({ theme }) => ({
    background: '#2e7d32',
    padding: theme.spacing(4),
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
}));

const PaymentCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    background: '#ffffff !important', // Force white background
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    },
}));

const StatusChip = styled(Chip)(({ status, theme }) => ({
    borderRadius: '6px',
    fontWeight: 500,
    backgroundColor:
        status === 'paid'
            ? '#e8f5e9'
            : status === 'pending'
                ? '#fff3e0'
                : status === 'processed'
                    ? '#e3f2fd'
                    : '#ffebee',
    color:
        status === 'paid'
            ? '#2e7d32'
            : status === 'pending'
                ? '#e65100'
                : status === 'processed'
                    ? '#1565c0'
                    : '#c62828',
}));

// Styled Typography for consistent text color
const StyledTypography = styled(Typography)({
    color: '#000000 !important', // Force black text
});

const PaymentHistory = () => {
    const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_APP_URL}/payroll/${user.id}/salary-summary`
                );

                const result = await response.json();

                if (result.success) {
                    setPaymentHistory(result.data);
                } else {
                    console.error('Failed to fetch payment history:', result.message);
                }
            } catch (error) {
                console.error('Error fetching payment history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentHistory();
    }, []);

    if (loading) {
        return <StyledTypography align="center">Loading...</StyledTypography>;
    }

    if (!paymentHistory.length) {
        return <StyledTypography align="center">No payment history found.</StyledTypography>;
    }

    return (
        <StyledCard>
            <HeaderSection>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PaymentsIcon sx={{ color: 'white', fontSize: 32 }} />
                    <Typography color="white" variant="h4" component="h1">
                        Payment History
                    </Typography>
                </Box>
                <Typography color="white" variant="subtitle1">
                    Track your salary from the past 6 months
                </Typography>
            </HeaderSection>

            <CardContent sx={{ padding: 4, background: '#ffffff !important' }}>
                <Grid container spacing={2}>
                    {paymentHistory.map((payment) => (
                        <Grid item xs={12} key={payment.payrollId}>
                            <PaymentCard>
                                <Box>
                                    <StyledTypography variant="h6" gutterBottom>
                                        {payment.salaryTemplateName}
                                    </StyledTypography>
                                    <StyledTypography variant="body2" sx={{ color: '#666666 !important' }}>
                                        {formatDate(payment.createdAt)}
                                    </StyledTypography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                        <AccountBalanceIcon sx={{ fontSize: 16, color: '#666666' }} />
                                        <StyledTypography variant="body2" sx={{ color: '#666666 !important' }}>
                                            Processed By: {payment.processedBy.toUpperCase()}
                                        </StyledTypography>
                                    </Box>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <StyledTypography
                                        variant="h6"
                                        gutterBottom
                                        sx={{ color: '#2e7d32 !important' }}
                                    >
                                        {formatCurrency(payment.totalSalary)}
                                    </StyledTypography>
                                    <StatusChip
                                        label={payment.status.toUpperCase()}
                                        status={payment.status}
                                        size="small"
                                    />
                                </Box>
                            </PaymentCard>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </StyledCard>
    );
};

export default PaymentHistory;
