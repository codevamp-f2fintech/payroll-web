import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface Organization {
  _id: string;
  name: string;
  description: string;
  email: string;
  contactNo: string;
  address: string[];
  branch: string[];
  image?: string;
  company_id: string;
  createdAt: Date;
}

interface OrganizationState {
  organizations: Organization[];
  filteredOrganizations: Organization[];
  loading: boolean;
  error: string | null;
}

const initialState: OrganizationState = {
  organizations: [],
  filteredOrganizations: [],
  loading: false,
  error: null,
};

// Async thunk to fetch all organizations
export const fetchOrganizations = createAsyncThunk<Organization[]>(
  "organization/fetchOrganizations",
  async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/organization-profile/get`);

    if (!response.ok) {
      throw new Error("Failed to fetch organizations");
    }

    return (await response.json()) as Organization[];
  }
);

const organizationSlice = createSlice({
  name: "organizations",
  initialState,
  reducers: {

    resetFilter: (state) => {
      state.filteredOrganizations = state.organizations;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.organizations = action.payload;
        state.filteredOrganizations = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export const { resetFilter } = organizationSlice.actions;
export default organizationSlice.reducer;
