import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface Payroll {
  employeeId: string;
  salaryTemplate: string;
  status: string;
  processedBy: string;
}

interface PayrollState {
  payrolls: Payroll[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: PayrollState = {
  payrolls: [],
  loading: false,
  error: null,
  total: 0,
};

export const fetchPayrolls = createAsyncThunk<{
  data: any;
  payrolls: Payroll[];
  total: number;
}, { page?: number; limit?: number; keyword?: string }>(
  'payroll/fetchPayrolls',
  async ({ page, limit, keyword }: { page: number; limit: number; keyword: string }) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/payroll/get?page=${page}&limit=${limit}&keyword=${encodeURIComponent(
        keyword
      )}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch payrolls');
    }

    return (await response.json()) as { payrolls: Payroll[], total: number };
  }
)

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
  }
});

export default payrollSlice.reducer;
