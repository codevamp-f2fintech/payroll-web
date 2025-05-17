import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface Loan {
  _id: string;
  loantype: string;
  amount: number;
  date: Date;
  proof: File | null; // File or null for proof
  reason: string;
  repaymentdate: Date;
  instalment: number;
  isExempt: boolean;
  perquisiteRate?: number;
  status: string;
  createdAt: Date;
  createdBy: string;
}

interface LoanState {
  loans: Loan[];
  filteredLoans: Loan[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: LoanState = {
  loans: [],
  filteredLoans: [],
  loading: false,
  error: null,
  total: 0,
};

export const fetchLoans = createAsyncThunk<{
  loans: Loan[];
  total: number;
}, { page?: number; limit?: number; keyword?: string }>(
  "loans/fetchLoans",
  async ({ page = 1, limit = 10, keyword = "" }) => {
    try {
      let token: string | null = null;
      const { company_id } = typeof window !== "undefined" ? JSON.parse(localStorage?.getItem("user")) : {};

      // Retrieve token from localStorage if running in the browser
      if (typeof window !== "undefined") {
        token = localStorage?.getItem("token");
      }

      console.log("Fetching loans with token:", token);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/loan/get?page=${page}&limit=${limit}&keyword=${encodeURIComponent(
          keyword
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token} ${company_id}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch loans");
      }

      const data = await response.json();
      console.log("API Response:", data);
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }
);

const loanSlice = createSlice({
  name: "loans",
  initialState,
  reducers: {
    resetFilter(state) {
      state.filteredLoans = state.loans;
    },
    filterByKeyword(state, action) {
      const keyword = action.payload.toLowerCase();
      state.filteredLoans = state.loans.filter((loan) =>
        JSON.stringify(loan).toLowerCase().includes(keyword)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.loading = false;
        state.loans = action.payload.loans;
        state.total = action.payload.total || 0;
        state.filteredLoans = action.payload.loans || [];
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
        console.error("Reducer error:", action.error);
      });
  },
});

export const { resetFilter, filterByKeyword } = loanSlice.actions;
export default loanSlice.reducer;
