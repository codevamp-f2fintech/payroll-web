import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface BasicInfo {
  _id: string;
  name: string;
  designation: string;
  address: string;
  pan: string;
  financialYear: string;
}

export interface HRA {
  _id: string;
  houseRent: string;
  landlordName: string;
  landlordAddress: string;
  proof: string | null;
}

export interface LTA {
  _id: string;
  travelAmount: string;
  travelDate: string;
  location: string;
  travelMode: string;
  proof: string | null;
}

export interface Deduction {
  interestPayable: string;
  lenderName: string;
  lenderAddress: string;
  lenderPan: string;
  proof: string | null;
}

export interface DeductionUnder {
  sectionname: string;
  name: string;
  amount: string;
  proof: string | null;
}

export interface Declarations {
  _id: string;
  basicInfo: BasicInfo;
  hra: HRA;
  lta: LTA;
  deductions: Deduction;
  deductionsunder: DeductionUnder[];
}

interface DeclarationState {
  declarations: Declarations[];
  filteredDeclarations: Declarations[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: DeclarationState = {
  declarations: [],
  filteredDeclarations: [],
  loading: false,
  error: null,
  total: 0,
};

export const fetchDeclarations = createAsyncThunk<{
  declarations: Declarations[];
  total: number;
}, { page?: number; limit?: number; keyword?: string }>(
  "declarations/fetchDeclarations",
  async ({ page = 1, limit = 10, keyword = "" }) => {
    try {
      let token: string | null = null;

      if (typeof window !== "undefined") {
        token = localStorage?.getItem('token');
      }

      console.log('Fetching with token:', token);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/my-declaration/get?page=${page}&limit=${limit}&keyword=${encodeURIComponent(keyword)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Declarations");
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
);

const declarationSlice = createSlice({
  name: "declaration",
  initialState,
  reducers: {
    resetFilter(state) {
      state.filteredDeclarations = state.declarations;
    },
    filterByKeyword(state, action) {
      const keyword = action.payload.toLowerCase();
      state.filteredDeclarations = state.declarations.filter((declaration) =>
        JSON.stringify(declaration).toLowerCase().includes(keyword)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeclarations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeclarations.fulfilled, (state, action) => {
        state.loading = false;
        state.declarations = action.payload.declaration
        state.total = action.payload.total || 0;
        state.filteredDeclarations = action.payload.declarations || [];
      })
      .addCase(fetchDeclarations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
        console.error('Reducer error:', action.error);
      });
  },
});

export const {
  resetFilter,
  filterByKeyword,
} = declarationSlice.actions;
export default declarationSlice.reducer;
