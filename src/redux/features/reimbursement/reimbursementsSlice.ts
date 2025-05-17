import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface Reimbursement {
  _id: string;
  reimbursements: string;
  amount: number;
  date: Date;
  proof: File | null;
  status: string,
  description: string;
  createdBy: string;
  createdAt: Date;
}

interface ReimbursementState {
  reimbursements: Reimbursement[];
  filteredReimbursements: Reimbursement[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: ReimbursementState = {
  reimbursements: [],
  filteredReimbursements: [],
  loading: false,
  error: null,
  total: 0,
};

export const fetchReimbursements = createAsyncThunk<{
  reimbursements: Reimbursement[];
  total: number;
}, { page?: number; limit?: number; keyword?: string }>(
  "reimbursements/fetchReimbursements",
  async ({ page = 1, limit = 10, keyword = "" }) => {
    try {
      let token: string | null = null;
      const { company_id } = typeof window !== "undefined" ? JSON.parse(localStorage?.getItem("user")) : {};

      // Retrieve token from localStorage if running in the browser
      if (typeof window !== "undefined") {
        token = localStorage?.getItem("token");
      }

      console.log("Fetching reimbursements with token:", token);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/reimbursements/get?page=${page}&limit=${limit}&keyword=${encodeURIComponent(
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
        throw new Error("Failed to fetch reimbursements");
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

const reimbursementSlice = createSlice({
  name: "reimbursements",
  initialState,
  reducers: {
    resetFilter(state) {
      state.filteredReimbursements = state.reimbursements;
    },
    filterByKeyword(state, action) {
      const keyword = action.payload.toLowerCase();
      state.filteredReimbursements = state.reimbursements.filter((reimbursement) =>
        JSON.stringify(reimbursement).toLowerCase().includes(keyword)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReimbursements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReimbursements.fulfilled, (state, action) => {
        state.loading = false;
        state.reimbursements = action.payload.reimbursements;
        state.total = action.payload.total || 0;
        state.filteredReimbursements = action.payload.reimbursements || [];
      })
      .addCase(fetchReimbursements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
        console.error("Reducer error:", action.error);
      });
  },
});

export const { resetFilter, filterByKeyword } = reimbursementSlice.actions;
export default reimbursementSlice.reducer;
