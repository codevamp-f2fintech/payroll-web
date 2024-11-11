'use client'
import React from 'react';
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

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
    maxWidth: 1000,
    margin: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    borderRadius: '16px',
}));

const HeaderSection = styled(Box)(({ theme }) => ({
    background: '#2e7d32',
    padding: theme.spacing(4),
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
}));

const PaymentCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
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
        status === 'Completed' ? '#e8f5e9' :
            status === 'Pending' ? '#fff3e0' :
                status === 'Processing' ? '#e3f2fd' : '#ffebee',
    color:
        status === 'Completed' ? '#2e7d32' :
            status === 'Pending' ? '#e65100' :
                status === 'Processing' ? '#1565c0' : '#c62828',
}));

const PaymentHistory = () => {
    // Dummy payment history data
    const paymentHistory = [
        {
            id: 1,
            date: '2024-03-01',
            type: 'Salary',
            amount: 55000,
            status: 'Completed',
            reference: 'SAL-MAR-2024',
            account: 'HDFC-XXXX4589'
        },
        {
            id: 2,
            date: '2024-02-01',
            type: 'Salary',
            amount: 55000,
            status: 'Completed',
            reference: 'SAL-FEB-2024',
            account: 'HDFC-XXXX4589'
        },
        {
            id: 3,
            date: '2024-01-15',
            type: 'Performance Bonus',
            amount: 25000,
            status: 'Completed',
            reference: 'BON-2024-Q1',
            account: 'HDFC-XXXX4589'
        },
        {
            id: 4,
            date: '2024-01-01',
            type: 'Salary',
            amount: 50000,
            status: 'Completed',
            reference: 'SAL-JAN-2024',
            account: 'HDFC-XXXX4589'
        },
        {
            id: 5,
            date: '2023-12-25',
            type: 'Holiday Bonus',
            amount: 10000,
            status: 'Completed',
            reference: 'BON-HOL-2023',
            account: 'HDFC-XXXX4589'
        },
        {
            id: 6,
            date: '2024-04-01',
            type: 'Salary',
            amount: 55000,
            status: 'Processing',
            reference: 'SAL-APR-2024',
            account: 'HDFC-XXXX4589'
        }
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <StyledCard>
            <HeaderSection>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PaymentsIcon sx={{ color: 'white', fontSize: 32 }} />
                    <Typography color='white' variant="h4" component="h1">
                        Payment History
                    </Typography>
                </Box>
                <Typography color='white' variant="subtitle1">
                    Track all your salary and bonus payments
                </Typography>
            </HeaderSection>

            <CardContent sx={{ padding: 4 }}>
                <Grid container spacing={2}>
                    {paymentHistory.map((payment) => (
                        <Grid item xs={12} key={payment.id}>
                            <PaymentCard>
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        {payment.type}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatDate(payment.date)}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                        <AccountBalanceIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {payment.account}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32' }}>
                                        {formatCurrency(payment.amount)}
                                    </Typography>
                                    <StatusChip
                                        label={payment.status}
                                        status={payment.status}
                                        size="small"
                                    />
                                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                                        Ref: {payment.reference}
                                    </Typography>
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
