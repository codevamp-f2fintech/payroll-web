import React, { useState, useMemo, useEffect } from 'react'
import '@fontsource/libre-franklin';


import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
    AppBar,
    Toolbar,
    IconButton
    ,
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
    Tooltip,
    TablePagination,
    Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';



import { useTheme } from '@mui/material/styles'
import {
    AttachMoney as AttachMoneyIcon,
    People as PeopleIcon,
    Calculate as CalculateIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Search as SearchIcon
    , CurrencyRupee as CurrencyRupeeIcon
    , Fullscreen as FullscreenIcon
} from '@mui/icons-material'


import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell } from 'recharts'

import { useDispatch, useSelector } from 'react-redux'

import { employeesCountResponse, getEmployeesWithoutPagination } from '@/utility/apiResponse/employeesResponse'
import type { AppDispatch, RootState } from '@/redux/store'
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
    const theme = useTheme()
    const dispatch = useDispatch<AppDispatch>()

    // Department colors mapping

    const departmentColors = {
        'Marketing': '#4ECDC4',
        'Sales': '#45B7D1',
        'HR': '#ff6361',
        'IT': '#ffa600',
        'Finance': '#FFEEAD',
    };


    const { employees, loading } = useSelector((state: RootState) => state.employees)

    const [searchTerm, setSearchTerm] = useState('')
    const [filterDepartment, setFilterDepartment] = useState('')
    const [totalEmployeesCount, setTotalEmployeesCount] = useState(0)
    const [totalPayroll, setTotalPayroll] = useState<number>(0)
    const [averageSalary, setAverageSalary] = useState<number>(0)
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
    const [salaryDistributionData, setSalaryDistributionData] = useState<any[]>([])
    const [loadingSalaryDistribution, setLoadingSalaryDistribution] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [allEmployees, setAllEmployees] = useState<any[]>([])
    const [departments, setDepartments] = useState<string[]>([])
    const [isFullScreen, setIsFullScreen] = useState(false)

    // Pagination
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)

    const handlePayPeriodChange = (e) => {
        const { value } = e.target;
        const [year, month] = value.split('-');

        setSelectedYear(year);
        setSelectedMonth(month);
    };

    useEffect(() => {
        dispatch(fetchEmployees({ page: page + 1, limit: rowsPerPage, search: searchTerm }))
    }, [dispatch, page, rowsPerPage, searchTerm])

    useEffect(() => {
        const fetchPayrollData = async () => {
            try {
                const { totalSalary, averageSalary } = await totalAndAverageSalaryResponse(selectedMonth, selectedYear)

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

                setTotalEmployeesCount(count)
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
                const salaryData = data.data || []

                const departmentsFromAPI = salaryData.map(item => item.department);
                const allDepartments = [...new Set([...departments, ...departmentsFromAPI])];

                const completeSalaryData = allDepartments.map((dept) => {
                    const existingData = salaryData.find(item => item.department === dept);


                    return {
                        department: dept,
                        averageSalary: existingData ? existingData.averageSalary : 0,
                    };
                });

                setSalaryDistributionData(completeSalaryData);
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

                setAllEmployees(employeesData.data)
            } catch (error: any) {
                setError(error.message || 'Failed to fetch employee data')
            }
        }

        fetchEmployees()
    }, [])

    const handleExportEmployees = () => {
        const csvContent = [
            ['ID', 'Name', 'Email', 'Department', 'Position', 'Status'],
            ...allEmployees.map(emp => [emp.code, `${emp.first_name} ${emp.last_name}`, emp.email, emp.department, emp.designation, emp.status])
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

            <Box sx={{ display: 'flex', mb: 2, gap: 2, alignItems: 'center' }}>
                <TextField
                    variant="outlined"
                    placeholder="Search Employee.."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <button
                                style={{
                                    backgroundColor: 'orangered',
                                    border: 'none',
                                    borderRadius: '50%',
                                    color: 'white',
                                    cursor: 'pointer',
                                    height: '50px',
                                    width: '50px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    position: 'absolute',
                                    left: '-5px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 1,
                                }}
                            >
                                <i className="fa fa-search" style={{ fontSize: '16px' }}></i>
                            </button>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '45px',
                            paddingLeft: '50px',
                            backgroundColor: 'white',
                            position: 'relative',
                            height: '50px',
                        },
                        '& .MuiOutlinedInput-input': {
                            padding: '12px 20px',
                            fontSize: '16px',
                            color: 'gray',
                        },
                        width: '100%',
                        maxWidth: '500px',
                    }}
                />

                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Pay Period"
                        name="payPeriod"
                        type="month"
                        value={selectedYear && selectedMonth ? `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}` : ''}
                        onChange={handlePayPeriodChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                            maxWidth: '250px',
                        }}
                    />
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexGrow: 1 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportEmployees}
                        sx={{
                            margin: '10px',
                            padding: '15px 30px',
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            transition: '0.5s',
                            backgroundSize: '200% auto',
                            color: 'white',
                            borderRadius: '10px',
                            display: 'block',
                            border: 0,
                            fontWeight: 700,
                            boxShadow: '0px 0px 14px -7px #f09819',
                            backgroundImage: 'linear-gradient(45deg, #ff512f 0%, #f09819 51%, #ff512f 100%)',
                            cursor: 'pointer',
                            userSelect: 'none',
                            '-webkit-user-select': 'none',
                            touchAction: 'manipulation',
                            height: '80%',
                            minHeight: '50px',
                            fontSize: '14px',
                            '&:hover': {
                                backgroundPosition: 'right center',
                                color: '#fff',
                                textDecoration: 'none',
                            },
                            '&:active': {
                                transform: 'scale(0.95)',
                            },
                        }}
                    >
                        Export
                    </Button>
                </Box>
            </Box>



            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{
                        background: 'linear-gradient(45deg, rgb(198, 231, 255) 59.8%, rgb(212, 246, 255) 59.8%)',
                        boxShadow: 'none',
                    }}>
                        <CardHeader
                            avatar={<PeopleIcon color="primary" />}
                            title="Total Employees"
                            sx={{
                                '& .MuiCardHeader-title': {
                                    fontWeight: 'bold',
                                    fontSize: '1.25rem',
                                    color: 'black',
                                },
                            }}
                        />
                        <CardContent>
                            <Typography variant='h5' sx={{ color: 'black' }}>{totalEmployeesCount}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{
                        background: 'linear-gradient(45deg, rgb(198, 231, 255) 59.8%, rgb(212, 246, 255) 59.8%)',
                        boxShadow: 'none',
                    }}>
                        <CardHeader
                            avatar={<CurrencyRupeeIcon color="success" />}
                            title="Total Payroll"
                            sx={{
                                '& .MuiCardHeader-title': {
                                    fontWeight: 'bold',
                                    fontSize: '1.25rem',
                                    color: 'black',
                                },
                            }}
                        />
                        <CardContent>
                            <Typography variant='h5' sx={{ color: 'black' }}>₹{totalPayroll.toLocaleString()}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{
                        background: 'linear-gradient(45deg, rgb(198, 231, 255) 59.8%, rgb(212, 246, 255) 59.8%)',
                        boxShadow: 'none',
                    }}>
                        <CardHeader
                            avatar={<CurrencyRupeeIcon color="secondary" />}
                            title="Average Salary"
                            sx={{
                                '& .MuiCardHeader-title': {
                                    fontWeight: 'bold',
                                    fontSize: '1.25rem',
                                    color: 'black',
                                },
                            }}
                        />
                        <CardContent>
                            <Typography variant='h5' sx={{ color: 'black' }}>₹{averageSalary.toLocaleString()}</Typography>
                        </CardContent>
                    </Card>
                </Grid>


                <Grid item xs={12}>
                    <Card>
                        <CardHeader
                            title='Salary Distribution by Department'
                            action={
                                <IconButton
                                    onClick={() => setIsFullScreen(true)}
                                >
                                    <FullscreenIcon />
                                </IconButton>
                            }
                        />
                        <CardContent>
                            <ResponsiveContainer width='100%' height={300}>
                                <BarChart data={salaryDistributionData}>
                                    <XAxis
                                        dataKey='department'
                                        tick={{ fill: theme.palette.mode === 'dark' ? '#fff' : '#666' }}
                                        stroke={theme.palette.mode === 'dark' ? '#fff' : '#666'}
                                    />
                                    <YAxis
                                        tick={{ fill: theme.palette.mode === 'dark' ? '#fff' : '#666' }}
                                        stroke={theme.palette.mode === 'dark' ? '#fff' : '#666'}
                                    />
                                    <ChartTooltip />
                                    <Bar
                                        dataKey='averageSalary'
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {salaryDistributionData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={departmentColors[entry.department] || '#8884d8'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Fullscreen Dialog */}
                    <Dialog
                        open={isFullScreen}
                        onClose={() => setIsFullScreen(false)}
                        fullScreen
                    >
                        <AppBar sx={{ position: 'relative' }}>
                            <Toolbar>
                                <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
                                    Salary Distribution by Department
                                </Typography>
                                <IconButton
                                    edge="start"
                                    color="inherit"
                                    onClick={() => setIsFullScreen(false)}
                                    aria-label="close"
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Toolbar>
                        </AppBar>
                        <Box sx={{ width: '100%', height: '90vh', p: 2 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salaryDistributionData}>
                                    <XAxis
                                        dataKey='department'
                                        tick={{ fill: theme.palette.mode === 'dark' ? '#fff' : '#666' }}
                                        stroke={theme.palette.mode === 'dark' ? '#fff' : '#666'}
                                    />
                                    <YAxis
                                        tick={{ fill: theme.palette.mode === 'dark' ? '#fff' : '#666' }}
                                        stroke={theme.palette.mode === 'dark' ? '#fff' : '#666'}
                                    />
                                    <ChartTooltip />
                                    <Bar
                                        dataKey='averageSalary'
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {salaryDistributionData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={departmentColors[entry.department] || '#8884d8'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Dialog>
                </Grid>

                <Grid item xs={12}>
                    <Paper
                        sx={{
                            width: '100%',
                            mb: 2,
                            boxShadow: 4,
                            borderRadius: 3,
                            overflow: 'hidden',
                            backgroundColor: 'black',
                        }}
                    >
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow
                                        sx={{
                                            backgroundColor: '#2C3E50',
                                        }}
                                    >
                                        {['Name', 'Email', 'Department', 'Position', 'Status'].map((header) => (
                                            <TableCell
                                                key={header}
                                                sx={{
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: '16px',
                                                    textTransform: 'uppercase',
                                                    fontFamily: '"Libre Franklin", sans-serif',
                                                }}
                                            >
                                                {header}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {employees
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((employee, index) => (
                                            <TableRow
                                                key={employee._id}
                                                sx={{
                                                    backgroundColor: index % 2 === 0 ? '#F4F4F4' : '#EAF2F8',
                                                    '&:hover': {
                                                        backgroundColor: '#DFF6FF',
                                                    },
                                                }}
                                            >
                                                <TableCell sx={{ color: '#333333' }}>
                                                    {employee.first_name} {employee.last_name}
                                                </TableCell>
                                                <TableCell sx={{ color: '#333333' }}>{employee.email}</TableCell>
                                                <TableCell sx={{ color: '#333333' }}>{employee.department}</TableCell>
                                                <TableCell sx={{ color: '#333333' }}>{employee.designation}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={employee.status}
                                                        color={employee.status === 'active' ? 'success' : 'error'}
                                                        size="small"
                                                        icon={
                                                            employee.status === 'active' ? (
                                                                <CheckCircleOutlineIcon />
                                                            ) : (
                                                                <RemoveCircleOutlineIcon />
                                                            )
                                                        }
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            textTransform: 'capitalize',
                                                            color: 'white',
                                                            backgroundColor:
                                                                employee.status === 'active'
                                                                    ? '#28A745'
                                                                    : '#DC3545',
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={totalEmployeesCount}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(parseInt(event.target.value, 10));
                                setPage(0);
                            }}
                            sx={{
                                backgroundColor: '#2C3E50',
                                borderTop: '1px solid #444444',
                                color: 'white',
                                '& .MuiTablePagination-toolbar': {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    color: 'white',
                                },
                                '& .MuiTablePagination-selectLabel': {
                                    color: 'white',
                                },
                                '& .MuiTablePagination-select': {
                                    color: 'white',
                                },
                                '& .MuiTablePagination-selectIcon': {
                                    color: 'white',
                                },
                                '& .MuiTablePagination-actions': {
                                    '& .MuiIconButton-root': {
                                        color: 'white',
                                    },
                                    '& svg': {
                                        color: 'white',
                                    },
                                },
                            }}
                        />

                    </Paper>
                </Grid>





            </Grid>
        </Container >
    )
}

export default AdminDashboard
