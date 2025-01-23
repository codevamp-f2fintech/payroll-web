import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface EPF {
  EPFNumber: string;
  DeductionCycle: string;
  EmployeeRate: string;
  EmployerRate: string;
}

export interface ESI {
  ESINumber: string;
  DeductionCycle: string;
  EmployeeRate: string;
  EmployerRate: string;
}

export interface Bonus {
  paymentFrequency: string;
  bonusPercentage: string;
  paymentMonth: string;
}

export interface StatutoryComponent {
  _id: string;
  employeeId: string;
  EPF: EPF;
  ESI: ESI;
  Bonus: Bonus;
  employee: string; // Assuming employee is an ObjectId string reference
}

interface StatutoryComponentState {
  components: StatutoryComponent[];
  loading: boolean;
  error: string | null;
}

const initialState: StatutoryComponentState = {
  components: [],
  loading: false,
  error: null,
};

export const fetchStatutoryComponents = createAsyncThunk<
  StatutoryComponent[]
>("statutoryComponents/fetchStatutoryComponents", async () => {
  try {
    let token: string | null = null;

    if (typeof window !== "undefined") {
      token = localStorage?.getItem('token');
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/statutory-components/get`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Statutory Components");
    }

    const data = await response.json();
    console.log("data", data)
    return data; // Assuming the response is an array of StatutoryComponent
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
});

const statutoryComponentSlice = createSlice({
  name: "statutoryComponent",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatutoryComponents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatutoryComponents.fulfilled, (state, action) => {
        state.loading = false;
        state.components = action.payload;
        console.log('component', action.payload)
      })
      .addCase(fetchStatutoryComponents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
        console.error('Reducer error:', action.error);
      });
  },
});

export default statutoryComponentSlice.reducer;
