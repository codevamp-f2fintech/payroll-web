import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface PreviousEmp {
  _id: string;
  name: string;
  designation: string;
  address: string;
  pan: string;
  financialYear: string;
  company_id: string
}

export interface HRA {
  _id: string;
  houseRent: string;
  landlordName: string;
  landlordAddress: string;
  proof: string | null;
  status: string;
}

export interface LTA {
  _id: string;
  travelAmount: string;
  travelDate: string;
  location: string;
  travelMode: string;
  proof: string | null;
  status: string;

}

export interface HouseLoanInterest {
  interestPayable: string;
  lenderName: string;
  lenderAddress: string;
  lenderPan: string;
  proof: string | null;
  status: string;

}

export interface Section80C {
  sectionname: string;
  name: string;
  amount: string;
  proof: string | null;
}

export interface Section80D {
  sectionname: string;
  name: string;
  amount: string;
  proof: string | null;
}
export interface Section80G {
  sectionname: string;
  name: string;
  amount: string;
  proof: string | null;
}
export interface Declarations {
  _id: string;
  taxRegime: string,
  PreviousEmp: PreviousEmp;
  hra: HRA;
  lta: LTA;
  HouseLoanInterest: HouseLoanInterest;
  Section80C: Section80C[];
  Section80D: Section80D[];
  Section80G: Section80G[];

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
      const { company_id } = typeof window !== "undefined" ? JSON.parse(localStorage?.getItem("user")) : {};

      if (typeof window !== "undefined") {
        token = localStorage?.getItem('token');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/my-declaration/get?page=${page}&limit=${limit}&keyword=${encodeURIComponent(keyword)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token} ${company_id}`,
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
