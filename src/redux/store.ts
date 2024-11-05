// store.ts (for TypeScript)

import { configureStore } from '@reduxjs/toolkit';

import teamsReducer from './features/teams/teamsSlice';
import holidaysReducer from './features/holidays/holidaysSlice';
import policiesReducer from './features/policies/policiesSlice'
import timesheetsReducer from './features/timesheet/timesheetSlice';
import punchSheetReducer from '@/redux/features/punches/punchesSlice'
import queryReducer from '@/redux/features/queries/queriesSlice'

const store = configureStore({
  reducer: {
    // Add your reducers here
    teams: teamsReducer,
    holidays: holidaysReducer,
    policies: policiesReducer,
    timesheets: timesheetsReducer,
    punches: punchSheetReducer,
    queries: queryReducer
  }
})


export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
