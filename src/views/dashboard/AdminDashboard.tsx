import React, { useState, useMemo, useEffect } from 'react';
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
    Chip,
} from '@mui/material';
import {
    AttachMoney as AttachMoneyIcon,
    People as PeopleIcon,
    Calculate as CalculateIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import { employeesCountResponse } from '@/utility/apiResponse/employeesResponse';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchEmployees } from '@/redux/features/employees/employeesSlice';

// TypeScript Interfaces
interface Employee {
    id: number;
    name: string;
    email: string;
    department: string;
    position: string;
    salary: number;
    bonus: number;
    hireDate: Date;
    status: 'Active' | 'Inactive';
    netPay: number;
}

const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const positions = ['Junior', 'Senior', 'Lead', 'Manager', 'Director'];

const AdminDashboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const { employees, loading } = useSelector((state: RootState) => state.employees);

    // State Management
    // const [employees, setEmployees] = useState<Employee[]>([
    //     {
    //         id: 1,
    //         name: 'John Doe',
    //         email: 'john.doe@company.com',
    //         department: 'Engineering',
    //         position: 'Senior Engineer',
    //         salary: 75000,
    //         bonus: 5000,
    //         hireDate: new Date('2020-01-15'),
    //         status: 'Active',
    //         netPay: 80000
    //     },
    //     {
    //         id: 2,
    //         name: 'Jane Smith',
    //         email: 'jane.smith@company.com',
    //         department: 'Marketing',
    //         position: 'Marketing Manager',
    //         salary: 65000,
    //         bonus: 4000,
    //         hireDate: new Date('2019-06-20'),
    //         status: 'Active',
    //         netPay: 69000
    //     }
    // ]);

    // Dialog and Form States
    const [openAddEmployeeDialog, setOpenAddEmployeeDialog] = useState(false);
    const [openEditEmployeeDialog, setOpenEditEmployeeDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [totalEmployeesCount, setTotalEmployeesCount] = useState(0);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        dispatch(fetchEmployees({ page: page + 1, limit: rowsPerPage, search: searchTerm }));
    }, [dispatch, page, rowsPerPage, searchTerm]);

    useEffect(() => {
        const fetchEmployeeCount = async () => {
            try {
                const count = await employeesCountResponse();
                setTotalEmployeesCount(count); // Assuming the API returns an object with a `total` field
            } catch (error) {
                console.error('Failed to fetch total employees count:', error);
            }
        };

        fetchEmployeeCount();
    }, []);

    // Filtered and Paginated Employees
    const filteredEmployees = employees.filter(
        (emp) =>
            (!filterDepartment || emp.department === filterDepartment) &&
            (!searchTerm || emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // const paginatedEmployees = filteredEmployees.slice(
    //     page * rowsPerPage,
    //     page * rowsPerPage + rowsPerPage
    // );

    // Salary Distribution Chart Data
    const salaryDistributionData = departments.map(dept => ({
        department: dept,
        averageSalary: employees
            .filter(emp => emp.department === dept)
            .reduce((sum, emp) => sum + emp.salary, 0) /
            (employees.filter(emp => emp.department === dept).length || 1)
    }));

    // Export Functionality
    const handleExportEmployees = () => {
        const csvContent = [
            ['ID', 'Name', 'Email', 'Department', 'Position', 'Salary', 'Bonus', 'Hire Date', 'Status'],
            ...employees.map(emp => [
                emp.id,
                emp.name,
                emp.email,
                emp.department,
                emp.position,
                emp.salary,
                emp.bonus,
                emp.hireDate.toLocaleDateString(),
                emp.status
            ])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "employees_payroll.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Calculation Helpers
    const calculateTotalPayroll = () => {
        return employees.reduce((total, emp) => total + emp.netPay, 0);
    };

    const calculateAverageSalary = () => {
        return employees.reduce((total, emp) => total + emp.salary, 0) / employees.length;
    };

    // Render Methods
    const renderEmployeeDialog = (isEdit: boolean) => (
        <Dialog
            open={isEdit ? openEditEmployeeDialog : openAddEmployeeDialog}
            onClose={() => isEdit ? setOpenEditEmployeeDialog(false) : setOpenAddEmployeeDialog(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>{isEdit ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {/* Detailed Form Fields */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={isEdit ? selectedEmployee?.name : ''}
                            onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, name: e.target.value } : null)}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Email"
                            value={isEdit ? selectedEmployee?.email : ''}
                            onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, email: e.target.value } : null)}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Select
                            fullWidth
                            value={isEdit ? selectedEmployee?.department : ''}
                            label="Department"
                            onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, department: e.target.value as string } : null)}
                        >
                            {departments.map(dept => (
                                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Select
                            fullWidth
                            value={isEdit ? selectedEmployee?.position : ''}
                            label="Position"
                            onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, position: e.target.value as string } : null)}
                        >
                            {positions.map(pos => (
                                <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    {/* More fields... */}
                </Grid>
            </DialogContent>
        </Dialog>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Payroll Management Dashboard
            </Typography>

            {/* Search and Filter */}
            <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
                <TextField
                    variant="outlined"
                    placeholder="Search Employees"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon />
                    }}
                />
                <Select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    displayEmpty
                >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map(dept => (
                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                </Select>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportEmployees}
                >
                    Export
                </Button>
            </Box>

            {/* Dashboard Grid */}
            <Grid container spacing={3}>
                {/* Overview Cards */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardHeader
                            avatar={<PeopleIcon color="primary" />}
                            title="Total Employees"
                        />
                        <CardContent>
                            <Typography variant="h5">
                                {totalEmployeesCount}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardHeader
                            avatar={<AttachMoneyIcon color="success" />}
                            title="Total Payroll"
                        />
                        <CardContent>
                            <Typography variant="h5">
                                ${calculateTotalPayroll().toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardHeader
                            avatar={<CalculateIcon color="secondary" />}
                            title="Average Salary"
                        />
                        <CardContent>
                            <Typography variant="h5">
                                ${calculateAverageSalary().toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Salary Distribution Chart */}
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title="Salary Distribution by Department" />
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={salaryDistributionData}>
                                    <XAxis dataKey="department" />
                                    <YAxis />
                                    <ChartTooltip />
                                    <Bar dataKey="averageSalary" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Employee List */}
                <Grid item xs={12}>
                    <Paper sx={{ width: '100%', mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                            <Typography variant="h6">Employee Payroll</Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenAddEmployeeDialog(true)}
                            >
                                Add Employee
                            </Button>
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Position</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {employees.slice(
                                        page * rowsPerPage,
                                        page * rowsPerPage + rowsPerPage
                                    ).map((employee) => (
                                        <TableRow key={employee._id}>
                                            <TableCell>
                                                {employee.first_name} {employee.last_name}
                                            </TableCell>
                                            <TableCell>{employee.email}</TableCell>
                                            <TableCell>{employee.designation}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={employee.status}
                                                    color={
                                                        employee.status === 'Active'
                                                            ? 'success'
                                                            : 'default'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => {
                                                            setSelectedEmployee(employee);
                                                            setOpenEditEmployeeDialog(true);
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => dispatch(deleteEmployee(employee._id))}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={employees.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(parseInt(event.target.value, 10));
                                setPage(0);
                            }}
                        />
                    </Paper>
                </Grid>
            </Grid>

            {/* Dialogs */}
            {renderEmployeeDialog(false)}
            {renderEmployeeDialog(true)}
        </Container>
    );
};

export default AdminDashboard;
