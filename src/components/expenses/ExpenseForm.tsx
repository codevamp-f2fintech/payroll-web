import React, { useState, useEffect } from 'react'
import {
    Button,
    TextField,
    Grid,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    CircularProgress,
    Box,
    Typography,
    Card,
    CardContent,
    CardHeader,
    Divider
} from '@mui/material'

// Assuming these are the predefined expense categories
const expenseCategories = [
    { name: 'Housing', id: 'housing' },
    { name: 'Transportation', id: 'transportation' },
    { name: 'Food', id: 'food' },
    { name: 'Entertainment', id: 'entertainment' },
    { name: 'Savings', id: 'savings' }
]

// Interface for the expense schema
interface ExpenseFormProps {
    title: string
    onClose: () => void // Close function for the form
    selectedExpenseId?: string // Optional prop for the selected expense ID (used for updating)
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ title, onClose, selectedExpenseId, propData }) => {
    const [selectedExpenses, setSelectedExpenses] = useState<
        {
            id: string
            name: string
            value: number
        }[]
    >([])
    console.log('prop data', propData)

    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [isUpdate, setIsUpdate] = useState<boolean>(false) // To differentiate between create and update
    const [formTitle, setFormTitle] = useState<string>('') // Title state

    // Get employee ID from local storage
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    useEffect(() => {
        if (propData && propData.expenses) {
            setSelectedExpenses(
                propData.expenses.map(expense => ({
                    id: expense.id || '', // Default value in case `id` is undefined
                    name: expense.name || '',
                    value: expense.value || 0
                }))
            )
        } else {
            setSelectedExpenses([{ id: '', name: '', value: 0 }]) // Default empty expense if none
        }
    }, [propData])

    const employeeId = user?.id

    // Handle expense selection (adding an expense to the list of selected expenses)
    const handleExpenseSelect = (event: React.ChangeEvent<{ value: unknown }>, index: number) => {
        const expenseId = event.target.value as string

        if (expenseId === '') {
            // Remove the selected expense if it is empty
            setSelectedExpenses(prevState => prevState.filter((_, i) => i !== index))
        } else {
            setSelectedExpenses(prevState => {
                const updated = [...prevState]
                updated[index] = {
                    ...updated[index],
                    id: expenseId,
                    name: expenseCategories.find(e => e.id === expenseId)?.name || ''
                }
                return updated
            })
        }
    }

    // Handle amount change for a specific expense
    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = parseFloat(event.target.value)

        // Ensure the array is initialized correctly before updating
        setSelectedExpenses(prevState => {
            const updated = [...prevState]

            // Check if the index is within bounds before updating the value
            if (updated[index]) {
                updated[index].value = value
            }

            return updated
        })
    }

    // Handle title change
    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormTitle(event.target.value)
    }

    // Handle form submission (create or update)
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        const expenseData = {
            employeeId,
            title: formTitle, // Include the title in the form submission
            expenses: selectedExpenses.map(expense => ({
                name: expense.name,
                value: expense.value
            }))
        }

        setLoading(true)
        setError(null)

        try {
            const url = isUpdate
                ? `${process.env.NEXT_PUBLIC_APP_URL}/expenses/update/${employeeId}` // Update endpoint
                : `${process.env.NEXT_PUBLIC_APP_URL}/expenses/create` // Create endpoint

            const method = isUpdate ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(expenseData)
            })

            if (!response.ok) {
                throw new Error('Failed to save expense data')
            }

            const data = await response.json()
            alert(isUpdate ? 'Expenses updated successfully!' : 'Expenses created successfully!')
            onClose() // Close the form after success
        } catch (err) {
            setError('An error occurred while processing your request.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card sx={{ maxWidth: 600, margin: '0 auto', borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
                title={<Typography variant='h5'>{isUpdate ? 'Edit Expense Form' : 'Create Expense Form'}</Typography>}
                sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}
            />
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        {/* Title Field */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label='Title'
                                value={formTitle || propData.title}
                                onChange={handleTitleChange}
                                required
                            />
                        </Grid>

                        {/* Render fields for adding multiple expenses */}
                        {propData.expenses.map((expense, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel htmlFor={`expense-${index}`}>Expense</InputLabel>
                                            <Select
                                                id={`expense-${index}`}
                                                value={expense.name || ''}
                                                onChange={e => handleExpenseSelect(e, index)}
                                                label='Expense'
                                            >
                                                <MenuItem value=''>
                                                    <em>None</em>
                                                </MenuItem>

                                                {expenseCategories.map(category => (
                                                    <MenuItem key={category.name} value={category.name}>
                                                        {category.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label='Amount'
                                            type='number'
                                            value={expense.value || ''}
                                            onChange={e => handleAmountChange(e, index)}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        ))}

                        {/* Add new expense field */}
                        <Grid item xs={12}>
                            <Button
                                variant='outlined'
                                onClick={() => setSelectedExpenses(prevState => [...prevState, { id: '', name: '', value: 0 }])}
                            >
                                Add Expense
                            </Button>
                        </Grid>
                    </Grid>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box sx={{ mt: 3 }}>
                            <Button variant='contained' color='primary' type='submit'>
                                {isUpdate ? 'Update' : 'Submit'}
                            </Button>
                            <Button variant='outlined' color='secondary' onClick={onClose} sx={{ ml: 2 }}>
                                Cancel
                            </Button>
                        </Box>
                    )}

                    {error && (
                        <Typography color='error' sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}
                </form>
            </CardContent>
        </Card>
    )
}

export default ExpenseForm
