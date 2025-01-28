import React, { useEffect, useState } from 'react';

import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Container,
    Grid,
    Typography,
    useTheme,
    alpha,
    IconButton
} from '@mui/material';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import {
    Wallet,
    CurrencyRupee,
    MoreVert
} from '@mui/icons-material';

import ExpenseForm from '@/components/expenses/ExpenseForm';

// Interfaces for financial data
export interface FinancialCategory {
    name: string;
    value: number;
    percentage: string;  // Include percentage from backend
    color: string;
}

const WarningLetter: React.FC = () => {
    const theme = useTheme();
    const [expenseData, setExpenseData] = useState<FinancialCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [totalValue, setTotalValue] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false); // State to manage form visibility
    const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
    const [propData, setPropData] = useState({});

    // Get the employeeId from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const employeeId = user?.id;

    const handleFormOpen = (expenseId?: string) => {
        setSelectedExpenseId(expenseId || null);  // If expenseId is passed, open form to update, otherwise create new.
        setShowForm(true);  // Show the form
    };

    const handleFormClose = () => {
        setShowForm(false);  // Hide the form
    };

    useEffect(() => {
        if (employeeId) {
            const fetchExpenseData = async () => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/expenses/employee/${employeeId}`);

                    if (!response.ok) {
                        throw new Error('Failed to fetch expense data');
                    }

                    const data = await response.json();

                    setTotalValue(data.totalValue);
                    setPropData(data)

                    // Map the expense data to FinancialCategory format
                    const formattedData = data.expenses.map((expense: any) => ({
                        name: expense.name,
                        value: expense.value,
                        percentage: expense.percentage, // Use the percentage from the backend
                        totalBudget: expense.totalValue,
                        color: getColorForCategory(expense.name, theme)
                    }));

                    setExpenseData(formattedData);
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchExpenseData();
        }
    }, [employeeId, theme]);

    // Function to get color based on category name
    const getColorForCategory = (category: string, theme: any) => {
        switch (category) {
            case 'Housing':
                return theme.palette.primary.main;
            case 'Transportation':
                return theme.palette.secondary.main;
            case 'Food':
                return theme.palette.error.main;
            case 'Entertainment':
                return theme.palette.success.main;
            case 'Savings':
                return theme.palette.warning.main;
            default:
                return theme.palette.grey[500];
        }
    };

    // Render method for pie chart
    const renderPieChart = (
        data: FinancialCategory[],
        title: string,
        icon: React.ReactElement
    ) => (
        <Card
            sx={{
                height: '100%',
                borderRadius: 3,
                boxShadow: theme.shadows[4],
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                    transform: 'scale(1.02)',
                },
            }}
        >

            <CardHeader
                avatar={icon}
                action={

                    // This will display the icon in the top-right corner of the header
                    <IconButton
                        sx={{ color: theme.palette.text.primary }}
                        onClick={() => handleFormOpen()}
                    >
                        <MoreVert />
                    </IconButton>
                }
                title={
                    <Typography
                        variant="h6"
                        color="white"  // Change text color to white
                        sx={{
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                    >
                        {title}
                    </Typography>
                }
                sx={{
                    backgroundColor: '#2e7d32',  // Set background color to green
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }}
            />

            <CardContent
                sx={{
                    backgroundColor: 'white',  // Set background to white for CardContent
                }}
            >
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="53%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name) => [`${value}`, name]}
                            contentStyle={{
                                backgroundColor: 'white',  // Set background color to white
                                color: 'black',            // Set text color to black for better contrast
                                borderRadius: '12px',
                                boxShadow: theme.shadows[2],
                                border: 'none',
                            }}
                            labelStyle={{
                                color: 'blue',  // Set the label text color to blue (change as needed)
                            }}
                        />
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                        />
                    </PieChart>
                </ResponsiveContainer>
                {showForm && (
                    <ExpenseForm
                        title={selectedExpenseId ? "Update Expense" : "Create Expense"}
                        selectedExpenseId={selectedExpenseId}
                        onClose={handleFormClose}
                        propData={propData}
                    />
                )}
            </CardContent>


        </Card>
    );


    // Loading and Error States
    if (loading) {
        return <Typography variant="h6">Loading data...</Typography>;
    }

    if (error) {
        return <Typography variant="h6" color="error">{error}</Typography>;
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Grid container spacing={3}>
                {/* Expense Breakdown */}
                <Grid item xs={16}>
                    {renderPieChart(
                        expenseData,
                        'Expense Breakdown',
                        <Wallet sx={{ fontSize: 32, color: 'white' }} /> // Updated icon color
                    )}

                </Grid>


                {/* Total Summary */}
                <Grid item xs={12}>
                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: theme.shadows[4],
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                        }}
                    >
                        <CardContent>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={4}>
                                    <CurrencyRupee
                                        sx={{
                                            fontSize: 48,
                                            color: 'white',
                                            opacity: 0.8
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            color: 'white',
                                            fontWeight: 600
                                        }}
                                    >
                                        {totalValue?.toLocaleString()}
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            color: 'rgba(255,255,255,0.7)'
                                        }}
                                    >
                                        Total Monthly Budget
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


        </Container>
    );
};

export default WarningLetter;
