import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface ComponentType {
  _id: string;
  name: string;
  type: string;
  company_id: string;
  createdBy: string;
  createdAt: Date;
}

interface ComponentTypeState {
  componentTypes: ComponentType[];
  filteredComponentTypes: ComponentType[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: ComponentTypeState = {
  componentTypes: [],
  filteredComponentTypes: [],
  loading: false,
  error: null,
  total: 0,
};

export const fetchComponentTypes = createAsyncThunk<
  { componentTypes: ComponentType[]; total: number },
  { page?: number; limit?: number; keyword?: string }
>(
  'componentType/fetchComponentTypes',
  async ({ page = 1, limit = 10, keyword = '' }) => {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      const company_id = user ? JSON.parse(user).company_id : null;
      console.log('token', token)
      console.log('company_id', company_id)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/component-type/get?page=${page}&limit=${limit}&keyword=${encodeURIComponent(keyword)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token} ${company_id}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch component types');
      }

      const data = await response.json();
      return { componentTypes: data.componentTypes, total: data.total };
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }
);

const componentTypeSlice = createSlice({
  name: 'componentType',
  initialState,
  reducers: {
    filteredComponentTypes(state, action: PayloadAction<{ keyword: string }>) {
      const { keyword } = action.payload;
      state.filteredComponentTypes = state.componentTypes.filter((component) =>
        component.name.toLowerCase().includes(keyword.toLowerCase())
      );
    },
    resetComponentTypeFilter(state) {
      state.filteredComponentTypes = state.componentTypes;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComponentTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComponentTypes.fulfilled, (state, action) => {
        state.loading = false;
        console.log('action', action)
        state.componentTypes = action.payload.componentTypes;
        state.filteredComponentTypes = action.payload.componentTypes;
        state.total = action.payload.total;
      })
      .addCase(fetchComponentTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export const { filteredComponentTypes, resetComponentTypeFilter } = componentTypeSlice.actions;
export default componentTypeSlice.reducer;
