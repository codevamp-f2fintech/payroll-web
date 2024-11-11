'use client'
import React from 'react';
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

// Styled Components
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

const CategoryCard = styled(Card)(({ theme }) => ({
    height: '100%',
    position: 'relative',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
        '& .arrow-icon': {
            opacity: 1,
        },
    },
}));

const IconContainer = styled(Box)(({ bgcolor }) => ({
    width: 48,
    height: 48,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: bgcolor,
    marginBottom: 16,
}));

const ArrowIcon = styled(NorthEastIcon)({
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0,
    transition: 'opacity 0.3s ease',
});

const SalaryPackage = () => {
    const salaryDetails = {
        basic: 50000,
        hra: 20000,
        allowances: 10000,
        bonus: 5000,
    };

    const totalSalary = Object.values(salaryDetails).reduce((a, b) => a + b, 0);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const categories = [
        {
            label: 'Basic Salary',
            amount: salaryDetails.basic,
            icon: AttachMoneyIcon,
            bgcolor: 'rgba(25, 118, 210, 0.1)',
            iconColor: 'primary',
        },
        {
            label: 'HRA',
            amount: salaryDetails.hra,
            icon: HomeIcon,
            bgcolor: 'rgba(46, 125, 50, 0.1)',
            iconColor: 'success',
        },
        {
            label: 'Allowances',
            amount: salaryDetails.allowances,
            icon: WorkIcon,
            bgcolor: 'rgba(245, 124, 0, 0.1)',
            iconColor: 'warning',
        },
        {
            label: 'Bonus',
            amount: salaryDetails.bonus,
            icon: CardGiftcardIcon,
            bgcolor: 'rgba(156, 39, 176, 0.1)',
            iconColor: 'secondary',
        },
    ];

    return (
        <StyledCard>
            <StyledCardHeader
                title={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography color='white' variant="h4">Salary Package Breakdown</Typography>
                        <Box textAlign="right">
                            <Typography color='white' variant="subtitle1" sx={{ opacity: 0.8 }}>
                                Total Package
                            </Typography>
                            <Typography color='white' variant="h4" sx={{ fontWeight: 'bold' }}>
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
                                <CategoryCard>
                                    <CardContent>
                                        <ArrowIcon className="arrow-icon" color="action" />
                                        <IconContainer bgcolor={category.bgcolor}>
                                            <IconComponent color={category.iconColor} />
                                        </IconContainer>
                                        <Typography variant="subtitle1" color="textSecondary">
                                            {category.label}
                                        </Typography>
                                        <Typography variant="h4" sx={{ my: 1, fontWeight: 'bold' }}>
                                            {formatCurrency(category.amount)}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {((category.amount / totalSalary) * 100).toFixed(1)}% of total
                                        </Typography>
                                    </CardContent>
                                </CategoryCard>
                            </Grid>
                        );
                    })}
                </Grid>
            </CardContent>
        </StyledCard>
    );
};

export default SalaryPackage;
