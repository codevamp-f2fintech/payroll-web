import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface SalaryComponent {
  _id: string;
  salarytype: string;
  type: string;
  calculationtype: string,
  amount: number;
  description: string;
  company_id: string,
  otherType: string;
  createdBy: string;
  createdAt: Date;
}

interface SalaryComponentState {
  salaryComponents: SalaryComponent[];
  filteredSalaryComponent: SalaryComponent[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: SalaryComponentState = {
  salaryComponents: [],
  filteredSalaryComponent: [],
  loading: false,
  error: null,
  total: 0,
};

export const fetchSalaryComponents = createAsyncThunk<{
  salaryComponents: SalaryComponent[];
  total: number;
}, { page?: number; limit?: number; keyword?: string }>(
  'salaryTemplate/fetchSalaryComponent',
  async ({ page, limit, keyword }: { page: number; limit: number; keyword: string }) => {

    let token: string | null = null;
    const { company_id } = typeof window !== "undefined" ? JSON.parse(localStorage?.getItem("user")) : {};

    if (typeof window !== "undefined") {
      token = localStorage?.getItem("token");
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/salary-component/get?page=${page}&limit=${limit}&keyword=${encodeURIComponent(keyword)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token} ${company_id}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch SalaryComponent');
    }

    return (await response.json()) as { salaryComponents: SalaryComponent[], total: number };
  }
)

const SalaryComponentSlice = createSlice({
  name: 'salaryComponents',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchSalaryComponents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchSalaryComponents.fulfilled, (state, action) => {
        state.salaryComponents = action.payload.salaryComponents;
        state.total = action.payload.total;
        state.loading = false;
      })

      .addCase(fetchSalaryComponents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      })
  }
});

export const { filteredSalaryComponent, resetFilter } = SalaryComponentSlice.actions;
export default SalaryComponentSlice.reducer;
