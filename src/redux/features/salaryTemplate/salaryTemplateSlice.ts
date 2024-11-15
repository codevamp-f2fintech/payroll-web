import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface SalaryTemplate {
  _id: string;
  name: string;
  baseSalary: number;
  earningTypes: string[];
  deductionTypes: string[];
  description: string;
  createdBy: string;
  createdAt: Date;
}

interface SalaryTemplateState {
  salaryTemplates: SalaryTemplate[];
  filteredSalaryTemplate: SalaryTemplate[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: SalaryTemplateState = {
  salaryTemplates: [],
  filteredSalaryTemplate: [],
  loading: false,
  error: null,
  total: 0,
};

export const fetchSalaryTemplates = createAsyncThunk<{
  salaryTemplates: SalaryTemplate[];
  total: number;
}, { page?: number; limit?: number; keyword?: string }>(
  'salaryTemplate/fetchSalaryTemplate',
  async ({ page, limit, keyword }: { page: number; limit: number; keyword: string }) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/salary-template/get?page=${page}&limit=${limit}&keyword=${encodeURIComponent(
        keyword
      )}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch salaryTemplates');
    }

    return (await response.json()) as { salaryTemplates: SalaryTemplate[], total: number };
  }
)

const salaryTemplatesSlice = createSlice({
  name: 'salaryTemplates',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchSalaryTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchSalaryTemplates.fulfilled, (state, action) => {
        state.salaryTemplates = action.payload.data;
        state.total = action.payload.total;
        state.loading = false;
      })

      .addCase(fetchSalaryTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      })
  }
});

export const { filteredSalaryTemplate, resetFilter } = salaryTemplatesSlice.actions;
export default salaryTemplatesSlice.reducer;
