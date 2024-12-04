import React, { useState, useMemo, useEffect } from 'react'
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Select,
    MenuItem,
    Card,
    CardContent,
    CardHeader,
    IconButton,
    Tooltip,
    TablePagination,
    Chip
} from '@mui/material'
import {
    AttachMoney as AttachMoneyIcon,
    People as PeopleIcon,
    Calculate as CalculateIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Search as SearchIcon
} from '@mui/icons-material'
import { CurrencyRupee as CurrencyRupeeIcon } from '@mui/icons-material'
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts'
import { employeesCountResponse, getEmployeesWithoutPagination } from '@/utility/apiResponse/employeesResponse'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { fetchEmployees } from '@/redux/features/employees/employeesSlice'
import { totalAndAverageSalaryResponse } from '@/utility/payroll/totalNetSalAndAvg'

// TypeScript Interfaces
interface Employee {
    id: number
    name: string
    email: string
    department: string
    position: string
    salary: number
    bonus: number
    hireDate: Date
    status: 'active' | 'inactive'
    netPay: number
}

const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations']
const positions = ['Junior', 'Senior', 'Lead', 'Manager', 'Director']

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]

const years = Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index)

const AdminDashboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()

    const { employees, loading } = useSelector((state: RootState) => state.employees)

    const [searchTerm, setSearchTerm] = useState('')
    const [filterDepartment, setFilterDepartment] = useState('')
    const [totalEmployeesCount, setTotalEmployeesCount] = useState(0)
    const [totalPayroll, setTotalPayroll] = useState<number>(0)
    const [averageSalary, setAverageSalary] = useState<number>(0)
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1) // Default to current month
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()) // Default to current year
    const [salaryDistributionData, setSalaryDistributionData] = useState<any[]>([])
    const [loadingSalaryDistribution, setLoadingSalaryDistribution] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [allEmployees, setAllEmployees] = useState<any[]>([])
    const [departments, setDepartments] = useState<string[]>([]) // New state for departments


    // Pagination
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)

    useEffect(() => {
        dispatch(fetchEmployees({ page: page + 1, limit: rowsPerPage, search: searchTerm }))
    }, [dispatch, page, rowsPerPage, searchTerm])

    useEffect(() => {
        const fetchPayrollData = async () => {
            try {
                const { totalSalary, averageSalary } = await totalAndAverageSalaryResponse(selectedMonth, selectedYear) // Pass the correct month and year
                setTotalPayroll(totalSalary)
                setAverageSalary(averageSalary)
            } catch (error) {
                console.error('Failed to fetch total payroll and average salary:', error)
            }
        }

        fetchPayrollData()
    }, [selectedMonth, selectedYear])

    useEffect(() => {
        const fetchEmployeeCount = async () => {
            try {
                const count = await employeesCountResponse()
                setTotalEmployeesCount(count) // Assuming the API returns an object with a `total` field
            } catch (error) {
                console.error('Failed to fetch total employees count:', error)
            }
        }

        fetchEmployeeCount()
    }, [])

    useEffect(() => {
        const fetchSalaryDistribution = async () => {
            setLoadingSalaryDistribution(true)
            setError(null)
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_APP_URL}/payroll/salary-distribution?month=${selectedMonth}&year=${selectedYear}`
                )
                if (!response.ok) {
                    throw new Error('Failed to fetch salary distribution data')
                }
                const data = await response.json()
                const salaryData = data.data || [] // Ensure data is an array

                // Create a set of all departments from the API or predefined list
                const departmentsFromAPI = salaryData.map(item => item.department);
                const allDepartments = [...new Set([...departments, ...departmentsFromAPI])];  // Combine predefined and API departments

                // Create a default structure for the department data
                const completeSalaryData = allDepartments.map((dept) => {
                    const existingData = salaryData.find(item => item.department === dept);
                    return {
                        department: dept,
                        averageSalary: existingData ? existingData.averageSalary : 0, // Default to 0 if no data
                    };
                });

                setSalaryDistributionData(completeSalaryData); // Now this will include departments with 0 salary data for missing months
            } catch (error) {
                setError('Failed to fetch salary distribution data')
            } finally {
                setLoadingSalaryDistribution(false)
            }
        }

        fetchSalaryDistribution()
    }, [selectedMonth, selectedYear])


    useEffect(() => {
        if (salaryDistributionData && salaryDistributionData.length > 0) {
            const departmentList = salaryDistributionData.map(item => item.department)
            setDepartments(departmentList)
        }
    }, [salaryDistributionData])

    useEffect(() => {
        const fetchEmployees = async () => {
            setError(null)
            try {
                const employeesData = await getEmployeesWithoutPagination()
                setAllEmployees(employeesData.data) // Assuming the response contains a 'data' field
            } catch (error: any) {
                setError(error.message || 'Failed to fetch employee data')
            } finally {
            }
        }

        fetchEmployees()
    }, [])



    // Export Functionality
    const handleExportEmployees = () => {
        const csvContent = [
            ['ID', 'Name', 'Email', 'Department', 'Position', 'Status'],
            ...allEmployees.map(emp => [emp.code, emp.first_name, emp.email, emp.department, emp.designation, emp.status])
        ]
            .map(e => e.join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', 'employees_payroll.csv')
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    return (
        <Container maxWidth='lg' sx={{ mt: 4 }}>
            <Typography variant='h4' gutterBottom>
                Payroll Management Dashboard
            </Typography>

            {/* Search and Filter */}
            <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
                <TextField
                    variant='outlined'
                    placeholder='Search'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon />
                    }}
                />
                {/* <Select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} displayEmpty>
                    <MenuItem value=''>All Departments</MenuItem>
                    {departments.map(dept => (
                        <MenuItem key={dept} value={dept}>
                            {dept}
                        </MenuItem>
                    ))}
                </Select> */}
                <Select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(Number(e.target.value))}
                    displayEmpty
                    sx={{ width: 120 }}
                >
                    {months.map((monthName, index) => (
                        <MenuItem key={index} value={index + 1}>
                            {monthName}
                        </MenuItem>
                    ))}
                </Select>

                {/* Year Dropdown */}
                <Select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} sx={{ width: 120 }}>
                    {years.map(year => (
                        <MenuItem key={year} value={year}>
                            {year}
                        </MenuItem>
                    ))}
                </Select>

                <Button variant='contained' color='primary' startIcon={<DownloadIcon />} onClick={handleExportEmployees}>
                    Export
                </Button>
            </Box>

            {/* Dashboard Grid */}
            <Grid container spacing={3}>
                {/* Overview Cards */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardHeader avatar={<PeopleIcon color='primary' />} title='Total Employees' />
                        <CardContent>
                            <Typography variant='h5'>{totalEmployeesCount}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardHeader avatar={<CurrencyRupeeIcon color='success' />} title='Total Payroll' />
                        <CardContent>
                            <Typography variant='h5'>₹{totalPayroll.toLocaleString()}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardHeader avatar={<CurrencyRupeeIcon color='secondary' />} title='Average Salary' />
                        <CardContent>
                            <Typography variant='h5'>₹{averageSalary.toLocaleString()}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Salary Distribution Chart */}
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title='Salary Distribution by Department' />
                        <CardContent>
                            {loadingSalaryDistribution ? (
                                <Typography>Loading...</Typography>
                            ) : error ? (
                                <Typography color='error'>{error}</Typography>
                            ) : (
                                <ResponsiveContainer width='100%' height={300}>
                                    <BarChart data={salaryDistributionData}>
                                        <XAxis dataKey='department' />
                                        <YAxis />
                                        <ChartTooltip />
                                        <Bar dataKey='averageSalary' fill='#8884d8' />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Employee List */}
                <Grid item xs={12}>
                    <Paper sx={{ width: '100%', mb: 2 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Department</TableCell>
                                        <TableCell>Position</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {employees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(employee => (
                                        <TableRow key={employee._id}>
                                            <TableCell>
                                                {employee.first_name} {employee.last_name}
                                            </TableCell>
                                            <TableCell>{employee.email}</TableCell>
                                            <TableCell>{employee.department}</TableCell>
                                            <TableCell>{employee.designation}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={employee.status}
                                                    color={employee.status === 'active' ? 'success' : 'default'}
                                                    size='small'
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component='div'
                            count={totalEmployeesCount}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            onRowsPerPageChange={event => {
                                setRowsPerPage(parseInt(event.target.value, 10))
                                setPage(0)
                            }}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    )
}

export default AdminDashboard
