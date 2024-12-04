import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface Payroll {
  employee: {
    _id: string;
    first_name: string;
    last_name: string;
    code: string;
    designation: string;
    email: string;
    image: string;
  };
  salaryTemplate: {
    _id: string;
    name: string;
    baseSalary: number;
    earningTypes: {
      _id: string;
      salarytype: string;
      type: string;
      amount: number;
      description: string;
    }[];
    deductionTypes: {
      _id: string;
      salarytype: string;
      type: string;
      amount: number;
      description: string;
    }[];
    description: string;
  };
  status: string;
  processedBy: string;
  netSalary: number;
  createdAt: string
}

interface PayrollState {
  payrolls: Payroll[];
  loading: boolean;
  error: string | null;
  total: number;
  filteredByEmployee: Payroll[];
  employeePayrollsByYear: Payroll[];
}

const initialState: PayrollState = {
  payrolls: [],
  loading: false,
  error: null,
  total: 0,
  filteredByEmployee: [],
  employeePayrollsByYear: [],
};

export const fetchPayrolls = createAsyncThunk<{
  data: any;
  payrolls: Payroll[];
  total: number;
}, { page?: number; limit?: number; keyword?: string; month?: number; year?: number }>(
  'payroll/fetchPayrolls',
  async ({ page, limit, keyword, month, year }: { page: number; limit: number; keyword: string; month?: number; year?: number }) => {
    const queryParams = new URLSearchParams();

    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (keyword) queryParams.append('keyword', encodeURIComponent(keyword));
    if (month) queryParams.append('month', month.toString());
    if (year) queryParams.append('year', year.toString());

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/payroll/get?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch payrolls');
    }
    return (await response.json()) as { payrolls: Payroll[], total: number };
  }
);

export const fetchPayrollsByEmployeeId = createAsyncThunk<
  { data: Payroll[]; total: number },
  { employeeId: string; page?: number; limit?: number; month?: number; year?: number }
>(
  'payroll/fetchPayrollsByEmployeeId',
  async ({ employeeId, page, limit, month, year }: { employeeId: string; page?: number; limit?: number; month?: number; year?: number }) => {
    if (!employeeId) {
      throw new Error('Employee ID is required');
    }

    const queryParams = new URLSearchParams();

    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (month) queryParams.append('month', month.toString()); // Append month if provided
    if (year) queryParams.append('year', year.toString()); // Append year if provided

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/payroll/by-employee/${employeeId}?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch payrolls by employee ID');
    }

    return (await response.json()) as { data: Payroll[]; total: number };
  }
);

export const fetchPayrollByEmployeeIdAndYear = createAsyncThunk<{
  data: Payroll[];
  total: number;
}, { employeeId: string; year: number; page?: number; limit?: number }>(
  'payroll/fetchPayrollByEmployeeIdAndYear',
  async ({ employeeId, year, page = 1, limit = 10 }: { employeeId: string; year: number; page: number; limit: number }) => {
    if (!employeeId) {
      throw new Error('Employee ID is required');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    queryParams.append('year', year.toString());

    // Call the API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/payroll/employee/${employeeId}/year/${year}?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch payroll by employee ID and year');
    }

    return (await response.json()) as { data: Payroll[]; total: number };
  }
);




const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrolls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPayrolls.fulfilled, (state, action) => {
        state.payrolls = action.payload.data;
        state.total = action.payload.total;
        state.loading = false;
      })

      .addCase(fetchPayrolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      })

      .addCase(fetchPayrollsByEmployeeId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrollsByEmployeeId.fulfilled, (state, action) => {
        state.filteredByEmployee = action.payload.data; // Populate filtered payrolls
        state.total = action.payload.total;
        state.loading = false;
      })
      .addCase(fetchPayrollsByEmployeeId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
      })

      .addCase(fetchPayrollByEmployeeIdAndYear.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrollByEmployeeIdAndYear.fulfilled, (state, action) => {
        state.employeePayrollsByYear = action.payload.data; // Populate the new payroll state
        state.total = action.payload.total;
        state.loading = false;
      })
      .addCase(fetchPayrollByEmployeeIdAndYear.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      });

  }
});

export default payrollSlice.reducer;
