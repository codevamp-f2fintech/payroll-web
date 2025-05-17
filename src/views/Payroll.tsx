"use client"
import AddPayrollForm from "@/components/payroll/Payroll.Form";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  Paper,
  Container,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchPayrollByEmployeeIdAndYear, fetchPayrolls } from "@/redux/features/payroll/payrollSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { debounce } from "lodash";

const PayrollGrid = () => {
  const dispatch: AppDispatch = useDispatch();
  const { payrolls, total, employeePayrollsByYear } = useSelector((state: RootState) => state.payrolls);
  const [selectedPayrolls, setSelectedPayrolls] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);


  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role;
  const userId = user?.id;


  const rows = userRole === "1" ? payrolls : employeePayrollsByYear;

  const debouncedFetch = useCallback(
    debounce(() => {
      const params = {
        page,
        limit,
        keyword: selectedKeyword,
        year: selectedYear,
        month: selectedMonth,
      };

      console.log("Fetching payrolls with params:", params);

      if (userRole === "1") {
        dispatch(fetchPayrolls(params));
      } else {
        dispatch(
          fetchPayrollByEmployeeIdAndYear({
            employeeId: userId,
            year: selectedYear,
            page,
            limit,
            keyword: selectedKeyword,
          })
        );
      }
    }, 300),
    [page, limit, selectedKeyword, userRole, userId, selectedYear, selectedMonth]
  );

  useEffect(() => {
    debouncedFetch();
    return () => debouncedFetch.cancel();
  }, [page, limit, selectedKeyword, debouncedFetch]);

  const handlePayPeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const [year, month] = value.split("-");
    setSelectedYear(parseInt(year, 10));
    setSelectedMonth(parseInt(month, 10));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedKeyword(e.target.value);
  };

  const handlePaginationModelChange = (params: { page: number; pageSize: number }) => {
    setPage(params.page + 1);
    setLimit(params.pageSize);
    debouncedFetch();
  };

  const handleAddClick = () => {
    setSelectedPayrolls(null);
    setShowForm(true);
  };

  const handleEditClick = (id: SetStateAction<null>) => {
    setSelectedPayrolls(id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const generateColumns = useMemo(() => {
    const columns: GridColDef[] = [
      ...(userRole === "1"
        ? [
          {
            field: "employeeId",
            headerName: "Employee",
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {
              const employee = params.row.employee;
              return employee ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src={employee.image}
                    alt={`${employee.first_name} ${employee.last_name}`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      marginRight: 10,
                      objectFit: "cover",
                    }}
                  />
                  <Typography variant="body2">
                    {employee.first_name} {employee.last_name}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2">N/A</Typography>
              );
            },
          },
        ]
        : []),
      {
        field: "salaryTemplate",
        headerName: "Salary Template",
        flex: 1,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => {
          const name = params.row.salaryTemplate.name
          return (
            <Typography>
              {name}
            </Typography>
          )
        }
      },
      {
        field: "grossEarnings",
        headerName: "GrossEarning",
        flex: 1,
        headerAlign: "center",
        align: "center",

      },
      {
        field: "totalDeductions",
        headerName: "totalDeduction",
        flex: 1,
        headerAlign: "center",
        align: "center",

      },
      {
        field: "netSalary",
        headerName: "Net Salary",
        flex: 1,
        headerAlign: "center",
        align: "center",
        // renderCell: (params) => (
        //   <Typography
        //     variant="body2"
        //     sx={{
        //       fontWeight: "bold",
        //       color: "text.primary",
        //       display: "flex",
        //       alignItems: "center",
        //       gap: 0.5,
        //     }}
        //   >
        //     <span style={{ fontSize: "1rem" }}>₹</span>
        //     {params.value?.toLocaleString("en-IN", {
        //       minimumFractionDigits: 2,
        //       maximumFractionDigits: 2,
        //     })}
        //   </Typography>
        // ),
      },
      {
        field: "processedBy",
        headerName: "Processed By",
        flex: 1,
        headerAlign: "center",
        align: "center",
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => {
          const statusColors = {
            pending: { bg: "warning.light", color: "white" },
            paid: { bg: "success.light", color: "white" },
            processed: { bg: "info.light", color: "white" },
            default: { bg: "grey.200", color: "grey.800" },
          };

          const statusValue = params.value?.toLowerCase() || "default";
          const { bg, color } = statusColors[statusValue] || statusColors.default;

          return (
            <Typography
              variant="body2"
              sx={{
                backgroundColor: bg,
                color,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                textTransform: "capitalize",
                fontWeight: "medium",
              }}
            >
              {params.value}
            </Typography>
          );
        },
      },
    ];

    if (userRole === "1") {
      columns.push({
        field: "edit",
        headerName: "Actions",
        sortable: false,
        flex: 1,
        headerAlign: "center",
        align: "center",
        renderCell: ({ row: { _id } }) => (
          <Button
            sx={{ background: "#2e7d32" }}
            variant="contained"
            onClick={() => handleEditClick(_id)}
          >
            Edit
          </Button>
        ),
      });
    }

    return columns;
  }, [userRole]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <ToastContainer position="top-center" />

      <Dialog open={showForm} onClose={handleCloseForm} fullWidth maxWidth="md">
        <DialogContent>
          <AddPayrollForm
            payrolls={payrolls}
            payroll={selectedPayrolls}
            handleClose={handleCloseForm}
            debouncedFetch={debouncedFetch}
            page={page}
            limit={limit}
            selectedKeyword={selectedKeyword}
          />
        </DialogContent>
      </Dialog>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography style={{ fontSize: "2em" }} variant="h5" gutterBottom>
            Payroll
          </Typography>
          <Typography style={{ fontSize: "1em", fontWeight: "bold" }} variant="subtitle1" gutterBottom>
            Dashboard / Payroll
          </Typography>
        </Box>
        {userRole === "1" && (
          <Box display="flex" alignItems="center">
            <Button
              style={{ borderRadius: 50, backgroundColor: "#2e7d32" }}
              variant="contained"
              color="warning"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add Payroll
            </Button>
          </Box>
        )}
      </Box>
      <Grid container spacing={6} alignItems="center" mb={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search"
            variant="outlined"
            value={selectedKeyword}
            onChange={handleInputChange}
            InputProps={{
              sx: { borderRadius: "50px" },
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Paper>
        <DataGrid
          getRowHeight={() => "auto"}
          sx={{
            height: 600,
            "& .super-app-theme--header": {
              fontSize: 15,
              fontWeight: 600,
              alignItems: "center",
            },
            "& .mui-yrdy0g-MuiDataGrid-columnHeaderRow": {
              background: "#2e7d32 !important",
              color: "white",
            },
            "& .MuiDataGrid-cell": {
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            "& .MuiDataGrid-row": {
              "&:nth-of-type(even)": {
                backgroundColor: "action.hover",
              },
              "&:hover": {
                backgroundColor: "action.selected",
              },
            },
          }}
          rows={rows}
          columns={generateColumns}
          getRowId={(row) => row._id}
          paginationMode="server"
          rowCount={total}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[10, 20, 30]}
          paginationModel={{ page: page - 1, pageSize: limit }}
        />
      </Paper>
    </Container>
  );
};

export default PayrollGrid;
