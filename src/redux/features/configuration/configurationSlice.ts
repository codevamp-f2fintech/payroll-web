import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface Configuration {
  declaration: {
    enabled: boolean;
    startDate: string;
    endDate: string;
  };
  proofSubmit: {
    enabled: boolean;
    startDate: string;
    endDate: string;
  };
}

interface ConfigurationState {
  configration: Configuration | null;
  loading: boolean;
  error: string | null;
}

const initialState: ConfigurationState = {
  configration: null,
  loading: false,
  error: null,
};

export const fetchConfiguration = createAsyncThunk<Configuration>(
  'configuration/fetchConfiguration',
  async () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const company_id = user ? JSON.parse(user).company_id : null;

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/window-configration/get`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token} ${company_id}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch configuration');
    }

    return (await response.json()) as Configuration;
  }
);

const configurationSlice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfiguration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfiguration.fulfilled, (state, action) => {
        state.configration = action.payload;
        state.loading = false;
      })
      .addCase(fetchConfiguration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default configurationSlice.reducer;
